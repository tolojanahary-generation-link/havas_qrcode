// ============================================================
// Folder Service — Database operations for folders
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create a new folder
 * @param {object} data - Folder data
 * @returns {Promise<object>}
 */
export const createFolder = async (data) => {
  return prisma.folder.create({
    data,
    include: {
      collaborator: { select: { id: true, companyName: true } },
    },
  });
};

/**
 * Find folders with filtering, pagination, and sorting
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ folders: object[], total: number }>}
 */
export const findFolders = async (filters, pagination, orderBy) => {
  const [folders, total] = await prisma.$transaction([
    prisma.folder.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        collaborator: { select: { id: true, companyName: true } },
        _count: { select: { qrCodes: true } },
      },
    }),
    prisma.folder.count({ where: filters }),
  ]);

  return { folders, total };
};

/**
 * Find a folder by ID
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export const findFolderById = async (id) => {
  return prisma.folder.findUnique({
    where: { id },
    include: {
      collaborator: { select: { id: true, companyName: true } },
      _count: { select: { qrCodes: true } },
    },
  });
};

/**
 * Update a folder by ID
 * @param {number} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export const updateFolder = async (id, data) => {
  return prisma.folder.update({
    where: { id },
    data,
    include: {
      collaborator: { select: { id: true, companyName: true } },
    },
  });
};

/**
 * Delete a folder by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export const deleteFolder = async (id) => {
  return prisma.folder.delete({
    where: { id },
  });
};
