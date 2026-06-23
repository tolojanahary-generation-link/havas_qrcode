// ============================================================
// collaborator Service — Database operations for collaborators
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create a new collaborator
 * @param {object} data - collaborator data
 * @returns {Promise<object>}
 */
export const createCollaborator = async (data) => {
  return prisma.collaborator.create({ data });
};

/**
 * Find collaborators with filtering, pagination, and sorting
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ collaborators: object[], total: number }>}
 */
export const findCollaborators = async (filters, pagination, orderBy) => {
  const [collaborators, total] = await prisma.$transaction([
    prisma.collaborator.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        _count: {
          select: { users: true, qrCodes: true, folders: true },
        },
      },
    }),
    prisma.collaborator.count({ where: filters }),
  ]);

  return { collaborators, total };
};

/**
 * Find a collaborator by ID
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export const findCollaboratorById = async (id) => {
  return prisma.collaborator.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, qrCodes: true, folders: true },
      },
    },
  });
};

/**
 * Update a collaborator by ID
 * @param {number} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export const updateCollaborator = async (id, data) => {
  return prisma.collaborator.update({
    where: { id },
    data,
  });
};

/**
 * Delete a collaborator by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export const deleteCollaborator = async (id) => {
  return prisma.collaborator.delete({
    where: { id },
  });
};

/**
 * Check if collaborator email exists
 * @param {string} email
 * @param {number|null} excludeId - collaborator ID to exclude (for updates)
 * @returns {Promise<boolean>}
 */
export const emailExists = async (email, excludeId = null) => {
  const where = { email };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  const collaborator = await prisma.collaborator.findFirst({ where });
  return !!collaborator;
};
