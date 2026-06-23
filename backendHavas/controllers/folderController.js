// ============================================================
// Folder Controller — Folder management business logic
// ============================================================

import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as folderService from '../services/folderService.js';
import * as auditService from '../services/auditService.js';

/**
 * POST /api/folders
 * Create a new folder
 */
export const createFolder = async (req, res, next) => {
  try {
    const { name, description, collaboratorId } = req.body;

    const folder = await folderService.createFolder({
      name,
      description: description || null,
      collaboratorId: parseInt(collaboratorId, 10),
    });

    // Audit log
    await auditService.createLog({
      action: 'CREATE',
      entity: 'Folder',
      entityId: folder.id,
      description: `Création du dossier "${name}"`,
      userId: req.user.id,
    });

    return success(res, 'Dossier créé avec succès.', { dossier: folder }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/folders
 * Get all folders with pagination, filtering, and sorting
 * Query params: page, limit, search, collaboratorId, sortBy, sortOrder
 */
export const getFolders = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'name'], 'createdAt', 'desc');

    // Build filters
    const filters = {};

    if (req.query.search) {
      filters.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    if (req.query.collaboratorId) {
      filters.collaboratorId = parseInt(req.query.collaboratorId, 10);
    }

    const { folders, total } = await folderService.findFolders(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Liste des dossiers récupérée avec succès.', { dossiers: folders }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/folders/:id
 * Get a single folder by ID
 */
export const getFolderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const folder = await folderService.findFolderById(id);

    if (!folder) {
      return error(res, 'Dossier non trouvé.', [], 404);
    }

    return success(res, 'Dossier récupéré avec succès.', { dossier: folder });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/folders/:id
 * Update a folder
 */
export const updateFolder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if folder exists
    const existingFolder = await folderService.findFolderById(id);
    if (!existingFolder) {
      return error(res, 'Dossier non trouvé.', [], 404);
    }

    const { name, description, collaboratorId } = req.body;

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (collaboratorId !== undefined) updateData.collaboratorId = parseInt(collaboratorId, 10);

    const updatedFolder = await folderService.updateFolder(id, updateData);

    // Audit log
    await auditService.createLog({
      action: 'UPDATE',
      entity: 'Folder',
      entityId: id,
      description: `Mise à jour du dossier "${updatedFolder.name}"`,
      userId: req.user.id,
    });

    return success(res, 'Dossier mis à jour avec succès.', { dossier: updatedFolder });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/folders/:id
 * Delete a folder
 */
export const deleteFolder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const folder = await folderService.findFolderById(id);
    if (!folder) {
      return error(res, 'Dossier non trouvé.', [], 404);
    }

    // Check for related QR codes
    if (folder._count.qrCodes > 0) {
      return error(
        res,
        'Impossible de supprimer ce dossier car il contient des QR codes.',
        [{ count: folder._count.qrCodes, entity: 'qrCodes' }],
        409
      );
    }

    await folderService.deleteFolder(id);

    // Audit log
    await auditService.createLog({
      action: 'DELETE',
      entity: 'Folder',
      entityId: id,
      description: `Suppression du dossier "${folder.name}"`,
      userId: req.user.id,
    });

    return success(res, 'Dossier supprimé avec succès.');
  } catch (err) {
    next(err);
  }
};
