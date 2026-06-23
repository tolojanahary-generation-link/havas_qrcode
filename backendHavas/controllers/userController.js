// ============================================================
// User Controller — User management business logic
// ============================================================

import bcrypt from 'bcrypt';
import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as userService from '../services/userService.js';
import * as auditService from '../services/auditService.js';

const SALT_ROUNDS = 12;

/**
 * POST /api/users
 * Create a new user
 */
export const createUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, phone, avatar, roleId, collaboratorId } = req.body;

    // Check for duplicate email
    const exists = await userService.emailExists(email);
    if (exists) {
      return error(res, 'Cette adresse email est déjà utilisée.', [
        { field: 'email', message: 'Email déjà existant' },
      ], 409);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user
    const user = await userService.createUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      avatar: avatar || null,
      roleId: parseInt(roleId, 10),
      collaboratorId: parseInt(collaboratorId, 10),
    });

    // Audit log
    await auditService.createLog({
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      description: `Création de l'utilisateur ${firstname} ${lastname} (${email})`,
      userId: req.user.id,
    });

    return success(res, 'Utilisateur créé avec succès.', { utilisateur: user }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users
 * Get all users with pagination, filtering, and sorting
 * Query params: page, limit, search, roleId, collaboratorId, isActive, sortBy, sortOrder
 */
export const getUsers = async (req, res, next) => {
  try {
    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'firstname', 'lastname', 'email'], 'createdAt', 'desc');

    // Build filters
    const filters = {};

    if (req.query.search) {
      filters.OR = [
        { firstname: { contains: req.query.search, mode: 'insensitive' } },
        { lastname: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    if (req.query.roleId) {
      filters.roleId = parseInt(req.query.roleId, 10);
    }

    if (req.query.collaboratorId) {
      filters.collaboratorId = parseInt(req.query.collaboratorId, 10);
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }

    const { users, total } = await userService.findUsers(filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Liste des utilisateurs récupérée avec succès.', { utilisateurs: users }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Get a single user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const user = await userService.findUserById(id);

    if (!user) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    return success(res, 'Utilisateur récupéré avec succès.', { utilisateur: user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 * Update a user
 */
export const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if user exists
    const existingUser = await userService.findUserById(id);
    if (!existingUser) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    const { firstname, lastname, email, password, phone, avatar, roleId, collaboratorId } = req.body;

    // Check email uniqueness if email is being changed
    if (email && email !== existingUser.email) {
      const emailTaken = await userService.emailExists(email, id);
      if (emailTaken) {
        return error(res, 'Cette adresse email est déjà utilisée.', [
          { field: 'email', message: 'Email déjà existant' },
        ], 409);
      }
    }

    // Build update data
    const updateData = {};
    if (firstname !== undefined) updateData.firstname = firstname;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (roleId !== undefined) updateData.roleId = parseInt(roleId, 10);
    if (collaboratorId !== undefined) updateData.collaboratorId = parseInt(collaboratorId, 10);

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updatedUser = await userService.updateUser(id, updateData);

    // Audit log
    await auditService.createLog({
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      description: `Mise à jour de l'utilisateur ${updatedUser.firstname} ${updatedUser.lastname}`,
      userId: req.user.id,
    });

    return success(res, 'Utilisateur mis à jour avec succès.', { utilisateur: updatedUser });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Check if user exists
    const user = await userService.findUserById(id);
    if (!user) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    // Prevent self-deletion
    if (req.user.id === id) {
      return error(res, 'Vous ne pouvez pas supprimer votre propre compte.', [], 400);
    }

    await userService.deleteUser(id);

    // Audit log
    await auditService.createLog({
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      description: `Suppression de l'utilisateur ${user.firstname} ${user.lastname} (${user.email})`,
      userId: req.user.id,
    });

    return success(res, 'Utilisateur supprimé avec succès.');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/:id/activate
 * Activate a user account
 */
export const activateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const user = await userService.findUserById(id);
    if (!user) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    if (user.isActive) {
      return error(res, 'L\'utilisateur est déjà actif.', [], 400);
    }

    const updatedUser = await userService.setActive(id, true);

    // Audit log
    await auditService.createLog({
      action: 'ACTIVATE',
      entity: 'User',
      entityId: id,
      description: `Activation du compte de ${user.firstname} ${user.lastname}`,
      userId: req.user.id,
    });

    return success(res, 'Utilisateur activé avec succès.', { utilisateur: updatedUser });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/:id/deactivate
 * Deactivate a user account
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const user = await userService.findUserById(id);
    if (!user) {
      return error(res, 'Utilisateur non trouvé.', [], 404);
    }

    if (!user.isActive) {
      return error(res, 'L\'utilisateur est déjà désactivé.', [], 400);
    }

    // Prevent self-deactivation
    if (req.user.id === id) {
      return error(res, 'Vous ne pouvez pas désactiver votre propre compte.', [], 400);
    }

    const updatedUser = await userService.setActive(id, false);

    // Audit log
    await auditService.createLog({
      action: 'DEACTIVATE',
      entity: 'User',
      entityId: id,
      description: `Désactivation du compte de ${user.firstname} ${user.lastname}`,
      userId: req.user.id,
    });

    return success(res, 'Utilisateur désactivé avec succès.', { utilisateur: updatedUser });
  } catch (err) {
    next(err);
  }
};
