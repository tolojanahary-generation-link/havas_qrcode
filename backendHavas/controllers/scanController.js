// ============================================================
// Scan Controller — Scan tracking business logic
// ============================================================

import { success, error, paginated } from '../utils/responseHelper.js';
import { buildPagination, buildPaginationMeta, buildSorting } from '../utils/paginationHelper.js';
import * as scanService from '../services/scanService.js';
import * as qrcodeService from '../services/qrcodeService.js';
import { isSuperAdmin, canAccessResource } from '../utils/tenantHelper.js';

/**
 * Parse user agent string to extract browser, OS, and device
 * @param {string} userAgent - Raw user agent string
 * @returns {{ browser: string, operatingSystem: string, device: string }}
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Inconnu', operatingSystem: 'Inconnu', device: 'Inconnu' };

  // Browser detection
  let browser = 'Autre';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('OPR') || userAgent.includes('Opera')) browser = 'Opera';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'Internet Explorer';

  // OS detection
  let operatingSystem = 'Autre';
  if (userAgent.includes('Windows')) operatingSystem = 'Windows';
  else if (userAgent.includes('Mac OS')) operatingSystem = 'macOS';
  else if (userAgent.includes('Linux')) operatingSystem = 'Linux';
  else if (userAgent.includes('Android')) operatingSystem = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) operatingSystem = 'iOS';
  else if (userAgent.includes('CrOS')) operatingSystem = 'Chrome OS';

  // Device detection
  let device = 'Desktop';
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) device = 'Mobile';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';

  return { browser, operatingSystem, device };
};

/**
 * Extract collaborator IP from request
 * @param {import('express').Request} req
 * @returns {string}
 */
const getCollaboratorIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || req.ip
    || 'Inconnu';
};

/**
 * GET /api/scan/:uuid
 * Public endpoint — registers a scan and redirects to the destination URL
 */
export const registerScan = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    // Find the QR code by UUID
    const qrCode = await qrcodeService.findQRCodeByUuid(uuid);

    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    if (!qrCode.isActive) {
      return error(res, 'Ce QR code a été désactivé.', [], 410);
    }

    // Parse tracking information
    const userAgent = req.headers['user-agent'] || '';
    const { browser, operatingSystem, device } = parseUserAgent(userAgent);
    const ip = getCollaboratorIp(req);

    // Create scan record
    await scanService.createScan({
      qrCodeId: qrCode.id,
      ip,
      country: req.headers['cf-ipcountry'] || null, // Cloudflare header, or null
      city: null, // Would require a GeoIP service
      browser,
      operatingSystem,
      device,
      referer: req.headers.referer || null,
      userAgent,
    });

    // Redirect to destination URL
    return res.redirect(302, qrCode.destinationUrl);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/scans/history/:qrCodeId
 * Get scan history for a specific QR code
 * Query params: page, limit, browser, device, country, sortBy, sortOrder
 */
export const getScanHistory = async (req, res, next) => {
  try {
    const qrCodeId = parseInt(req.params.qrCodeId, 10);

    // Verify the QR code exists
    const qrCode = await qrcodeService.findQRCodeById(qrCodeId);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canAccessResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    const pagination = buildPagination(req.query);
    const orderBy = buildSorting(req.query, ['createdAt', 'browser', 'device', 'country'], 'createdAt', 'desc');

    // Build filters
    const filters = {};

    if (req.query.browser) {
      filters.browser = { contains: req.query.browser, mode: 'insensitive' };
    }

    if (req.query.device) {
      filters.device = { contains: req.query.device, mode: 'insensitive' };
    }

    if (req.query.country) {
      filters.country = { contains: req.query.country, mode: 'insensitive' };
    }

    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) filters.createdAt.gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.createdAt.lte = new Date(req.query.endDate);
    }

    const { scans, total } = await scanService.getScanHistory(qrCodeId, filters, pagination, orderBy);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return paginated(res, 'Historique des scans récupéré avec succès.', { scans }, meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/scans/stats/:qrCodeId
 * Get detailed statistics for a specific QR code
 */
export const getQRCodeStatistics = async (req, res, next) => {
  try {
    const qrCodeId = parseInt(req.params.qrCodeId, 10);

    // Verify the QR code exists
    const qrCode = await qrcodeService.findQRCodeById(qrCodeId);
    if (!qrCode) {
      return error(res, 'QR code non trouvé.', [], 404);
    }

    // Check ownership
    if (!canAccessResource(req.user, qrCode)) {
      return error(res, 'Accès refusé. Ce QR code n\'appartient pas à votre collaborateur.', [], 403);
    }

    const statistics = await scanService.getQRCodeStatistics(qrCodeId);

    return success(res, 'Statistiques du QR code récupérées avec succès.', {
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        uuid: qrCode.uuid,
        type: qrCode.type,
      },
      statistiques: statistics,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/scans/dashboard
 * Get global dashboard statistics
 * Query params: collaboratorId (optional)
 */
export const getDashboardStatistics = async (req, res, next) => {
  try {
    // Determine final collaboratorId based on role
    const collaboratorId = isSuperAdmin(req.user)
      ? (req.query.collaboratorId ? parseInt(req.query.collaboratorId, 10) : null)
      : req.user.collaboratorId;

    const statistics = await scanService.getDashboardStatistics(collaboratorId);

    return success(res, 'Statistiques du tableau de bord récupérées avec succès.', {
      statistiques: statistics,
    });
  } catch (err) {
    next(err);
  }
};
