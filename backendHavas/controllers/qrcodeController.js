// ============================================================
// QRCode Controller — QR code management business logic
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import QRCodeLib from 'qrcode';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import { getUploadPath } from '../utils/fileHelper.js';
import * as qrcodeService from '../services/qrcodeService.js';
import * as auditService from '../services/auditService.js';
import { scopeFilters, isSuperAdmin, canAccessResource, canModifyResource } from '../utils/tenantHelper.js';

const QR_BASE_URL = process.env.QR_BASE_URL || 'http://localhost:3000/api/scan';

/**
 * Build the redirect URL for a QR code
 * @param {string} uuid - QR code UUID
 * @returns {string} Full redirect URL
 */
const buildRedirectUrl = (uuid) => `${QR_BASE_URL}/${uuid}`;

/**
 * POST /api/qrcodes
 * Create a new QR code (static or dynamic)
 */
export const createQRCode = async (req, res, next) => {
  try {
    const {
      name, description, folderId, logo, destinationUrl
    } = req.body;

    const uuid = uuidv4();

    const qrCode = await qrcodeService.createQRCode({
      uuid,
      name,
      description: description || null,
      logo: logo || null,
      folderId: parseInt(folderId, 10), // folderId is now required
      destinations: {
        create: {
          title: "Lien par défaut",
          url: destinationUrl,
        }
      }
    });

    // Audit log
    await auditService.createLog({
      action: 'CREATE',
      entity: 'QRCode',
      entityId: qrCode.id,
      description: `Création du QR code "${name}"`,
      userId: req.user.id,
      qrCodeId: qrCode.id,
    });

    return success(res, 'QR code créé avec succès.', { qrCode }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/qrcodes/bulk
 * Create multiple QR codes from an uploaded Excel file
 */
export const createBulkQRCodesFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'Aucun fichier Excel n\'a été fourni.', [], 400);
    }

    const filePath = req.file.path;

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return error(res, 'Le fichier Excel est vide.', [], 400);
    }

    // Validate required columns
    const requiredColumns = ['name', 'destinationUrl'];
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

    // Process each row
    const qrCodesData = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      // Validate row
      if (!row.name || !row.destinationUrl) {
        errors.push({ row: rowNum, message: 'Données incomplètes (name, destinationUrl manquants)' });
        continue;
      }

      const uuid = uuidv4();

      qrCodesData.push({
        uuid,
        name: String(row.name),
        description: row.description ? String(row.description) : null,
        logo: row.logo || null,
        folderId: row.folderId ? parseInt(row.folderId, 10) : null,
        destinations: {
            create: {
                title: "Lien par défaut",
                url: row.destinationUrl
            }
        }
      });
    }

    if (qrCodesData.length === 0) {
      return error(res, 'Aucune ligne valide dans le fichier.', errors, 400);
    }

    // Bulk create
    const createdQRCodes = await qrcodeService.createManyQRCodes(qrCodesData);

    // Clean up the uploaded file
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }

    return success(res, 'QR codes créés en masse avec succès.', {
      totalTraitées: rows.length,
      créés: createdQRCodes.length,
      erreurs: errors.length,
      détailsErreurs: errors,
    }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/qrcodes
 * Get all QR codes with pagination, filtering, and sorting
 * Query params: page, limit, search, type, collaboratorId, folderId, isActive, sortBy, sortOrder
 */
export const getQRCodes = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(
      req.query,
      ['createdAt', 'name', 'type'],
      'createdAt',
      'desc'
    );

    // Build filters
    const filters = scopeFilters(req.user, {});

    if (req.query.search) {
      filters.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
        { uuid: { contains: req.query.search, mode: 'insensitive' } },
        { destinations: { some: { url: { contains: req.query.search, mode: 'insensitive' } } } },
      ];
    }

    // Only allow SUPER_ADMIN to filter by a specific collaboratorId query param
    // If not SUPER_ADMIN, scopeFilters already forces the correct condition
    if (isSuperAdmin(req.user) && req.query.collaboratorId) {
      filters.folder = { collaboratorId: parseInt(req.query.collaboratorId, 10) };
    }

    if (req.query.folderId) {
      filters.folderId = parseInt(req.query.folderId, 10);
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    const { qrCodes, total } = await qrcodeService.findQRCodes(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Liste des QR codes récupérée avec succès.', { qrCodes }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/qrcodes/:id
 * Get a single QR code by ID
 */
export const getQRCodeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);

    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canAccessResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    return success(res, 'QR code récupéré avec succès.', { qrCode });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/qrcodes/:id
 * Update a QR code
 */
export const updateQRCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existingQRCode = await qrcodeService.findQRCodeById(id);
    if (!existingQRCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canModifyResource(req.user, existingQRCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    const { name, description, folderId, logo } = req.body;

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (folderId !== undefined) updateData.folderId = folderId ? parseInt(folderId, 10) : null;

    const updatedQRCode = await qrcodeService.updateQRCode(id, updateData);

    // Audit log
    await auditService.createLog({
      action: 'UPDATE',
      entity: 'QRCode',
      entityId: id,
      description: `Mise à jour du QR code "${updatedQRCode.name}"`,
      userId: req.user.id,
      qrCodeId: id,
    });

    return success(res, 'QR code mis à jour avec succès.', { qrCode: updatedQRCode });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/qrcodes/:id
 * Delete a QR code
 */
export const deleteQRCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canModifyResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    await qrcodeService.deleteQRCode(id);

    // Audit log
    await auditService.createLog({
      action: 'DELETE',
      entity: 'QRCode',
      entityId: id,
      description: `Suppression du QR code "${qrCode.name}" (${qrCode.uuid})`,
      userId: req.user.id,
    });

    return success(res, 'QR code supprimé avec succès.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/qrcodes/:id/activate
 * Activate a QR code
 */
export const activateQRCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canModifyResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    if (qrCode.isActive) {
      return error(res, 'Le QR code est déjà actif.', [], 400);
    }

    const updatedQRCode = await qrcodeService.setActive(id, true);

    // Audit log
    await auditService.createLog({
      action: 'ACTIVATE',
      entity: 'QRCode',
      entityId: id,
      description: `Activation du QR code "${qrCode.name}"`,
      userId: req.user.id,
      qrCodeId: id,
    });

    return success(res, 'QR code activé avec succès.', { qrCode: updatedQRCode });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/qrcodes/:id/deactivate
 * Deactivate a QR code
 */
export const deactivateQRCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canModifyResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    if (!qrCode.isActive) {
      return error(res, 'Le QR code est déjà désactivé.', [], 400);
    }

    const updatedQRCode = await qrcodeService.setActive(id, false);

    // Audit log
    await auditService.createLog({
      action: 'DEACTIVATE',
      entity: 'QRCode',
      entityId: id,
      description: `Désactivation du QR code "${qrCode.name}"`,
      userId: req.user.id,
      qrCodeId: id,
    });

    return success(res, 'QR code désactivé avec succès.', { qrCode: updatedQRCode });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/qrcodes/:id/destination
 * Update the destination URL of a dynamic QR code
 */
export const updateDestinationURL = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canModifyResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    if (!qrCode.destinations || qrCode.destinations.length === 0) {
      return error(res, "Le QR code n'a pas d'URL de destination configurée.", [], 400);
    }

    const { destinationUrl } = req.body;
    // La destination active est la première de la liste (triée par ordre décroissant de createdAt)
    const oldUrl = qrCode.destinations[0].url;

    const updatedQRCode = await qrcodeService.updateDestinationUrl(id, oldUrl, destinationUrl, req.user.id);

    // Audit log
    await auditService.createLog({
      action: 'UPDATE_DESTINATION',
      entity: 'QRCode',
      entityId: id,
      description: `Changement d'URL de destination : ${oldUrl} → ${destinationUrl}`,
      userId: req.user.id,
      qrCodeId: id,
    });

    return success(res, 'URL de destination mise à jour avec succès.', {
      qrCode: updatedQRCode,
      ancienneUrl: oldUrl,
      nouvelleUrl: destinationUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/qrcodes/:id/image
 * Generate and return a QR code image (PNG or SVG)
 * Query params: format (png|svg), size (default 300)
 */
export const generateQRCodeImage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canAccessResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    const format = req.query.format || 'png';
    const size = parseInt(req.query.size, 10) || 300;
    
    if (!qrCode.destinations || qrCode.destinations.length === 0) {
      return error(res, 'Ce QR code n\'a pas d\'URL de destination.', [], 400);
    }
    const url = buildRedirectUrl(qrCode.uuid);

    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    if (format === 'svg') {
      const svgString = await QRCodeLib.toString(url, { ...qrOptions, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `inline; filename="qrcode-${qrCode.uuid}.svg"`);
      return res.send(svgString);
    }

    // Default: PNG
    const pngBuffer = await QRCodeLib.toBuffer(url, qrOptions);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qrcode-${qrCode.uuid}.png"`);
    return res.send(pngBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/qrcodes/:id/download
 * Download a QR code image file
 * Query params: format (png|svg), size (default 300)
 */
export const downloadQRCode = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const qrCode = await qrcodeService.findQRCodeById(id);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canAccessResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    const format = req.query.format || 'png';
    const size = parseInt(req.query.size, 10) || 300;
    
    if (!qrCode.destinations || qrCode.destinations.length === 0) {
      return error(res, 'Ce QR code n\'a pas d\'URL de destination.', [], 400);
    }
    const url = buildRedirectUrl(qrCode.uuid);

    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const filename = `qrcode-${qrCode.uuid}.${format}`;

    if (format === 'svg') {
      const svgString = await QRCodeLib.toString(url, { ...qrOptions, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(svgString);
    }

    // Default: PNG
    const pngBuffer = await QRCodeLib.toBuffer(url, qrOptions);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pngBuffer);
  } catch (err) {
    next(err);
  }
};
