// ============================================================
// User Service — Database operations for users
// ============================================================

import prisma from '../prisma/prismaClient.js';

// Fields to exclude from user responses
const userSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  phone: true,
  avatar: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  roleId: true,
  collaboratorId: true,
  role: true,
  collaborator: { select: { id: true, companyName: true, email: true } },
};

/**
 * Create a new user
 * @param {object} data - User data
 * @returns {Promise<object>}
 */
export const createUser = async (data) => {
  return prisma.user.create({
    data,
    select: userSelect,
  });
};

/**
 * Find users with filtering, pagination, and sorting
 * @param {object} filters - Where clause
 * @param {object} pagination - { skip, take }
 * @param {object} orderBy - Sort order
 * @returns {Promise<{ users: object[], total: number }>}
 */
export const findUsers = async (filters, pagination, orderBy) => {
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: filters,
      select: userSelect,
      skip: pagination.skip,
      take: pagination.take,
      orderBy,
    }),
    prisma.user.count({ where: filters }),
  ]);

  return { users, total };
};

/**
 * Find a user by ID
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
};

/**
 * Update a user by ID
 * @param {number} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export const updateUser = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
};

/**
 * Delete a user by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export const deleteUser = async (id) => {
  return prisma.user.delete({
    where: { id },
    select: userSelect,
  });
};

/**
 * Set user active status
 * @param {number} id
 * @param {boolean} isActive
 * @returns {Promise<object>}
 */
export const setActive = async (id, isActive) => {
  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: userSelect,
  });
};

/**
 * Check if user email exists (for uniqueness validation)
 * @param {string} email
 * @param {number|null} excludeId - User ID to exclude (for updates)
 * @returns {Promise<boolean>}
 */
export const emailExists = async (email, excludeId = null) => {
  const where = { email };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  const user = await prisma.user.findFirst({ where });
  return !!user;
};
