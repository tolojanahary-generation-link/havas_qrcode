// ============================================================
// Auth Middleware — JWT authentication verification
// ============================================================

import { verifyAccessToken } from '../utils/tokenHelper.js';
import prisma from '../prisma/prismaClient.js';
import { error } from '../utils/responseHelper.js';

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Attaches the full user object (with role) to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentification requise. Veuillez vous connecter.', [], 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return error(res, 'Token invalide ou expiré. Veuillez vous reconnecter.', [], 401);
    }

    // Fetch the full user with role from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: true,
        collaborator: { select: { id: true, companyName: true } },
      },
    });

    if (!user) {
      return error(res, 'Utilisateur non trouvé.', [], 401);
    }

    if (!user.isActive) {
      return error(res, 'Votre compte a été désactivé. Contactez l\'administrateur.', [], 403);
    }

    // Remove password from user object before attaching to request
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return error(res, 'Erreur d\'authentification.', [], 401);
  }
};
