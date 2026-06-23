// ============================================================
// Import Service — Database operations for import history
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create an import history record
 * @param {object} data - Import history data
 * @returns {Promise<object>}
 */
export const createImportHistory = async (data) => {
  return prisma.importHistory.create({
    data,
    include: {
      user: { select: { id: true, firstname: true, lastname: true, email: true } },
    },
  });
};

/**
 * Get import history with pagination
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ imports: object[], total: number }>}
 */
export const getImportHistories = async (filters, pagination, orderBy) => {
  const [imports, total] = await prisma.$transaction([
    prisma.importHistory.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
      },
    }),
    prisma.importHistory.count({ where: filters }),
  ]);

  return { imports, total };
};
