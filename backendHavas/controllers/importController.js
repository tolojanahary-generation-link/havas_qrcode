// ============================================================
// Import Controller — Excel import business logic
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import XLSX from 'xlsx';
import fs from 'fs';
import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as qrcodeService from '../services/qrcodeService.js';
import * as importService from '../services/importService.js';
import * as auditService from '../services/auditService.js';
import { isSuperAdmin } from '../utils/tenantHelper.js';

const QR_BASE_URL = process.env.QR_BASE_URL || 'http://localhost:3000/api/scan';

/**
 * POST /api/import/upload
 * Upload an Excel file for processing
 */
export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier n\'a été fourni.', [], 400);
    }

    return success(res, 'Fichier téléchargé avec succès.', {
      fichier: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/import/validate
 * Validate the contents of an uploaded Excel file
 * Body: { filename }
 */
export const validateExcel = async (req, res, next) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return error(res, 'Le nom du fichier est requis.', [], 400);
    }

    const filePath = req.body.filePath || `${process.cwd()}/uploads/excel/${filename}`;

    if (!fs.existsSync(filePath)) {
      return error(res, 'Fichier non trouvé.', [], 404);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return error(res, 'Le fichier Excel est vide.', [], 400);
    }

    // Required columns (collaboratorId is optional now)
    const requiredColumns = ['name', 'destinationUrl', 'type'];
    const headers = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      return error(
        res,
        'Colonnes manquantes dans le fichier Excel.',
        missingColumns.map((col) => ({ field: col, message: `La colonne "${col}" est requise` })),
        400
      );
    }

    // Validate each row
    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const rowErrors = [];

      if (!row.name) rowErrors.push('Le nom est requis');
      if (!row.destinationUrl) rowErrors.push('L\'URL de destination est requise');
      if (!row.type || !['static', 'dynamic'].includes(row.type)) {
        rowErrors.push('Le type doit être "static" ou "dynamic"');
      }
      if (row.collaboratorId && isNaN(parseInt(row.collaboratorId, 10))) {
        rowErrors.push('L\'identifiant du collaborator doit être un nombre');
      }

      if (rowErrors.length > 0) {
        invalidRows.push({ row: rowNum, data: row, errors: rowErrors });
      } else {
        validRows.push({ row: rowNum, data: row });
      }
    }

    return success(res, 'Validation du fichier terminée.', {
      totalLignes: rows.length,
      lignesValides: validRows.length,
      lignesInvalides: invalidRows.length,
      aperçu: validRows.slice(0, 5).map((r) => r.data),
      erreurs: invalidRows,
      colonnes: headers,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/import/execute
 * Process validated Excel data and create QR codes
 * Body: { filename }
 */
export const importExcel = async (req, res, next) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return error(res, 'Le nom du fichier est requis.', [], 400);
    }

    const filePath = req.body.filePath || `${process.cwd()}/uploads/excel/${filename}`;

    if (!fs.existsSync(filePath)) {
      return error(res, 'Fichier non trouvé.', [], 404);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let errorCount = 0;
    const importErrors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        // Validate row
        if (!row.name || !row.destinationUrl || !row.type) {
          throw new Error('Données incomplètes');
        }

        if (!['static', 'dynamic'].includes(row.type)) {
          throw new Error(`Type invalide : "${row.type}"`);
        }

        const uuid = uuidv4();
        const redirectUrl = row.type === 'dynamic' ? `${QR_BASE_URL}/${uuid}` : row.destinationUrl;

        // Determine final collaboratorId based on role
        const finalCollaboratorId = isSuperAdmin(req.user) 
          ? (row.collaboratorId ? parseInt(row.collaboratorId, 10) : null)
          : req.user.collaboratorId;

        await qrcodeService.createQRCode({
          uuid,
          name: String(row.name),
          description: row.description ? String(row.description) : null,
          type: row.type,
          destinationUrl: String(row.destinationUrl),
          redirectUrl,
          color: row.color || '#000000',
          backgroundColor: row.backgroundColor || '#FFFFFF',
          logo: row.logo || null,
          collaboratorId: finalCollaboratorId,
          folderId: row.folderId ? parseInt(row.folderId, 10) : null,
        });

        successCount++;
      } catch (rowError) {
        errorCount++;
        importErrors.push({ row: rowNum, message: rowError.message });
      }
    }

    // Create import history record
    await importService.createImportHistory({
      filename: filename,
      totalRows: rows.length,
      successRows: successCount,
      errorRows: errorCount,
      status: errorCount === 0 ? 'completed' : 'partial',
      errors: importErrors.length > 0 ? JSON.stringify(importErrors) : null,
      userId: req.user.id,
    });

    // Clean up the uploaded file
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }

    // Audit log
    await auditService.createLog({
      action: 'IMPORT',
      entity: 'QRCode',
      entityId: 0,
      description: `Import de ${successCount}/${rows.length} QR codes depuis "${filename}"`,
      userId: req.user.id,
    });

    return success(res, 'Import terminé.', {
      totalLignes: rows.length,
      réussies: successCount,
      échouées: errorCount,
      erreurs: importErrors,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/import/history
 * Get import history for the current user
 * Query params: page, limit, sortBy, sortOrder
 */
export const importHistory = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'filename', 'totalRows'], 'createdAt', 'desc');

    const filters = { userId: req.user.id };

    const { imports, total } = await importService.getImportHistories(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Historique des imports récupéré avec succès.', { imports }, meta);
  } catch (err) {
    next(err);
  }
};
