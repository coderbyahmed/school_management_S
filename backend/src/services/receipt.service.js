import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import Receipt from '../models/receipt.model.js';
import Student from '../models/student.model.js';
import StudentFeeCollection from '../models/studentFeeCollection.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import feeSettingsService from './feeSettings.service.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..');

// ──────────────────────────────────────────────
// Receipt Generation (automatic, idempotent)
// ──────────────────────────────────────────────
const generateReceiptForCollection = async (feeCollectionId, userId) => {
  const collection = await StudentFeeCollection.findById(feeCollectionId);
  if (!collection) {
    throw new ApiError(404, 'Fee collection not found');
  }

  const existing = await Receipt.findOne({ feeCollectionId });
  if (existing) {
    return existing;
  }

  try {
    return await Receipt.create({
      receiptNumber: collection.receiptNumber,
      feeCollectionId: collection._id,
      studentId: collection.studentId,
      academicYear: collection.academicYear,
      class: collection.class,
      generatedBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await Receipt.findOne({ feeCollectionId });
      if (duplicate) return duplicate;
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// Data Assembly
// ──────────────────────────────────────────────
const POPULATE_STUDENT = {
  path: 'studentId',
  select: 'fullName studentId fatherName gender studentImage class academicYear admissionNumber status',
};
const POPULATE_COLLECTION = {
  path: 'feeCollectionId',
  select: 'receiptNumber monthlyFee admissionFee examFee otherCharges discount lateFine totalAmount paidAmount remainingAmount paymentMethod paymentDate remarks collectedBy',
  populate: { path: 'collectedBy', select: 'fullName' },
};

const findReceiptOrThrow = async (id) => {
  const receipt = await Receipt.findById(id)
    .populate(POPULATE_STUDENT)
    .populate(POPULATE_COLLECTION)
    .lean();

  if (!receipt) {
    throw new ApiError(404, 'Receipt not found');
  }

  return receipt;
};

const buildReceiptPayload = async (receipt) => {
  const [school, settings] = await Promise.all([
    SchoolSettings.getSettings(),
    feeSettingsService.getFeeSettings(),
  ]);

  const student = receipt.studentId || {};
  const collection = receipt.feeCollectionId || {};
  const collectedBy = collection.collectedBy || null;

  const schoolAddress = [
    school.address, school.city, school.province, school.country,
  ].filter((part) => part && String(part).trim()).join(', ');

  return {
    _id: receipt._id,
    receiptNumber: receipt.receiptNumber,
    printCount: receipt.printCount || 0,
    reprintCount: receipt.reprintCount || 0,
    lastPrintedAt: receipt.lastPrintedAt || null,
    generatedAt: receipt.createdAt || null,
    student: {
      _id: student._id || null,
      studentId: student.studentId || '',
      fullName: student.fullName || '',
      fatherName: student.fatherName || '',
      gender: student.gender || '',
      studentImage: student.studentImage || '',
      class: receipt.class || student.class || '',
      academicYear: receipt.academicYear || student.academicYear || '',
    },
    collection: {
      _id: collection._id || null,
      receiptNumber: collection.receiptNumber || receipt.receiptNumber,
      monthlyFee: collection.monthlyFee || 0,
      admissionFee: collection.admissionFee || 0,
      examFee: collection.examFee || 0,
      otherCharges: collection.otherCharges || 0,
      discount: collection.discount || 0,
      lateFine: collection.lateFine || 0,
      totalAmount: collection.totalAmount || 0,
      paidAmount: collection.paidAmount || 0,
      remainingAmount: collection.remainingAmount || 0,
      paymentMethod: collection.paymentMethod || '',
      paymentDate: collection.paymentDate || null,
      remarks: collection.remarks || '',
      collectedBy: collectedBy ? { _id: collectedBy._id, fullName: collectedBy.fullName || '' } : null,
    },
    school: {
      schoolName: school.schoolName || '',
      shortName: school.shortName || '',
      address: schoolAddress,
      contactNumber: school.contactNumber || '',
      schoolLogo: school.schoolLogo || '',
      principalSignature: school.principalSignature || '',
      receiptHeader: school.receiptHeader || '',
      receiptFooter: school.receiptFooter || '',
    },
    settings: {
      receipt: {
        showSchoolLogo: settings.receipt?.showSchoolLogo ?? true,
        showStudentPhoto: settings.receipt?.showStudentPhoto ?? true,
        showParentInfo: settings.receipt?.showParentInfo ?? true,
        showFeeBreakdown: settings.receipt?.showFeeBreakdown ?? true,
        showPaymentMethod: settings.receipt?.showPaymentMethod ?? true,
        showRemarks: settings.receipt?.showRemarks ?? true,
        showSignature: settings.receipt?.showSignature ?? true,
      },
    },
  };
};

// ──────────────────────────────────────────────
// View / History / Print
// ──────────────────────────────────────────────
const generateReceipt = async (feeCollectionId, userId) => {
  const existing = await Receipt.findOne({ feeCollectionId });
  if (existing) {
    const populated = await findReceiptOrThrow(existing._id);
    return { receipt: await buildReceiptPayload(populated), created: false };
  }

  const receipt = await generateReceiptForCollection(feeCollectionId, userId);
  const populated = await findReceiptOrThrow(receipt._id);
  return { receipt: await buildReceiptPayload(populated), created: true };
};

const getReceiptById = async (id) => {
  const receipt = await findReceiptOrThrow(id);
  return await buildReceiptPayload(receipt);
};

const getReceiptHistory = async (filters = {}) => {
  const { class: className, academicYear, search, page = 1, limit = 10 } = filters;

  const filter = {};
  if (className) filter.class = className;
  if (academicYear) filter.academicYear = academicYear;

  if (search && String(search).trim()) {
    const term = String(search).trim();
    const idTerm = /^\d+$/.test(term) ? `STD-${term.padStart(6, '0')}` : term;

    const matchedStudents = await Student.find({
      $or: [
        { fullName: { $regex: term, $options: 'i' } },
        { studentId: { $regex: idTerm, $options: 'i' } },
        { admissionNumber: { $regex: idTerm, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();

    const studentIds = matchedStudents.map((s) => s._id);

    filter.$or = [{ receiptNumber: { $regex: term, $options: 'i' } }];
    if (studentIds.length > 0) {
      filter.$or.push({ studentId: { $in: studentIds } });
    }
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * itemsPerPage;

  const [receipts, totalItems] = await Promise.all([
    Receipt.find(filter)
      .populate(POPULATE_STUDENT)
      .populate(POPULATE_COLLECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),
    Receipt.countDocuments(filter),
  ]);

  const list = receipts.map((r) => {
    const student = r.studentId || {};
    const collection = r.feeCollectionId || {};
    const collectedBy = collection.collectedBy || null;
    return {
      _id: r._id,
      receiptNumber: r.receiptNumber,
      student: {
        _id: student._id || null,
        studentId: student.studentId || '',
        fullName: student.fullName || '',
        studentImage: student.studentImage || '',
      },
      class: r.class || '',
      academicYear: r.academicYear || '',
      paidAmount: collection.paidAmount || 0,
      paymentMethod: collection.paymentMethod || '',
      paymentDate: collection.paymentDate || null,
      collectedBy: collectedBy ? { _id: collectedBy._id, fullName: collectedBy.fullName || '' } : null,
      printCount: r.printCount || 0,
      createdAt: r.createdAt || null,
    };
  });

  return {
    receipts: list,
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      totalItems,
    },
  };
};

const markPrinted = async (id, { reprint = false } = {}) => {
  const receipt = await Receipt.findById(id);
  if (!receipt) {
    throw new ApiError(404, 'Receipt not found');
  }

  if (reprint) {
    receipt.reprintCount = (receipt.reprintCount || 0) + 1;
  } else {
    receipt.printCount = (receipt.printCount || 0) + 1;
  }
  receipt.lastPrintedAt = new Date();

  await receipt.save();

  const populated = await findReceiptOrThrow(id);
  return await buildReceiptPayload(populated);
};

const printReceipt = async (id) => markPrinted(id, { reprint: false });
const reprintReceipt = async (id) => markPrinted(id, { reprint: true });

// ──────────────────────────────────────────────
// PDF Generation
// ──────────────────────────────────────────────
const resolveImagePath = (imageValue) => {
  if (!imageValue) return null;
  let relative = imageValue;
  if (/^https?:\/\//i.test(relative)) {
    try {
      relative = new URL(relative).pathname;
    } catch {
      return null;
    }
  }
  const cleaned = String(relative).replace(/^\/+/, '');
  const fullPath = path.resolve(BACKEND_ROOT, cleaned);
  return fs.existsSync(fullPath) ? fullPath : null;
};

const loadImage = (imageValue) => {
  const filePath = resolveImagePath(imageValue);
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
};

const formatMoney = (value) => {
  const num = Number(value) || 0;
  return `Rs. ${num.toLocaleString('en-PK')}`;
};

const formatPdfDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const wrapText = (doc, text, options = {}) => {
  const { x, y, width, align = 'left', size = 10, color = '#111827', weight = 'normal' } = options;
  doc
    .font(weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(size)
    .fillColor(color)
    .text(text, x, y, { width, align, lineGap: 2 });
};

const generateReceiptPdf = async (id) => {
  const receipt = await findReceiptOrThrow(id);
  const payload = await buildReceiptPayload(receipt);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { school, collection, student, settings } = payload;
    const showLogo = settings.receipt.showSchoolLogo;
    const showPhoto = settings.receipt.showStudentPhoto;
    const showParent = settings.receipt.showParentInfo;
    const showBreakdown = settings.receipt.showFeeBreakdown;
    const showPayment = settings.receipt.showPaymentMethod;
    const showRemarks = settings.receipt.showRemarks;
    const showSignature = settings.receipt.showSignature;

    const pageWidth = doc.page.width;
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const lineColor = '#D1D5DB';
    const mutedColor = '#6B7280';
    const textColor = '#111827';

    // ── Header: logo + school name ─────────────
    let headerX = margin;
    if (showLogo) {
      const logoBuffer = loadImage(school.schoolLogo);
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, margin, y, { fit: [56, 56] });
          headerX = margin + 68;
        } catch {
          headerX = margin;
        }
      }
    }

    wrapText(doc, school.schoolName || 'School Name', {
      x: headerX, y: y + 4, width: contentWidth - (headerX - margin), align: 'left', size: 16, weight: 'bold',
    });
    wrapText(doc, school.address, {
      x: headerX, y: y + 24, width: contentWidth - (headerX - margin), align: 'left', size: 9, color: mutedColor,
    });
    if (school.contactNumber) {
      wrapText(doc, `Phone: ${school.contactNumber}`, {
        x: headerX, y: y + 38, width: contentWidth - (headerX - margin), align: 'left', size: 9, color: mutedColor,
      });
    }

    // Receipt no + date (top right)
    wrapText(doc, 'FEE RECEIPT', {
      x: margin, y: y + 20, width: contentWidth, align: 'right', size: 14, weight: 'bold',
    });
    wrapText(doc, `Receipt No: ${payload.receiptNumber}`, {
      x: margin, y: y + 40, width: contentWidth, align: 'right', size: 9, color: mutedColor,
    });
    wrapText(doc, `Date: ${formatPdfDate(collection.paymentDate)}`, {
      x: margin, y: y + 54, width: contentWidth, align: 'right', size: 9, color: mutedColor,
    });

    y += 72;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor(lineColor).stroke();
    y += 18;

    // ── Student Information ────────────────────
    wrapText(doc, 'STUDENT INFORMATION', {
      x: margin, y, width: contentWidth, size: 9, weight: 'bold', color: mutedColor,
    });
    y += 14;

    const infoLeftX = margin;
    const infoRightX = margin + (contentWidth * 0.45);
    const photoX = showPhoto ? pageWidth - margin - 64 : 0;
    const infoWidth = showPhoto ? contentWidth - 80 : contentWidth;

    let infoY = y;
    wrapText(doc, `Student Name: ${student.fullName || '-'}`, {
      x: infoLeftX, y: infoY, width: infoWidth, size: 11, weight: 'bold',
    });
    infoY += 17;
    if (showParent) {
      wrapText(doc, `Father Name: ${student.fatherName || '-'}`, {
        x: infoLeftX, y: infoY, width: infoWidth, size: 10,
      });
      infoY += 16;
    }
    wrapText(doc, `Student ID: ${student.studentId || '-'}`, {
      x: infoLeftX, y: infoY, width: infoWidth, size: 10,
    });
    infoY += 16;
    wrapText(doc, `Class: ${student.class || '-'}    Academic Year: ${student.academicYear || '-'}`, {
      x: infoLeftX, y: infoY, width: infoWidth, size: 10,
    });
    infoY += 16;
    wrapText(doc, `Gender: ${student.gender || '-'}`, {
      x: infoLeftX, y: infoY, width: infoWidth, size: 10,
    });

    if (showPhoto) {
      const photoBuffer = loadImage(student.studentImage);
      if (photoBuffer) {
        try {
          doc.image(photoBuffer, photoX, y, { fit: [60, 60] });
          doc.rect(photoX, y, 60, 60).lineWidth(0.5).strokeColor(lineColor).stroke();
        } catch {
          // photo could not be rendered — skip
        }
      }
    }

    y = Math.max(y, infoY + 8) + 12;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor(lineColor).stroke();
    y += 18;

    // ── Fee Breakdown ──────────────────────────
    if (showBreakdown) {
      wrapText(doc, 'FEE DETAILS', {
        x: margin, y, width: contentWidth, size: 9, weight: 'bold', color: mutedColor,
      });
      y += 14;

      const tableX = margin;
      const tableWidth = contentWidth;
      const col1X = tableX + 4;
      const col2X = tableX + tableWidth - 110;
      const rowHeight = 18;

      const drawRow = (label, amount, { bold = false, color = textColor } = {}) => {
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(10)
          .fillColor(color)
          .text(label, col1X, y, { width: col2X - col1X - 8 });
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(10)
          .fillColor(color)
          .text(amount, col2X, y, { width: 104, align: 'right' });
        y += rowHeight;
      };

      const feeRows = [
        { label: 'Monthly Fee', value: formatMoney(collection.monthlyFee) },
        { label: 'Admission Fee', value: formatMoney(collection.admissionFee) },
        { label: 'Exam Fee', value: formatMoney(collection.examFee) },
        { label: 'Other Charges', value: formatMoney(collection.otherCharges) },
        { label: 'Discount', value: `- ${formatMoney(collection.discount)}`, color: '#15803D' },
        { label: 'Late Fine', value: `+ ${formatMoney(collection.lateFine)}`, color: '#B45309' },
      ];

      doc.rect(tableX, y, tableWidth, rowHeight).fill('#F9FAFB').strokeColor(lineColor).lineWidth(0.5);
      doc
        .font('Helvetica-Bold').fontSize(9).fillColor(mutedColor)
        .text('Description', col1X, y + 4)
        .text('Amount', col2X, y + 4, { width: 104, align: 'right' });
      y += rowHeight;

      feeRows.forEach((row) => {
        drawRow(row.label, row.value, { color: row.color || textColor });
      });

      doc.moveTo(tableX, y).lineTo(tableX + tableWidth, y).lineWidth(0.75).strokeColor(lineColor).stroke();
      y += 6;

      const totals = [
        { label: 'Total Amount', value: formatMoney(collection.totalAmount) },
        { label: 'Paid Amount', value: formatMoney(collection.paidAmount) },
        { label: 'Remaining Amount', value: formatMoney(collection.remainingAmount) },
      ];
      totals.forEach((row) => {
        drawRow(row.label, row.value, { bold: true });
      });

      y += 6;
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor(lineColor).stroke();
      y += 18;
    } else {
      wrapText(doc, `Total Amount: ${formatMoney(collection.totalAmount)}    Paid: ${formatMoney(collection.paidAmount)}    Remaining: ${formatMoney(collection.remainingAmount)}`, {
        x: margin, y, width: contentWidth, size: 11, weight: 'bold',
      });
      y += 22;
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor(lineColor).stroke();
      y += 18;
    }

    // ── Payment Information ────────────────────
    if (showPayment) {
      wrapText(doc, 'PAYMENT INFORMATION', {
        x: margin, y, width: contentWidth, size: 9, weight: 'bold', color: mutedColor,
      });
      y += 14;
      wrapText(doc, `Payment Method: ${collection.paymentMethod || '-'}`, {
        x: margin, y, width: contentWidth, size: 10,
      });
      y += 16;
      wrapText(doc, `Payment Date: ${formatPdfDate(collection.paymentDate)}`, {
        x: margin, y, width: contentWidth, size: 10,
      });
      y += 16;
      wrapText(doc, `Collected By: ${collection.collectedBy?.fullName || '-'}`, {
        x: margin, y, width: contentWidth, size: 10,
      });
      y += 22;
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor(lineColor).stroke();
      y += 18;
    }

    // ── Remarks ────────────────────────────────
    if (showRemarks && collection.remarks) {
      wrapText(doc, 'REMARKS', {
        x: margin, y, width: contentWidth, size: 9, weight: 'bold', color: mutedColor,
      });
      y += 14;
      wrapText(doc, collection.remarks, {
        x: margin, y, width: contentWidth, size: 10,
      });
      y += 22;
    }

    // ── Signature Area ─────────────────────────
    if (showSignature) {
      y += 40;
      const sigY = y;
      const sigImage = loadImage(school.principalSignature);
      if (sigImage) {
        try {
          doc.image(sigImage, margin + 30, sigY - 30, { fit: [110, 36] });
        } catch {
          // signature image could not be rendered — draw the line only
        }
      }
      doc.moveTo(margin, sigY).lineTo(margin + 170, sigY).lineWidth(0.75).strokeColor(textColor).stroke();
      wrapText(doc, 'Authorized Signature', {
        x: margin, y: sigY + 4, width: 170, align: 'center', size: 9, color: mutedColor,
      });
    }

    // ── Footer ─────────────────────────────────
    const footerText = school.receiptFooter || `This is a computer generated receipt. Receipt No: ${payload.receiptNumber}`;
    const footerY = doc.page.height - 48;
    doc.moveTo(margin, footerY - 12).lineTo(pageWidth - margin, footerY - 12).lineWidth(0.75).strokeColor(lineColor).stroke();
    wrapText(doc, footerText, {
      x: margin, y: footerY - 6, width: contentWidth, align: 'center', size: 8, color: mutedColor,
    });

    doc.end();
  });
};

export default {
  generateReceiptForCollection,
  generateReceipt,
  getReceiptById,
  getReceiptHistory,
  printReceipt,
  reprintReceipt,
  generateReceiptPdf,
};
