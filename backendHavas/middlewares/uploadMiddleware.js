// ============================================================
// Upload Middleware — Multer configuration
// ============================================================

import multer from 'multer';
import path from 'path';
import { getUploadPath, generateUniqueFilename } from '../utils/fileHelper.js';

// ---------- Excel Upload Configuration ----------

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath('excel'));
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname, 'import-'));
  },
});

const excelFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  const allowedExts = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers Excel (.xlsx, .xls) sont autorisés.'), false);
  }
};

/**
 * Multer middleware for uploading a single Excel file
 * Field name: 'file'
 * Max size: 10 MB
 */
export const uploadExcel = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('file');

// ---------- Image Upload Configuration ----------

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath('images'));
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname, 'img-'));
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image (jpg, png, gif, webp, svg) sont autorisés.'), false);
  }
};

/**
 * Multer middleware for uploading a single image
 * Field name: 'image'
 * Max size: 5 MB
 */
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('image');

// ---------- Logo Upload Configuration ----------

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadPath('logos'));
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname, 'logo-'));
  },
});

/**
 * Multer middleware for uploading a single logo
 * Field name: 'logo'
 * Max size: 2 MB
 */
export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('logo');
