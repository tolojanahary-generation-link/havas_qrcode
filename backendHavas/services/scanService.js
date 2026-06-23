// ============================================================
// Scan Service — Database operations for scan tracking
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Create a scan history record
 * @param {object} data - Scan data
 * @returns {Promise<object>}
 */
export const createScan = async (data) => {
  return prisma.scanHistory.create({ data });
};

/**
 * Get scan history for a QR code with pagination
 * @param {number} qrCodeId
 * @param {object} filters - Additional filters
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ scans: object[], total: number }>}
 */
export const getScanHistory = async (qrCodeId, filters, pagination, orderBy) => {
  const where = { qrCodeId, ...filters };

  const [scans, total] = await prisma.$transaction([
    prisma.scanHistory.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
    }),
    prisma.scanHistory.count({ where }),
  ]);

  return { scans, total };
};

/**
 * Get statistics for a specific QR code
 * @param {number} qrCodeId
 * @returns {Promise<object>}
 */
export const getQRCodeStatistics = async (qrCodeId) => {
  const [
    totalScans,
    scansByBrowser,
    scansByOS,
    scansByDevice,
    scansByCountry,
    scansByCity,
    recentScans,
  ] = await prisma.$transaction([
    // Total scan count
    prisma.scanHistory.count({ where: { qrCodeId } }),

    // Group by browser
    prisma.scanHistory.groupBy({
      by: ['browser'],
      where: { qrCodeId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // Group by operating system
    prisma.scanHistory.groupBy({
      by: ['operatingSystem'],
      where: { qrCodeId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // Group by device
    prisma.scanHistory.groupBy({
      by: ['device'],
      where: { qrCodeId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // Group by country
    prisma.scanHistory.groupBy({
      by: ['country'],
      where: { qrCodeId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),

    // Group by city
    prisma.scanHistory.groupBy({
      by: ['city'],
      where: { qrCodeId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),

    // Last 10 scans
    prisma.scanHistory.findMany({
      where: { qrCodeId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    totalScans,
    scansByBrowser: scansByBrowser.map((s) => ({ name: s.browser, count: s._count.id })),
    scansByOS: scansByOS.map((s) => ({ name: s.operatingSystem, count: s._count.id })),
    scansByDevice: scansByDevice.map((s) => ({ name: s.device, count: s._count.id })),
    scansByCountry: scansByCountry.map((s) => ({ name: s.country, count: s._count.id })),
    scansByCity: scansByCity.map((s) => ({ name: s.city, count: s._count.id })),
    recentScans,
  };
};

/**
 * Get dashboard statistics (global or per collaborator)
 * @param {number|null} collaboratorId - Optional collaborator ID to filter
 * @returns {Promise<object>}
 */
export const getDashboardStatistics = async (collaboratorId = null) => {
  const qrCodeWhere = collaboratorId ? { collaboratorId } : {};
  const scanWhere = collaboratorId ? { qrCode: { collaboratorId } } : {};

  const [
    totalQRCodes,
    activeQRCodes,
    inactiveQRCodes,
    totalScans,
    topQRCodes,
    recentScans,
    scansTrend,
  ] = await prisma.$transaction([
    // Total QR codes
    prisma.qRCode.count({ where: qrCodeWhere }),

    // Active QR codes
    prisma.qRCode.count({ where: { ...qrCodeWhere, isActive: true } }),

    // Inactive QR codes
    prisma.qRCode.count({ where: { ...qrCodeWhere, isActive: false } }),

    // Total scans
    prisma.scanHistory.count({ where: scanWhere }),

    // Top 10 most scanned QR codes
    prisma.qRCode.findMany({
      where: qrCodeWhere,
      include: {
        _count: { select: { scanHistories: true } },
        collaborator: { select: { id: true, companyName: true } },
      },
      orderBy: { scanHistories: { _count: 'desc' } },
      take: 10,
    }),

    // Last 10 scans
    prisma.scanHistory.findMany({
      where: scanWhere,
      include: {
        qrCode: { select: { id: true, name: true, uuid: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    // Scans per day over the last 30 days
    prisma.scanHistory.groupBy({
      by: ['createdAt'],
      where: {
        ...scanWhere,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: { id: true },
    }),
  ]);

  // Aggregate scans by date for the trend
  const trendMap = {};
  scansTrend.forEach((scan) => {
    const dateKey = scan.createdAt.toISOString().split('T')[0];
    trendMap[dateKey] = (trendMap[dateKey] || 0) + scan._count.id;
  });

  const scansTrendByDay = Object.entries(trendMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalQRCodes,
    activeQRCodes,
    inactiveQRCodes,
    totalScans,
    topQRCodes: topQRCodes.map((qr) => ({
      id: qr.id,
      name: qr.name,
      uuid: qr.uuid,
      collaborator: qr.collaborator,
      totalScans: qr._count.scanHistories,
    })),
    recentScans,
    scansTrend: scansTrendByDay,
  };
};
