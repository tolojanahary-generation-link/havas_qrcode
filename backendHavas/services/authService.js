// ============================================================
// Auth Service — Database operations for authentication
// ============================================================

import prisma from '../prisma/prismaClient.js';

/**
 * Find a user by email, including role information
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      role: true,
      collaborator: { select: { id: true, companyName: true } },
    },
  });
};

// ---------- Refresh Token Management ----------

/**
 * Create a refresh token record
 * @param {number} userId
 * @param {string} token
 * @param {Date} expiresAt
 * @returns {Promise<object>}
 */
export const createRefreshToken = async (userId, token, expiresAt) => {
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

/**
 * Find a valid refresh token
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          role: true,
          collaborator: { select: { id: true, companyName: true } },
        },
      },
    },
  });
};

/**
 * Delete a refresh token (logout)
 * @param {string} token
 * @returns {Promise<object>}
 */
export const deleteRefreshToken = async (token) => {
  return prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Delete all refresh tokens for a user
 * @param {number} userId
 * @returns {Promise<object>}
 */
export const deleteAllRefreshTokens = async (userId) => {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Clean up expired refresh tokens
 * @returns {Promise<object>}
 */
export const cleanExpiredRefreshTokens = async () => {
  return prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

// ---------- Password Reset Token Management ----------

/**
 * Create a password reset token
 * @param {number} userId
 * @param {string} token
 * @param {Date} expiresAt
 * @returns {Promise<object>}
 */
export const createPasswordResetToken = async (userId, token, expiresAt) => {
  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  return prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });
};

/**
 * Find a valid (unused, non-expired) password reset token
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export const findValidResetToken = async (token) => {
  return prisma.passwordResetToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
};

/**
 * Mark a password reset token as used
 * @param {number} id - Token record ID
 * @returns {Promise<object>}
 */
export const markResetTokenUsed = async (id) => {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { used: true },
  });
};

/**
 * Update user password
 * @param {number} userId
 * @param {string} hashedPassword
 * @returns {Promise<object>}
 */
export const updatePassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};
