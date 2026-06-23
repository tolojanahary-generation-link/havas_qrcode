// ============================================================
// Export Controller — Data export business logic (Excel, CSV, PDF)
// ============================================================

import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Parser as CsvParser } from 'json2csv';
import { success, error } from '../utils/responseHelper.js';
import * as qrcodeService from '../services/qrcodeService.js';

/**
 * Build filters from query params (shared across export methods)
 * @param {object} query - Express req.query
 * @returns {object} Prisma where clause
 */
const buildExportFilters = (query) => {
  const filters = {};

  if (query.collaboratorId) {
    filters.collaboratorId = parseInt(query.collaboratorId, 10);
  }

  if (query.folderId) {
    filters.folderId = parseInt(query.folderId, 10);
  }

  if (query.type) {
    filters.type = query.type;
  }

  if (query.isActive !== undefined) {
    filters.isActive = query.isActive === 'true';
  }

  if (query.search) {
    filters.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return filters;
};

/**
 * Transform QR code data for export
 * @param {object[]} qrCodes - Array of QR code objects from database
 * @returns {object[]} Flat data for export
 */
const transformForExport = (qrCodes) => {
  return qrCodes.map((qr) => ({
    ID: qr.id,
    UUID: qr.uuid,
    Nom: qr.name,
    Description: qr.description || '',
    Type: qr.type,
    'URL Destination': qr.destinationUrl,
    'URL Redirection': qr.redirectUrl,
    Couleur: qr.color,
    'Couleur de Fond': qr.backgroundColor,
    Actif: qr.isActive ? 'Oui' : 'Non',
    Collaborator: qr.collaborator?.companyName || '',
    Dossier: qr.folder?.name || '',
    'Nombre de Scans': qr._count?.scanHistories || 0,
    'Créé le': qr.createdAt ? new Date(qr.createdAt).toLocaleDateString('fr-FR') : '',
    'Mis à jour le': qr.updatedAt ? new Date(qr.updatedAt).toLocaleDateString('fr-FR') : '',
  }));
};

/**
 * GET /api/export/excel
 * Export QR codes to Excel file
 * Query params: collaboratorId, folderId, type, isActive, search
 */
export const exportExcel = async (req, res, next) => {
  try {
    const filters = buildExportFilters(req.query);
    const qrCodes = await qrcodeService.findAllQRCodes(filters, { createdAt: 'desc' });

    if (qrCodes.length === 0) {
      return error(res, 'Aucune donnée à exporter.', [], 404);
    }

    const exportData = transformForExport(qrCodes);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },  // ID
      { wch: 38 }, // UUID
      { wch: 30 }, // Nom
      { wch: 40 }, // Description
      { wch: 10 }, // Type
      { wch: 50 }, // URL Destination
      { wch: 50 }, // URL Redirection
      { wch: 10 }, // Couleur
      { wch: 15 }, // Couleur de Fond
      { wch: 8 },  // Actif
      { wch: 25 }, // Collaborator
      { wch: 20 }, // Dossier
      { wch: 15 }, // Nombre de Scans
      { wch: 15 }, // Créé le
      { wch: 15 }, // Mis à jour le
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'QR Codes');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `export-qrcodes-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.send(buffer);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/export/csv
 * Export QR codes to CSV file
 * Query params: collaboratorId, folderId, type, isActive, search
 */
export const exportCSV = async (req, res, next) => {
  try {
    const filters = buildExportFilters(req.query);
    const qrCodes = await qrcodeService.findAllQRCodes(filters, { createdAt: 'desc' });

    if (qrCodes.length === 0) {
      return error(res, 'Aucune donnée à exporter.', [], 404);
    }

    const exportData = transformForExport(qrCodes);

    // Generate CSV
    const fields = Object.keys(exportData[0]);
    const csvParser = new CsvParser({ fields, delimiter: ';', withBOM: true });
    const csv = csvParser.parse(exportData);

    const filename = `export-qrcodes-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/export/pdf
 * Export QR codes to PDF file
 * Query params: collaboratorId, folderId, type, isActive, search
 */
export const exportPDF = async (req, res, next) => {
  try {
    const filters = buildExportFilters(req.query);
    const qrCodes = await qrcodeService.findAllQRCodes(filters, { createdAt: 'desc' });

    if (qrCodes.length === 0) {
      return error(res, 'Aucune donnée à exporter.', [], 404);
    }

    const exportData = transformForExport(qrCodes);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30,
      info: {
        Title: 'Export QR Codes',
        Author: 'QR Code Management Platform',
        CreationDate: new Date(),
      },
    });

    const filename = `export-qrcodes-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Export des QR Codes', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(
      `Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      { align: 'center' }
    );
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Total : ${exportData.length} QR code(s)`, { align: 'center' });
    doc.moveDown(1);

    // Table headers
    const columns = ['Nom', 'Type', 'URL Destination', 'Collaborator', 'Actif', 'Scans', 'Créé le'];
    const colWidths = [120, 60, 250, 120, 50, 60, 80];
    const startX = 30;
    let y = doc.y;

    // Draw header row
    doc.font('Helvetica-Bold').fontSize(9);
    let x = startX;
    columns.forEach((col, i) => {
      doc.text(col, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i] + 5;
    });

    y += 18;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0) + (colWidths.length - 1) * 5, y).stroke();
    y += 5;

    // Draw data rows
    doc.font('Helvetica').fontSize(8);
    for (const row of exportData) {
      // Check if we need a new page
      if (y > 550) {
        doc.addPage();
        y = 30;

        // Redraw header on new page
        doc.font('Helvetica-Bold').fontSize(9);
        x = startX;
        columns.forEach((col, i) => {
          doc.text(col, x, y, { width: colWidths[i], align: 'left' });
          x += colWidths[i] + 5;
        });
        y += 18;
        doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0) + (colWidths.length - 1) * 5, y).stroke();
        y += 5;
        doc.font('Helvetica').fontSize(8);
      }

      const rowData = [
        row['Nom'],
        row['Type'],
        row['URL Destination'],
        row['Collaborator'],
        row['Actif'],
        String(row['Nombre de Scans']),
        row['Créé le'],
      ];

      x = startX;
      rowData.forEach((cell, i) => {
        const text = String(cell || '').substring(0, colWidths[i] / 4); // Truncate long text
        doc.text(text, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i] + 5;
      });

      y += 15;
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').text(
      '© QR Code Management Platform',
      { align: 'center' }
    );

    // Finalize the PDF
    doc.end();
  } catch (err) {
    next(err);
  }
};
