import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as QRCode from 'qrcode';
import toast from 'react-hot-toast';
import {
  QrCodeIcon, PrinterIcon, CheckCircleIcon, XCircleIcon,
  AcademicCapIcon, UserGroupIcon, EyeIcon, ArrowPathIcon,
  DocumentArrowDownIcon, ChevronDownIcon, XMarkIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SearchInput from '../../common/SearchInput';
import { CLASS_NAMES } from '../../../utils/classNames';
import qrManagementService, { ACADEMIC_YEARS } from '../../../services/qrManagement.service';

const CARD_STATUSES = ['All', 'Printed', 'Not Printed'];
const QR_STATUSES = ['All', 'Generated', 'Pending'];

const SCHOOL_INFO = {
  name: 'School Management System',
  contact: '+92-300-1234567',
  address: '123 Education Street, Lahore, Pakistan',
  emergencyNotes: 'In case of emergency, contact the school office immediately. Keep this card with you at all times.',
  instructions: 'This card is the property of the school. If found, please return to the school address above. Not for commercial use.',
};

function formatClassName(cls) {
  return cls.replace('KG ', 'KG-');
}

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

async function generateQrDataUrl(value) {
  try {
    return await QRCode.toDataURL(value, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch {
    return '';
  }
}

const CardPreview = ({ student, side }) => {
  return (
    <div className="w-[340px] mx-auto">
      {side === 'front' ? (
        <div className="bg-white rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full inline-flex items-center justify-center mb-1">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">{SCHOOL_INFO.name}</h3>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-yellow-400 mb-3">
              {getInitials(student.fullName)}
            </div>
            <h4 className="text-base font-bold text-gray-800 text-center">{student.fullName}</h4>
            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-500">ID</span>
                <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">{student.studentId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-500">Class</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatClassName(student.class)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-500">Academic Year</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{student.academicYear}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-center">
            <h3 className="text-sm font-bold text-white">QR Code</h3>
          </div>
          <div className="p-5 flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <QRCodeSVG value={student.studentId} size={180} level="H" includeMargin />
            </div>
            <p className="text-xs font-mono text-gray-500 mt-3">{student.studentId}</p>
            <div className="w-full mt-4 space-y-2 text-xs text-gray-600">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2.5">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-[10px] uppercase tracking-wider mb-1">Emergency Notes</p>
                <p className="text-[10px] text-yellow-700 dark:text-yellow-300 leading-relaxed">{SCHOOL_INFO.emergencyNotes}</p>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-500">School Contact</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{SCHOOL_INFO.contact}</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
                <p className="font-semibold text-blue-800 dark:text-blue-200 text-[10px] uppercase tracking-wider mb-1">Important Instructions</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">{SCHOOL_INFO.instructions}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QRCodeManagement = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [search, setSearch] = useState('');
  const [qrFilter, setQrFilter] = useState('All');
  const [cardFilter, setCardFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewSide, setPreviewSide] = useState('front');
  const [loading, setLoading] = useState(false);

  const cardPreviewRef = useRef(null);

  useEffect(() => {
    const data = qrManagementService.loadStudents();
    setAllStudents(data);
  }, []);

  const filtered = useMemo(() => {
    let list = allStudents;
    if (academicYear) list = list.filter((s) => s.academicYear === academicYear);
    if (className) list = list.filter((s) => s.class === className);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.fullName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
    }
    if (qrFilter !== 'All') list = list.filter((s) => s.qrStatus === qrFilter);
    if (cardFilter !== 'All') list = list.filter((s) => s.cardStatus === cardFilter);
    return list;
  }, [allStudents, academicYear, className, search, qrFilter, cardFilter]);

  useEffect(() => {
    setFilteredStudents(filtered);
    setSelectedIds(new Set());
  }, [filtered]);

  const stats = useMemo(() => qrManagementService.getStats(allStudents), [allStudents]);

  const selectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLoadStudents = () => {
    if (!academicYear || !className) {
      toast.error('Please select Academic Year and Class');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const data = qrManagementService.loadStudents();
      setAllStudents(data);
      setLoading(false);
      toast.success('Students loaded successfully');
    }, 400);
  };

  const handleGenerateMissingQR = () => {
    const count = qrManagementService.generateMissing();
    setAllStudents(qrManagementService.loadStudents());
    toast.success(`${count} QR code${count !== 1 ? 's' : ''} generated`);
  };

  const handleRegenerateQR = (id) => {
    const updated = qrManagementService.updateStudent(id, { qrStatus: 'Generated' });
    if (updated) {
      setAllStudents(qrManagementService.loadStudents());
      toast.success('QR code regenerated');
    }
  };

  const handleMarkPrinted = (ids) => {
    qrManagementService.markPrinted(ids);
    setAllStudents(qrManagementService.loadStudents());
    toast.success(`${ids.length} card${ids.length !== 1 ? 's' : ''} marked as printed`);
  };

  const handlePrintCards = useCallback(async (students) => {
    if (!students.length) { toast.error('No cards to print'); return; }

    const qrUrls = await Promise.all(students.map((s) => generateQrDataUrl(s.studentId)));
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Popup blocked'); return; }

    const cardsHtml = students.map((s, i) => `
      <div class="card-page">
        <div class="card-page-inner">
          <div class="card front">
            <div class="card-header">
              <div class="school-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/></svg>
              </div>
              <h3>${SCHOOL_INFO.name}</h3>
            </div>
            <div class="card-body">
              <div class="student-photo">${getInitials(s.fullName)}</div>
              <h4>${s.fullName}</h4>
              <div class="info-row"><span>ID</span><span>${s.studentId}</span></div>
              <div class="info-row"><span>Class</span><span>${formatClassName(s.class)}</span></div>
              <div class="info-row"><span>Year</span><span>${s.academicYear}</span></div>
            </div>
          </div>
          <div class="card back">
            <div class="card-header"><h3>QR Code</h3></div>
            <div class="card-body">
              <img src="${qrUrls[i]}" alt="QR" class="qr-img" />
              <p class="qr-label">${s.studentId}</p>
              <div class="info-list">
                <p><strong>Name:</strong> ${s.fullName}</p>
                <p><strong>Contact:</strong> ${SCHOOL_INFO.contact}</p>
                <p><strong>Address:</strong> ${SCHOOL_INFO.address}</p>
                <p class="notes">${SCHOOL_INFO.notes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    const printCss = `
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #f5f5f5; }
      .card-page { page-break-after: always; display: flex; justify-content: center; padding: 10px 0; }
      .card-page:last-child { page-break-after: avoid; }
      .card-page-inner { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; max-width: 780px; }
      .card { width: 340px; border-radius: 12px; border: 1.5px solid #d1d5db; overflow: hidden; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .card-header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 10px 16px; text-align: center; }
      .card-header h3 { color: white; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; }
      .school-logo { width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 2px; }
      .card-body { padding: 16px; display: flex; flex-direction: column; align-items: center; }
      .student-photo { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; border: 2px solid #fbbf24; margin-bottom: 8px; }
      .card-body h4 { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 8px; text-align: center; }
      .info-row { width: 100%; display: flex; justify-content: space-between; padding: 4px 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 4px; font-size: 11px; }
      .info-row span:first-child { color: #6b7280; }
      .info-row span:last-child { font-weight: 600; color: #1f2937; }
      .qr-img { width: 160px; height: 160px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px; background: white; }
      .qr-label { font-size: 11px; font-family: monospace; color: #6b7280; margin-top: 6px; }
      .info-list { width: 100%; margin-top: 10px; font-size: 11px; color: #4b5563; line-height: 1.5; }
      .info-list p { margin-bottom: 2px; }
      .notes { font-size: 10px; color: #9ca3af; font-style: italic; margin-top: 4px; }
    `;

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Print ID Cards</title><style>${printCss}</style></head><body>${cardsHtml}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, []);

  const handleSinglePrint = async (student) => {
    await handlePrintCards([student]);
  };

  const handleSinglePdf = async (student) => {
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const qrUrl = await generateQrDataUrl(student.studentId);

      const cardHtml = `
        <div style="display: flex; justify-content: center; padding: 5mm 0;">
          <table style="border-collapse: collapse; width: 720px;">
            <tr>
              <td style="width: 340px; vertical-align: top; padding: 4px;">
                <div style="border-radius: 10px; border: 1px solid #d1d5db; overflow: hidden; background: white;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 10px 16px; text-align: center;">
                    <h3 style="color: white; font-size: 12px; font-weight: 700; margin: 0;">${SCHOOL_INFO.name}</h3>
                  </div>
                  <div style="padding: 14px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; border: 2px solid #fbbf24; margin: 0 auto 6px;">${getInitials(student.fullName)}</div>
                    <h4 style="font-size: 13px; font-weight: 700; color: #1f2937; margin: 0 0 8px;">${student.fullName}</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                      <tr><td style="color: #6b7280; padding: 3px 8px; background: #f9fafb; border-radius: 4px; width: 50%;">ID</td><td style="font-weight: 600; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">${student.studentId}</td></tr>
                      <tr><td style="color: #6b7280; padding: 3px 8px;">Class</td><td style="font-weight: 600; padding: 3px 8px;">${formatClassName(student.class)}</td></tr>
                      <tr><td style="color: #6b7280; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">Year</td><td style="font-weight: 600; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">${student.academicYear}</td></tr>
                    </table>
                  </div>
                </div>
              </td>
              <td style="width: 340px; vertical-align: top; padding: 4px;">
                <div style="border-radius: 10px; border: 1px solid #d1d5db; overflow: hidden; background: white;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 10px 16px; text-align: center;">
                    <h3 style="color: white; font-size: 12px; font-weight: 700; margin: 0;">QR Code</h3>
                  </div>
                  <div style="padding: 14px; text-align: center;">
                    <img src="${qrUrl}" style="width: 150px; height: 150px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 3px; background: white;" />
                    <p style="font-size: 10px; font-family: monospace; color: #6b7280; margin: 4px 0 8px;">${student.studentId}</p>
                    <div style="text-align: left; font-size: 10px; color: #4b5563; line-height: 1.6;">
                      <p><strong>Name:</strong> ${student.fullName}</p>
                      <p><strong>Contact:</strong> ${SCHOOL_INFO.contact}</p>
                      <p style="font-size: 9px; color: #9ca3af; font-style: italic;">${SCHOOL_INFO.instructions}</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>`;

      const element = document.createElement('div');
      element.innerHTML = cardHtml;
      document.body.appendChild(element);

      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `ID-Card-${student.studentId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save();

      document.body.removeChild(element);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleExportPdf = async () => {
    const toPrint = selectedIds.size
      ? filteredStudents.filter((s) => selectedIds.has(s.id))
      : filteredStudents;
    if (!toPrint.length) { toast.error('No students selected'); return; }

    try {
      const { default: html2pdf } = await import('html2pdf.js');

      const qrUrls = await Promise.all(toPrint.map((s) => generateQrDataUrl(s.studentId)));
      const cardsHtml = toPrint.map((s, i) => `
        <div style="page-break-after: always; padding: 5mm 0; display: flex; justify-content: center;">
          <table style="border-collapse: collapse; width: 720px;">
            <tr>
              <td style="width: 340px; vertical-align: top; padding: 4px;">
                <div style="border-radius: 10px; border: 1px solid #d1d5db; overflow: hidden; background: white;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 10px 16px; text-align: center;">
                    <h3 style="color: white; font-size: 12px; font-weight: 700; margin: 0;">${SCHOOL_INFO.name}</h3>
                  </div>
                  <div style="padding: 14px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; border: 2px solid #fbbf24; margin: 0 auto 6px;">${getInitials(s.fullName)}</div>
                    <h4 style="font-size: 13px; font-weight: 700; color: #1f2937; margin: 0 0 8px;">${s.fullName}</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                      <tr><td style="color: #6b7280; padding: 3px 8px; background: #f9fafb; border-radius: 4px; width: 50%;">ID</td><td style="font-weight: 600; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">${s.studentId}</td></tr>
                      <tr><td style="color: #6b7280; padding: 3px 8px;">Class</td><td style="font-weight: 600; padding: 3px 8px;">${formatClassName(s.class)}</td></tr>
                      <tr><td style="color: #6b7280; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">Year</td><td style="font-weight: 600; padding: 3px 8px; background: #f9fafb; border-radius: 4px;">${s.academicYear}</td></tr>
                    </table>
                  </div>
                </div>
              </td>
              <td style="width: 340px; vertical-align: top; padding: 4px;">
                <div style="border-radius: 10px; border: 1px solid #d1d5db; overflow: hidden; background: white;">
                  <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 10px 16px; text-align: center;">
                    <h3 style="color: white; font-size: 12px; font-weight: 700; margin: 0;">QR Code</h3>
                  </div>
                  <div style="padding: 14px; text-align: center;">
                    <img src="${qrUrls[i]}" style="width: 150px; height: 150px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 3px; background: white;" />
                    <p style="font-size: 10px; font-family: monospace; color: #6b7280; margin: 4px 0 8px;">${s.studentId}</p>
                    <div style="text-align: left; font-size: 10px; color: #4b5563; line-height: 1.6;">
                      <p><strong>Name:</strong> ${s.fullName}</p>
                      <p><strong>Contact:</strong> ${SCHOOL_INFO.contact}</p>
                      <p><strong>Address:</strong> ${SCHOOL_INFO.address}</p>
                      <p style="font-size: 9px; color: #9ca3af; font-style: italic;">${SCHOOL_INFO.notes}</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `).join('');

      const pdfHtml = `
        <!DOCTYPE html><html><head>
        <style>
          @page { size: A4; margin: 8mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { border-collapse: collapse; }
        </style>
        </head><body>${cardsHtml}</body></html>
      `;

      const element = document.createElement('div');
      element.innerHTML = pdfHtml;
      document.body.appendChild(element);

      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `ID-Cards-${academicYear || 'all'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save();

      document.body.removeChild(element);
      toast.success('PDF exported successfully');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const renderPhoto = (student) => (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
      {getInitials(student.fullName)}
    </div>
  );

  const renderStatusBadge = (status, type) => {
    if (type === 'qr') {
      return status === 'Generated'
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"><CheckCircleIcon className="h-3 w-3" /> Generated</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"><ClockIcon className="h-3 w-3" /> Pending</span>;
    }
    return status === 'Printed'
      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"><CheckCircleIcon className="h-3 w-3" /> Printed</span>
      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600">Not Printed</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate, manage, and print student ID cards with QR codes</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label="Total Students" value={stats.total} color="blue" />
        <StatCard icon={QrCodeIcon} label="Cards Generated" value={stats.generated} color="green" />
        <StatCard icon={PrinterIcon} label="Cards Printed" value={stats.printed} color="yellow" />
        <StatCard icon={XCircleIcon} label="Pending Cards" value={stats.pending} color="red" />
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Academic Year</label>
            <div className="relative">
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select year</option>
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Class</label>
            <div className="relative">
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Select class</option>
                {CLASS_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">QR Status</label>
            <div className="relative">
              <select
                value={qrFilter}
                onChange={(e) => setQrFilter(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {QR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Card Status</label>
            <div className="relative">
              <select
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {CARD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLoadStudents}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <UserGroupIcon className="h-4 w-4" />
            Load Students
          </button>
          <button
            onClick={handleGenerateMissingQR}
            disabled={stats.pending === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Generate Missing QR Codes
          </button>
          <button
            onClick={() => {
              const selected = filteredStudents.filter((s) => selectedIds.has(s.id));
              handleMarkPrinted(selected.length ? selected.map((s) => s.id) : filteredStudents.map((s) => s.id));
            }}
            disabled={filteredStudents.length === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <PrinterIcon className="h-4 w-4" />
            Mark as Printed
          </button>
          <button
            onClick={() => {
              const toPrint = selectedIds.size
                ? filteredStudents.filter((s) => selectedIds.has(s.id))
                : filteredStudents;
              handlePrintCards(toPrint);
            }}
            disabled={filteredStudents.length === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <PrinterIcon className="h-4 w-4" />
            {selectedIds.size ? `Print Selected (${selectedIds.size})` : 'Print All'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={filteredStudents.length === 0}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export PDF
          </button>
          <div className="ml-auto">
            <SearchInput placeholder="Search by name or ID..." value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Photo</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Student Name</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Student ID</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Academic Year</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">QR Status</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Card Status</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Preview</th>
              <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No students found</p>
                    <p className="text-xs">Select Academic Year and Class, then click Load Students</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">{renderPhoto(student)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{student.studentId}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{student.class}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{student.academicYear}</td>
                  <td className="px-3 py-3">{renderStatusBadge(student.qrStatus, 'qr')}</td>
                  <td className="px-3 py-3">{renderStatusBadge(student.cardStatus, 'card')}</td>
                  <td className="px-3 py-3">
                    <div className="w-8 h-8 bg-white rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <QRCodeSVG value={student.studentId} size={32} level="L" />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPreviewStudent(student); setPreviewSide('front'); }}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                        title="Preview Card"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerateQR(student.id)}
                        className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                        title="Refresh Card"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSinglePrint(student)}
                        className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                        title="Print Card"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSinglePdf(student)}
                        className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredStudents.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</span>
            {selectedIds.size > 0 && (
              <span>{selectedIds.size} selected</span>
            )}
          </div>
        )}
      </div>

      {/* Card Preview Modal */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewStudent(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">ID Card Preview</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewSide('front')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${previewSide === 'front' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setPreviewSide('back')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${previewSide === 'back' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Back
                </button>
              </div>
              <button
                onClick={() => setPreviewStudent(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto" ref={cardPreviewRef}>
              <CardPreview student={previewStudent} side={previewSide} />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleSinglePrint(previewStudent)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PrinterIcon className="h-3.5 w-3.5" /> Print Card
                </button>
                <button
                  onClick={async () => {
                    const url = await generateQrDataUrl(previewStudent.studentId);
                    const link = document.createElement('a');
                    link.download = `QR-${previewStudent.studentId}.png`;
                    link.href = url;
                    link.click();
                    toast.success('QR code downloaded');
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DocumentArrowDownIcon className="h-3.5 w-3.5" /> Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeManagement;

