import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import Student from '../models/student.model.js';
import StudentFeeCollection from '../models/studentFeeCollection.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const REPORT_TITLES = {
  all: 'All Fee Collections Report',
  paid: 'Paid Students Report',
  pending: 'Pending Students Report',
  partial: 'Partial Payment Report',
  monthly: 'Monthly Collection Report',
  classWise: 'Class Wise Collection Report',
  outstanding: 'Outstanding Report',
};

const LIST_REPORT_TYPES = ['all', 'paid', 'pending', 'partial', 'outstanding'];

// ──────────────────────────────────────────────
// Filtering
// ──────────────────────────────────────────────
const buildReportFilter = async (filters) => {
  const { reportType } = filters;
  const filter = {};

  if (filters.academicYear) filter.academicYear = filters.academicYear;
  if (filters.class) filter.class = filters.class;
  if (filters.paymentMethod) filter.paymentMethod = filters.paymentMethod;
  if (filters.studentId) filter.studentId = filters.studentId;

  if (filters.receiptNumber) {
    filter.receiptNumber = { $regex: filters.receiptNumber, $options: 'i' };
  }

  if (filters.month) {
    filter.$expr = { $eq: [{ $month: '$paymentDate' }, filters.month] };
  }
  if (filters.startDate || filters.endDate) {
    filter.paymentDate = {};
    if (filters.startDate) {
      filter.paymentDate.$gte = new Date(new Date(filters.startDate).setHours(0, 0, 0, 0));
    }
    if (filters.endDate) {
      filter.paymentDate.$lte = new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));
    }
  }

  if (reportType === 'paid') {
    filter.paymentStatus = 'Paid';
  } else if (reportType === 'pending') {
    filter.paymentStatus = 'Pending';
    filter.remainingAmount = { $gt: 0 };
  } else if (reportType === 'partial') {
    filter.paymentStatus = 'Partial';
    filter.paidAmount = { $gt: 0 };
    filter.remainingAmount = { $gt: 0 };
  } else if (reportType === 'outstanding') {
    filter.remainingAmount = { $gt: 0 };
  } else if (filters.status) {
    filter.paymentStatus = filters.status;
  }

  if (filters.search && String(filters.search).trim()) {
    const term = String(filters.search).trim();
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
    const or = [{ receiptNumber: { $regex: term, $options: 'i' } }];
    if (studentIds.length > 0) {
      or.push({ studentId: { $in: studentIds } });
    }
    filter.$or = or;
  }

  return filter;
};

const computeTotals = async (filter) => {
  const [agg] = await StudentFeeCollection.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalStudents: { $addToSet: '$studentId' },
        totalCollections: { $sum: 1 },
        totalCollected: { $sum: '$paidAmount' },
        totalRemaining: { $sum: '$remainingAmount' },
        totalDiscount: { $sum: '$discount' },
        totalFine: { $sum: '$lateFine' },
        totalFees: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        totalStudents: { $size: '$totalStudents' },
        totalCollections: 1,
        totalCollected: 1,
        totalRemaining: 1,
        totalDiscount: 1,
        totalFine: 1,
        totalFees: 1,
      },
    },
  ]);

  return (
    agg || {
      totalStudents: 0,
      totalCollections: 0,
      totalCollected: 0,
      totalRemaining: 0,
      totalDiscount: 0,
      totalFine: 0,
      totalFees: 0,
    }
  );
};

const computeDueStatus = (collection) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const paymentDate = collection.paymentDate ? new Date(collection.paymentDate) : null;
  const overdue = paymentDate && paymentDate < monthStart;

  if (collection.paymentStatus === 'Partial') {
    return overdue ? 'Overdue' : 'Partial';
  }
  return overdue ? 'Overdue' : 'Due';
};

const mapListRow = (c, { reportType } = {}) => {
  const student = c.studentId || {};
  const collectedBy = c.collectedBy || null;

  const row = {
    _id: c._id,
    receiptNumber: c.receiptNumber || '',
    student: {
      _id: student._id || null,
      fullName: student.fullName || '',
      studentId: student.studentId || '',
      studentImage: student.studentImage || '',
      admissionNumber: student.admissionNumber || '',
    },
    studentName: student.fullName || '',
    studentImage: student.studentImage || '',
    studentId: student.studentId || '',
    class: c.class || '',
    academicYear: c.academicYear || '',
    totalAmount: c.totalAmount || 0,
    paidAmount: c.paidAmount || 0,
    remainingAmount: c.remainingAmount || 0,
    discount: c.discount || 0,
    lateFine: c.lateFine || 0,
    paymentMethod: c.paymentMethod || '',
    paymentDate: c.paymentDate || null,
    status: c.paymentStatus || '',
    collectedBy: collectedBy ? { _id: collectedBy._id, fullName: collectedBy.fullName || '' } : null,
    collectedByName: collectedBy ? collectedBy.fullName || '' : '',
  };

  if (reportType === 'outstanding') {
    row.dueStatus = computeDueStatus(c);
  }

  return row;
};

const buildFiltersApplied = (filters) => {
  const parts = [];
  if (filters.academicYear) parts.push(`Academic Year: ${filters.academicYear}`);
  if (filters.class) parts.push(`Class: ${filters.class}`);
  if (filters.month) parts.push(`Month: ${MONTH_NAMES[filters.month - 1]}`);
  if (filters.status) parts.push(`Status: ${filters.status}`);
  if (filters.paymentMethod) parts.push(`Payment Method: ${filters.paymentMethod}`);
  if (filters.startDate) parts.push(`From: ${new Date(filters.startDate).toISOString().slice(0, 10)}`);
  if (filters.endDate) parts.push(`To: ${new Date(filters.endDate).toISOString().slice(0, 10)}`);
  if (filters.receiptNumber) parts.push(`Receipt No: ${filters.receiptNumber}`);
  if (filters.studentId) parts.push(`Student: ${filters.studentId}`);
  if (filters.search) parts.push(`Search: ${filters.search}`);
  return parts.length > 0 ? parts.join(' | ') : 'No filters applied';
};

const getSchoolInfo = async () => {
  const school = await SchoolSettings.getSettings();
  return {
    schoolName: school.schoolName || 'School Name',
    address: [school.address, school.city, school.province, school.country]
      .filter((part) => part && String(part).trim())
      .join(', '),
    contactNumber: school.contactNumber || '',
    schoolLogo: school.schoolLogo || '',
    pdfFooter: school.pdfFooter || school.receiptFooter || '',
  };
};

// ──────────────────────────────────────────────
// Report Generation
// ──────────────────────────────────────────────
const generateReport = async (filters, user, options = {}) => {
  const { reportType } = filters;
  const forExport = options.forExport === true;

  if (!REPORT_TITLES[reportType]) {
    throw new ApiError(400, 'Invalid report type');
  }

  const filter = await buildReportFilter(filters);
  const school = await getSchoolInfo();
  const totals = await computeTotals(filter);

  let rows = [];
  let pagination = null;

  if (LIST_REPORT_TYPES.includes(reportType)) {
    let query = StudentFeeCollection.find(filter)
      .populate('studentId', 'fullName studentId studentImage admissionNumber fatherName')
      .populate('collectedBy', 'fullName')
      .sort({ paymentDate: -1, createdAt: -1 });

    if (!forExport) {
      const currentPage = Math.max(1, parseInt(filters.page, 10) || 1);
      const itemsPerPage = Math.max(1, Math.min(1000, parseInt(filters.limit, 10) || 20));
      query = query.skip((currentPage - 1) * itemsPerPage).limit(itemsPerPage);
      const totalItems = await StudentFeeCollection.countDocuments(filter);
      pagination = {
        currentPage,
        totalPages: Math.ceil(totalItems / itemsPerPage),
        totalItems,
      };
    }

    const collections = await query.lean();
    rows = collections.map((c) => mapListRow(c, { reportType }));
  } else if (reportType === 'monthly') {
    const monthly = await StudentFeeCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          totalCollected: { $sum: '$paidAmount' },
          totalRemaining: { $sum: '$remainingAmount' },
          students: { $addToSet: '$studentId' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          totalCollected: 1,
          totalRemaining: 1,
          studentCount: { $size: '$students' },
        },
      },
      { $sort: { month: 1 } },
    ]);
    rows = monthly.map((m) => ({
      month: m.month,
      monthLabel: MONTH_NAMES[m.month - 1],
      totalCollected: m.totalCollected,
      totalRemaining: m.totalRemaining,
      studentCount: m.studentCount,
    }));
  } else if (reportType === 'classWise') {
    const byClass = await StudentFeeCollection.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$class',
          collected: { $sum: '$paidAmount' },
          pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$remainingAmount', 0] } },
          partial: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Partial'] }, '$remainingAmount', 0] } },
          students: { $addToSet: '$studentId' },
        },
      },
      {
        $project: {
          _id: 0,
          class: '$_id',
          collected: 1,
          pending: 1,
          partial: 1,
          studentCount: { $size: '$students' },
        },
      },
      { $sort: { class: 1 } },
    ]);
    rows = byClass;
  }

  const meta = {
    generatedAt: new Date(),
    generatedBy: user ? user.fullName || String(user._id) : 'System',
    totalRows: rows.length,
  };

  return {
    reportType,
    title: REPORT_TITLES[reportType],
    filtersApplied: buildFiltersApplied(filters),
    filters,
    rows,
    totals,
    pagination,
    school,
    meta,
  };
};

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

const pdfText = (doc, text, x, y, options = {}) => {
  const { width, align = 'left', size = 9, color = '#111827', weight = 'normal' } = options;
  doc
    .font(weight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(size)
    .fillColor(color)
    .text(String(text), x, y, { width, align, lineGap: 2 });
};

const PDF_COLUMNS = {
  list: [
    { header: 'Receipt No', key: 'receiptNumber', weight: 11 },
    { header: 'Student', key: 'studentName', weight: 16, photo: true },
    { header: 'Student ID', key: 'studentId', weight: 10 },
    { header: 'Class', key: 'class', weight: 8 },
    { header: 'Year', key: 'academicYear', weight: 8 },
    { header: 'Paid', key: 'paidAmount', weight: 10, align: 'right', money: true },
    { header: 'Remaining', key: 'remainingAmount', weight: 10, align: 'right', money: true },
    { header: 'Method', key: 'paymentMethod', weight: 10 },
    { header: 'Date', key: 'paymentDate', weight: 9 },
    { header: 'Status', key: 'status', weight: 7 },
    { header: 'Collected By', key: 'collectedByName', weight: 11 },
  ],
  monthly: [
    { header: 'Month', key: 'monthLabel', weight: 30 },
    { header: 'Total Collected', key: 'totalCollected', weight: 28, align: 'right', money: true },
    { header: 'Students', key: 'studentCount', weight: 15, align: 'center' },
    { header: 'Total Remaining', key: 'totalRemaining', weight: 27, align: 'right', money: true },
  ],
  classWise: [
    { header: 'Class', key: 'class', weight: 30 },
    { header: 'Collected', key: 'collected', weight: 20, align: 'right', money: true },
    { header: 'Pending', key: 'pending', weight: 20, align: 'right', money: true },
    { header: 'Partial', key: 'partial', weight: 20, align: 'right', money: true },
    { header: 'Students', key: 'studentCount', weight: 10, align: 'center' },
  ],
};

const cellText = (row, col) => {
  if (col.money) return formatMoney(row[col.key]);
  if (col.key === 'paymentDate') return formatPdfDate(row[col.key]);
  const v = row[col.key];
  return v === undefined || v === null ? '-' : String(v);
};

const drawPdfHeaderRow = (doc, columns, xStart, widths, y, rowHeight) => {
  doc.rect(xStart, y, widths.total, rowHeight).fill('#F3F4F6');
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(7.5);
  columns.forEach((col) => {
    doc.text(col.header, xStart + col.x + 3, y + 5, {
      width: col.width - 6,
      align: col.align === 'right' ? 'right' : 'left',
    });
  });
  doc
    .moveTo(xStart, y + rowHeight)
    .lineTo(xStart + widths.total, y + rowHeight)
    .lineWidth(0.4)
    .strokeColor('#D1D5DB')
    .stroke();
};

const drawPdfRow = (doc, columns, row, xStart, y, rowHeight) => {
  doc.fillColor('#111827').font('Helvetica').fontSize(7.5);
  columns.forEach((col) => {
    if (col.photo) {
      const img = loadImage(row.studentImage);
      const imgX = xStart + col.x + 2;
      if (img) {
        try {
          doc.image(img, imgX, y + 2, { fit: [14, 14] });
        } catch {
          // image could not be rendered
        }
      }
      doc.text(cellText(row, col), imgX + 16, y + 4, {
        width: col.width - 22,
        align: col.align === 'right' ? 'right' : 'left',
      });
    } else {
      doc.text(cellText(row, col), xStart + col.x + 3, y + 4, {
        width: col.width - 6,
        align: col.align === 'right' ? 'right' : 'left',
      });
    }
  });
  doc
    .moveTo(xStart, y + rowHeight)
    .lineTo(xStart + widthsTotal(xStart, columns), y + rowHeight)
    .lineWidth(0.3)
    .strokeColor('#E5E7EB')
    .stroke();
};

const widthsTotal = (xStart, columns) => columns.reduce((s, c) => s + c.width, 0);

const generateReportPdf = async (filters, user) => {
  const report = await generateReport(filters, user, { forExport: true });
  const { school, rows, totals, meta, reportType } = report;
  const columns = PDF_COLUMNS[reportType] || PDF_COLUMNS.list;
  const isList = LIST_REPORT_TYPES.includes(reportType);
  const orientation = isList ? 'landscape' : 'portrait';
  const rowHeight = 18;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: orientation, margin: 48 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const margin = 48;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const totalWeight = columns.reduce((s, c) => s + c.weight, 0);
    const withPositions = columns.map((c) => {
      const width = Math.round((c.weight / totalWeight) * contentWidth);
      return { ...c, width };
    });
    let acc = 0;
    withPositions.forEach((c) => {
      c.x = acc;
      acc += c.width;
    });
    const totalWidth = acc;
    const xStart = margin;

    // Header
    let headerX = margin;
    const logo = loadImage(school.schoolLogo);
    if (logo) {
      try {
        doc.image(logo, margin, y, { fit: [48, 48] });
        headerX = margin + 58;
      } catch {
        headerX = margin;
      }
    }
    pdfText(doc, school.schoolName, headerX, y + 2, { width: contentWidth - (headerX - margin), size: 16, weight: 'bold' });
    if (school.address) {
      pdfText(doc, school.address, headerX, y + 22, { width: contentWidth - (headerX - margin), size: 9, color: '#6B7280' });
    }
    if (school.contactNumber) {
      pdfText(doc, `Phone: ${school.contactNumber}`, headerX, y + 36, { width: contentWidth - (headerX - margin), size: 9, color: '#6B7280' });
    }

    pdfText(doc, report.title, margin, y + 8, { width: contentWidth, align: 'right', size: 14, weight: 'bold' });
    pdfText(doc, `Generated: ${formatPdfDate(meta.generatedAt)}`, margin, y + 26, { width: contentWidth, align: 'right', size: 8, color: '#6B7280' });
    pdfText(doc, `Generated By: ${meta.generatedBy}`, margin, y + 38, { width: contentWidth, align: 'right', size: 8, color: '#6B7280' });

    y += 56;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor('#D1D5DB').stroke();
    y += 12;
    pdfText(doc, `Filters: ${report.filtersApplied}`, margin, y, { width: contentWidth, size: 8, color: '#6B7280' });
    y += 12;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(0.75).strokeColor('#D1D5DB').stroke();
    y += 12;

    if (rows.length === 0) {
      pdfText(doc, 'No records match the selected filters.', margin, y, { width: contentWidth, size: 11 });
      y += 20;
    } else {
      drawPdfHeaderRow(doc, withPositions, xStart, { total: totalWidth }, y, rowHeight);
      y += rowHeight;

      for (const row of rows) {
        if (y + rowHeight > doc.page.height - 78) {
          doc.addPage();
          y = margin + 10;
          drawPdfHeaderRow(doc, withPositions, xStart, { total: totalWidth }, y, rowHeight);
          y += rowHeight;
        }
        drawPdfRow(doc, withPositions, row, xStart, y, rowHeight);
        y += rowHeight;
      }
    }

    // Grand totals
    y += 14;
    pdfText(doc, 'GRAND TOTALS', margin, y, { width: contentWidth, size: 10, weight: 'bold' });
    y += 12;
    const totalItems = [
      ['Total Students', String(totals.totalStudents)],
      ['Total Collected', formatMoney(totals.totalCollected)],
      ['Total Remaining', formatMoney(totals.totalRemaining)],
      ['Total Discount', formatMoney(totals.totalDiscount)],
      ['Total Fine', formatMoney(totals.totalFine)],
      ['Total Fees', formatMoney(totals.totalFees)],
    ];
    const boxWidth = contentWidth / 3;
    for (let i = 0; i < totalItems.length; i += 3) {
      totalItems.slice(i, i + 3).forEach(([label, value], idx) => {
        const bx = margin + boxWidth * idx;
        doc.rect(bx, y, boxWidth - 6, 36).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        pdfText(doc, label, bx + 6, y + 6, { width: boxWidth - 18, size: 7.5, color: '#6B7280' });
        pdfText(doc, value, bx + 6, y + 16, { width: boxWidth - 18, size: 10, weight: 'bold' });
      });
      y += 44;
    }

    // Footer
    const footerY = doc.page.height - 48;
    doc.moveTo(margin, footerY - 12).lineTo(pageWidth - margin, footerY - 12).lineWidth(0.75).strokeColor('#D1D5DB').stroke();
    const footerText = school.pdfFooter || `Generated on ${formatPdfDate(meta.generatedAt)} by ${meta.generatedBy}`;
    pdfText(doc, footerText, margin, footerY - 6, { width: contentWidth, align: 'center', size: 8, color: '#6B7280' });

    doc.end();
  });
};

// ──────────────────────────────────────────────
// Excel Generation
// ──────────────────────────────────────────────
const EXCEL_COLUMNS = {
  list: [
    { header: 'Receipt No', key: 'receiptNumber', width: 22 },
    { header: 'Student Name', key: 'studentName', width: 26 },
    { header: 'Student ID', key: 'studentId', width: 16 },
    { header: 'Class', key: 'class', width: 12 },
    { header: 'Academic Year', key: 'academicYear', width: 14 },
    { header: 'Paid Amount (Rs.)', key: 'paidAmount', width: 16, money: true, align: 'right' },
    { header: 'Remaining (Rs.)', key: 'remainingAmount', width: 16, money: true, align: 'right' },
    { header: 'Payment Method', key: 'paymentMethod', width: 16 },
    { header: 'Payment Date', key: 'paymentDate', width: 16, date: true },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Collected By', key: 'collectedByName', width: 22 },
  ],
  monthly: [
    { header: 'Month', key: 'monthLabel', width: 18 },
    { header: 'Total Collected (Rs.)', key: 'totalCollected', width: 20, money: true, align: 'right' },
    { header: 'Students', key: 'studentCount', width: 12, align: 'center' },
    { header: 'Total Remaining (Rs.)', key: 'totalRemaining', width: 20, money: true, align: 'right' },
  ],
  classWise: [
    { header: 'Class', key: 'class', width: 16 },
    { header: 'Collected (Rs.)', key: 'collected', width: 18, money: true, align: 'right' },
    { header: 'Pending (Rs.)', key: 'pending', width: 18, money: true, align: 'right' },
    { header: 'Partial (Rs.)', key: 'partial', width: 18, money: true, align: 'right' },
    { header: 'Students', key: 'studentCount', width: 12, align: 'center' },
  ],
};

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
};

const excelCellValue = (row, col) => {
  if (col.money) {
    const n = Number(row[col.key]) || 0;
    return { value: n, numFmt: '"Rs. "#,##0' };
  }
  if (col.date) {
    const d = row[col.key];
    if (!d) return { value: '-', numFmt: undefined };
    const date = new Date(d);
    if (isNaN(date.getTime())) return { value: '-', numFmt: undefined };
    return { value: date, numFmt: 'dd-mmm-yyyy' };
  }
  const v = row[col.key];
  return { value: v === undefined || v === null ? '-' : String(v), numFmt: undefined };
};

const generateReportExcel = async (filters, user) => {
  const report = await generateReport(filters, user, { forExport: true });
  const { rows, totals, meta, reportType, school } = report;
  const columns = EXCEL_COLUMNS[reportType] || EXCEL_COLUMNS.list;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = meta.generatedBy || 'School Management System';
  workbook.created = meta.generatedAt;

  const sheet = workbook.addWorksheet(report.title.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));
  const lastCol = String.fromCharCode(64 + columns.length);

  sheet.mergeCells(`A1:${lastCol}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = school.schoolName;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 26;

  sheet.mergeCells(`A2:${lastCol}2`);
  const subtitleCell = sheet.getCell('A2');
  subtitleCell.value = report.title;
  subtitleCell.font = { bold: true, size: 12 };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells(`A3:${lastCol}3`);
  const filterCell = sheet.getCell('A3');
  filterCell.value = `Filters: ${report.filtersApplied}`;
  filterCell.font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  filterCell.alignment = { horizontal: 'center', vertical: 'middle' };

  if (school.address) {
    sheet.mergeCells(`A4:${lastCol}4`);
    const addrCell = sheet.getCell('A4');
    addrCell.value = school.address;
    addrCell.font = { size: 9, color: { argb: 'FF6B7280' } };
    addrCell.alignment = { horizontal: 'center' };
  }

  const headerRowNum = 6;
  columns.forEach((col, i) => {
    const cell = sheet.getCell(headerRowNum, i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { vertical: 'middle', horizontal: col.align === 'right' ? 'right' : 'center' };
    cell.border = thinBorder;
  });
  sheet.getRow(headerRowNum).height = 22;

  rows.forEach((row, r) => {
    const rowNum = headerRowNum + 1 + r;
    columns.forEach((col, i) => {
      const cell = sheet.getCell(rowNum, i + 1);
      const { value, numFmt } = excelCellValue(row, col);
      cell.value = value;
      if (numFmt) cell.numFmt = numFmt;
      cell.alignment = { vertical: 'middle', horizontal: col.align === 'right' ? 'right' : 'left' };
      cell.border = thinBorder;
    });
  });

  const totalRowNum = headerRowNum + 1 + rows.length + 1;
  sheet.mergeCells(`A${totalRowNum}:${lastCol}${totalRowNum}`);
  const totalCell = sheet.getCell(`A${totalRowNum}`);
  totalCell.value =
    `Grand Totals | Students: ${totals.totalStudents} | Collected: ${formatMoney(totals.totalCollected)} | ` +
    `Remaining: ${formatMoney(totals.totalRemaining)} | Discount: ${formatMoney(totals.totalDiscount)} | ` +
    `Fine: ${formatMoney(totals.totalFine)} | Fees: ${formatMoney(totals.totalFees)}`;
  totalCell.font = { bold: true, size: 10 };
  totalCell.alignment = { horizontal: 'left', vertical: 'middle' };
  totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  sheet.getRow(totalRowNum).height = 20;

  const footerRowNum = totalRowNum + 2;
  sheet.mergeCells(`A${footerRowNum}:${lastCol}${footerRowNum}`);
  const footerCell = sheet.getCell(`A${footerRowNum}`);
  footerCell.value = `Generated on ${formatPdfDate(meta.generatedAt)} by ${meta.generatedBy}`;
  footerCell.font = { size: 9, italic: true, color: { argb: 'FF6B7280' } };
  footerCell.alignment = { horizontal: 'center' };

  columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width || 14;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export default {
  generateReport,
  generateReportPdf,
  generateReportExcel,
};
