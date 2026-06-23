// ============================================================
// Collaborator Controller — Collaborator management business logic
// ============================================================

import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as collaboratorService from '../services/collaboratorService.js';
import * as auditService from '../services/auditService.js';

/**
 * POST /api/collaborators
 * Create a new collaborator
 */
export const createCollaborator = async (req, res, next) => {
  try {
    const { companyName, contactName, email, phone, address, city, country, logo } = req.body;

    // Check for duplicate email
    const exists = await collaboratorService.emailExists(email);
    if (exists) {
      return error(res, 'Cette adresse email est déjà utilisée par un autre collaborator.', [
        { field: 'email', message: 'Email déjà existant' },
      ], 409);
    }

    const collaborator = await collaboratorService.createCollaborator({
      companyName,
      contactName,
      email,
      phone,
      address,
      city,
      country,
      logo: logo || null,
    });

    // Audit log
    await auditService.createLog({
      action: 'CREATE',
      entity: 'Collaborator',
      entityId: collaborator.id,
      description: `Création du collaborator ${companyName}`,
      userId: req.user.id,
    });

    return success(res, 'Collaborator créé avec succès.', { collaborator }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/collaborators
 * Get all collaborators with pagination, filtering, and sorting
 * Query params: page, limit, search, isActive, city, country, sortBy, sortOrder
 */
export const getCollaborators = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(
      req.query,
      ['createdAt', 'companyName', 'contactName', 'email', 'city', 'country'],
      'createdAt',
      'desc'
    );

    // Build filters
    const filters = {};

    if (req.query.search) {
      filters.OR = [
        { companyName: { contains: req.query.search, mode: 'insensitive' } },
        { contactName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    if (req.query.city) {
      filters.city = { contains: req.query.city, mode: 'insensitive' };
    }

    if (req.query.country) {
      filters.country = { contains: req.query.country, mode: 'insensitive' };
    }

    const { collaborators, total } = await collaboratorService.findCollaborators(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Liste des collaborators récupérée avec succès.', { collaborators }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/collaborators/:id
 * Get a single collaborator by ID
 */
export const getCollaboratorById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const collaborator = await collaboratorService.findCollaboratorById(id);

    if (!collaborator) {
      return error(res, 'Collaborator non trouvé.', [], 404);
    }

    return success(res, 'Collaborator récupéré avec succès.', { collaborator });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/collaborators/:id
 * Update a collaborator
 */
export const updateCollaborator = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if collaborator exists
    const existingCollaborator = await collaboratorService.findCollaboratorById(id);
    if (!existingCollaborator) {
      return error(res, 'Collaborator non trouvé.', [], 404);
    }

    const { companyName, contactName, email, phone, address, city, country, logo } = req.body;

    // Check email uniqueness if email is being changed
    if (email && email !== existingCollaborator.email) {
      const emailTaken = await collaboratorService.emailExists(email, id);
      if (emailTaken) {
        return error(res, 'Cette adresse email est déjà utilisée par un autre collaborator.', [
          { field: 'email', message: 'Email déjà existant' },
        ], 409);
      }
    }

    // Build update data
    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (logo !== undefined) updateData.logo = logo;

    const updatedCollaborator = await collaboratorService.updateCollaborator(id, updateData);

    // Audit log
    await auditService.createLog({
      action: 'UPDATE',
      entity: 'Collaborator',
      entityId: id,
      description: `Mise à jour du collaborator ${updatedCollaborator.companyName}`,
      userId: req.user.id,
    });

    return success(res, 'Collaborator mis à jour avec succès.', { collaborator: updatedCollaborator });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/collaborators/:id
 * Delete a collaborator
 */
export const deleteCollaborator = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const collaborator = await collaboratorService.findCollaboratorById(id);
    if (!collaborator) {
      return error(res, 'Collaborator non trouvé.', [], 404);
    }

    // Check for related entities
    if (collaborator._count.users > 0) {
      return error(
        res,
        'Impossible de supprimer ce collaborator car il a des utilisateurs associés.',
        [{ count: collaborator._count.users, entity: 'utilisateurs' }],
        409
      );
    }

    if (collaborator._count.qrCodes > 0) {
      return error(
        res,
        'Impossible de supprimer ce collaborator car il a des QR codes associés.',
        [{ count: collaborator._count.qrCodes, entity: 'qrCodes' }],
        409
      );
    }

    await collaboratorService.deleteCollaborator(id);

    // Audit log
    await auditService.createLog({
      action: 'DELETE',
      entity: 'Collaborator',
      entityId: id,
      description: `Suppression du collaborator ${collaborator.companyName}`,
      userId: req.user.id,
    });

    return success(res, 'Collaborator supprimé avec succès.');
  } catch (err) {
    next(err);
  }
};
