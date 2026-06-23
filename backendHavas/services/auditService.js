// ============================================================
// Audit Service — Database operations for audit logs
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create an audit log entry
 * @param {object} data - Audit log data { action, entity, entityId, description, userId, qrCodeId? }
 * @returns {Promise<object>}
 */
export const createLog = async (data) => {
  return prisma.auditLog.create({
    data,
    include: {
      user: { select: { id: true, firstname: true, lastname: true, email: true } },
    },
  });
};

/**
 * Get audit logs with filtering and pagination
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ logs: object[], total: number }>}
 */
export const getLogs = async (filters, pagination, orderBy) => {
  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        user: { select: { id: true, firstname: true, lastname: true, email: true } },
        qrCode: { select: { id: true, name: true, uuid: true } },
      },
    }),
    prisma.auditLog.count({ where: filters }),
  ]);

  return { logs, total };
};

/**
 * Get audit logs for a specific user
 * @param {number} userId
 * @param {object} filters - Additional filters
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ logs: object[], total: number }>}
 */
export const getUserLogs = async (userId, filters, pagination, orderBy) => {
  const where = { userId, ...filters };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        qrCode: { select: { id: true, name: true, uuid: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
};
