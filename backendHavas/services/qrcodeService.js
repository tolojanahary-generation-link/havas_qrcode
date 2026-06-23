// ============================================================
// QRCode Service — Database operations for QR codes
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create a new QR code
 * @param {object} data - QR code data
 * @returns {Promise<object>}
 */
export const createQRCode = async (data) => {
  return prisma.qRCode.create({
    data,
    include: {
      collaborator: { select: { id: true, companyName: true } },
      folder: { select: { id: true, name: true } },
    },
  });
};

/**
 * Create multiple QR codes in a single transaction
 * @param {object[]} qrCodesData - Array of QR code data objects
 * @returns {Promise<object[]>}
 */
export const createManyQRCodes = async (qrCodesData) => {
  const results = await prisma.$transaction(
    qrCodesData.map((data) => prisma.qRCode.create({ data }))
  );
  return results;
};

/**
 * Find QR codes with filtering, pagination, and sorting
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ qrCodes: object[], total: number }>}
 */
export const findQRCodes = async (filters, pagination, orderBy) => {
  const [qrCodes, total] = await prisma.$transaction([
    prisma.qRCode.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
      include: {
        collaborator: { select: { id: true, companyName: true } },
        folder: { select: { id: true, name: true } },
        _count: { select: { scanHistories: true } },
      },
    }),
    prisma.qRCode.count({ where: filters }),
  ]);

  return { qrCodes, total };
};

/**
 * Find a QR code by ID
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export const findQRCodeById = async (id) => {
  return prisma.qRCode.findUnique({
    where: { id },
    include: {
      collaborator: { select: { id: true, companyName: true } },
      folder: { select: { id: true, name: true } },
      qrDestinations: { orderBy: { position: 'asc' } },
      _count: { select: { scanHistories: true } },
    },
  });
};

/**
 * Find a QR code by UUID (for public scan endpoint)
 * @param {string} uuid
 * @returns {Promise<object|null>}
 */
export const findQRCodeByUuid = async (uuid) => {
  return prisma.qRCode.findUnique({
    where: { uuid },
    include: {
      qrDestinations: { orderBy: { position: 'asc' } },
    },
  });
};

/**
 * Update a QR code by ID
 * @param {number} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export const updateQRCode = async (id, data) => {
  return prisma.qRCode.update({
    where: { id },
    data,
    include: {
      collaborator: { select: { id: true, companyName: true } },
      folder: { select: { id: true, name: true } },
    },
  });
};

/**
 * Delete a QR code by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export const deleteQRCode = async (id) => {
  return prisma.qRCode.delete({
    where: { id },
  });
};

/**
 * Set QR code active status
 * @param {number} id
 * @param {boolean} isActive
 * @returns {Promise<object>}
 */
export const setActive = async (id, isActive) => {
  return prisma.qRCode.update({
    where: { id },
    data: { isActive },
    include: {
      collaborator: { select: { id: true, companyName: true } },
      folder: { select: { id: true, name: true } },
    },
  });
};

/**
 * Update the destination URL and create a redirect history entry
 * @param {number} id - QR code ID
 * @param {string} oldUrl - Previous destination URL
 * @param {string} newUrl - New destination URL
 * @param {number} modifiedById - User ID who made the change
 * @returns {Promise<object>}
 */
export const updateDestinationUrl = async (id, oldUrl, newUrl, modifiedById) => {
  return prisma.$transaction(async (tx) => {
    // Create redirect history entry
    await tx.redirectHistory.create({
      data: {
        qrCodeId: id,
        oldUrl,
        newUrl,
        modifiedById,
      },
    });

    // Update the QR code
    return tx.qRCode.update({
      where: { id },
      data: { destinationUrl: newUrl },
      include: {
        collaborator: { select: { id: true, companyName: true } },
        folder: { select: { id: true, name: true } },
      },
    });
  });
};

/**
 * Find all QR codes for export (no pagination)
 * @param {object} filters - Where clause
 * @param {object} orderBy - Sort order
 * @returns {Promise<object[]>}
 */
export const findAllQRCodes = async (filters, orderBy) => {
  return prisma.qRCode.findMany({
    where: filters,
    orderBy,
    include: {
      collaborator: { select: { id: true, companyName: true } },
      folder: { select: { id: true, name: true } },
      _count: { select: { scanHistories: true } },
    },
  });
};
