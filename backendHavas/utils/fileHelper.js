// ============================================================
// File Helper — File path resolution and management
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const UPLOAD_BASE = path.resolve(__dirname, '..', 'uploads');

/**
 * Ensure a directory exists, create it if not
 * @param {string} dirPath - Absolute path to the directory
 */
export const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get the absolute path for an upload subdirectory
 * @param {string} subDir - Subdirectory name (e.g., 'excel', 'qrcodes', 'avatars')
 * @returns {string} Absolute path
 */
export const getUploadPath = (subDir) => {
  const dirPath = path.join(UPLOAD_BASE, subDir);
  ensureDirectoryExists(dirPath);
  return dirPath;
};

/**
 * Delete a file if it exists
 * @param {string} filePath - Absolute or relative path to the file
 * @returns {boolean} True if file was deleted
 */
export const deleteFile = (filePath) => {
  try {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(UPLOAD_BASE, filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err.message);
    return false;
  }
};

/**
 * Get the file extension from a filename
 * @param {string} filename - Original filename
 * @returns {string} File extension (e.g., '.xlsx')
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Generate a unique filename with timestamp
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName, prefix = '') => {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  return `${prefix}${timestamp}-${random}${ext}`;
};
