// ============================================================
// Auth Controller — Authentication business logic
// ============================================================

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { success, error } from '../utils/responseHelper.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/tokenHelper.js';
import * as authService from '../services/authService.js';
import * as auditService from '../services/auditService.js';

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return error(res, 'Adresse email ou mot de passe incorrect.', [], 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return error(res, 'Votre compte a été désactivé. Contactez l\'administrateur.', [], 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return error(res, 'Adresse email ou mot de passe incorrect.', [], 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await authService.createRefreshToken(
      user.id,
      refreshToken,
      getRefreshTokenExpiry()
    );

    // Log the login action
    await auditService.createLog({
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      description: `Connexion de l'utilisateur ${user.firstname} ${user.lastname}`,
      userId: user.id,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return success(res, 'Connexion réussie.', {
      utilisateur: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Invalidate the refresh token
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }

    // Log the logout action
    if (req.user) {
      await auditService.createLog({
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user.id,
        description: `Déconnexion de l'utilisateur ${req.user.firstname} ${req.user.lastname}`,
        userId: req.user.id,
      });
    }

    return success(res, 'Déconnexion réussie.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh-token
 * Issue a new access token using a valid refresh token
 */
export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return error(res, 'Le token de rafraîchissement est requis.', [], 400);
    }

    // Verify the JWT signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return error(res, 'Token de rafraîchissement invalide ou expiré.', [], 401);
    }

    // Check the token in the database
    const storedToken = await authService.findRefreshToken(refreshToken);

    if (!storedToken) {
      return error(res, 'Token de rafraîchissement non trouvé.', [], 401);
    }

    // Check if the token has expired in the database
    if (new Date() > storedToken.expiresAt) {
      await authService.deleteRefreshToken(refreshToken);
      return error(res, 'Token de rafraîchissement expiré. Veuillez vous reconnecter.', [], 401);
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      await authService.deleteRefreshToken(refreshToken);
      return error(res, 'Votre compte a été désactivé.', [], 403);
    }

    // Generate a new access token
    const newAccessToken = generateAccessToken(storedToken.user);

    // Optionally rotate the refresh token
    const newRefreshToken = generateRefreshToken(storedToken.user);
    await authService.deleteRefreshToken(refreshToken);
    await authService.createRefreshToken(
      storedToken.user.id,
      newRefreshToken,
      getRefreshTokenExpiry()
    );

    return success(res, 'Token rafraîchi avec succès.', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Generate a password reset token
 * In development mode, the token is returned in the response.
 * In production, it should be sent via email.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await authService.findUserByEmail(email);

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return success(res, 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.');
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the token in the database
    await authService.createPasswordResetToken(user.id, resetToken, expiresAt);

    // TODO: Send email with reset link in production
    // const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Réinitialisation du mot de passe', resetLink);

    // Development mode: return the token in the response
    const responseData = { message: 'Un lien de réinitialisation a été envoyé.' };
    if (process.env.NODE_ENV === 'development') {
      responseData.resetToken = resetToken;
      responseData.expiresAt = expiresAt;
    }

    return success(res, 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.', responseData);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find a valid (unused, non-expired) token
    const resetToken = await authService.findValidResetToken(token);

    if (!resetToken) {
      return error(res, 'Token de réinitialisation invalide ou expiré.', [], 400);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update the password
    await authService.updatePassword(resetToken.userId, hashedPassword);

    // Mark the token as used
    await authService.markResetTokenUsed(resetToken.id);

    // Invalidate all refresh tokens for this user (force re-login)
    await authService.deleteAllRefreshTokens(resetToken.userId);

    // Log the action
    await auditService.createLog({
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: resetToken.userId,
      description: `Mot de passe réinitialisé pour l'utilisateur ID ${resetToken.userId}`,
      userId: resetToken.userId,
    });

    return success(res, 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    return success(res, 'Utilisateur récupéré avec succès.', {
      utilisateur: req.user,
    });
  } catch (err) {
    next(err);
  }
};