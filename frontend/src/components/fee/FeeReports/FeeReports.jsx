import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  DocumentChartBarIcon, DocumentArrowDownIcon, PrinterIcon, ArrowPathIcon,
  CurrencyDollarIcon, UsersIcon, ClockIcon, ScaleIcon, BanknotesIcon, ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection/CardSection';
import StatCard from '../../common/StatCard/StatCard';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import DateInput from '../../common/DateInput/DateInput';
import feeReportsService from '../../../services/feeReports/feeReports.service';

const SESSIONS = feeReportsService.sessions;
const MONTHS = feeReportsService.months;
const CLASSES = feeReportsService.classes;
const STATUS_OPTIONS = feeReportsService.statusOptions;
const PAYMENT_METHODS = feeReportsService.paymentMethods;
const REPORT_TYPES = feeReportsService.reportTypes;

const LIST_REPORT_TYPES = ['all', 'paid', 'pending', 'partial', 'outstanding'];
const STATUS_LOCKED_TYPES = ['paid', 'pending', 'partial', 'outstanding'];

const ITEMS_PER_PAGE = 10;

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Due: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const fullCurrency = (val) => {
  const n = Number(val);
  if (isNaN(n)) return 'Rs. 0';
  return 'Rs. ' + n.toLocaleString();
};

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const getInitials = (name) => {
  if (!name) return 'N/A';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700', 'from-cyan-500 to-cyan-700',
  ];
  let hash = 0;
  const str = name || '';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const emptyFilters = {
  year: 'All',
  class: 'All',
  month: 'All',
  status: 'All',
  paymentMethod: 'All',
  startDate: '',
  endDate: '',
  search: '',
};

const FeeReports = () => {
  const [reportType, setReportType] = useState('all');
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [printPreview, setPrintPreview] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reload, setReload] = useState(0);

  const buildParams = useCallback((page, { forExport = false } = {}) => {
    const params = { reportType };
    if (!forExport) {
      params.page = page || 1;
      params.limit = ITEMS_PER_PAGE;
    }
    if (filters.year !== 'All') params.academicYear = filters.year;
    if (filters.class !== 'All') params.class = filters.class;
    const monthIndex = MONTHS.indexOf(filters.month);
    if (monthIndex >= 0) params.month = monthIndex + 1;
    if (filters.status !== 'All') params.status = filters.status;
    if (filters.paymentMethod !== 'All') params.paymentMethod = filters.paymentMethod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.search.trim()) params.search = filters.search.trim();
    return params;
  }, [reportType, filters]);

  const loadReport = useCallback(async (page) => {
    setLoading(true);
    try {
      const data = await feeReportsService.generateReport(buildParams(page));
      setReport(data);
    } catch (err) {
      setReport(null);
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport(1);
  }, [loadReport, reload]);

  const handleGenerate = async () => {
    setCurrentPage(1);
    setGenerating(true);
    try {
      const data = await feeReportsService.generateReport(buildParams(1));
      setReport(data);
      toast.success('Report generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setFilters({ ...emptyFilters });
    setCurrentPage(1);
    setReload((r) => r + 1);
  };

  const handleFilterChange = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const blob = await feeReportsService.downloadPdf(buildParams(1, { forExport: true }));
      saveBlob(blob, `fee-report-${reportType}.pdf`);
      toast.success('PDF exported successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    if (exportingExcel) return;
    setExportingExcel(true);
    try {
      const blob = await feeReportsService.downloadExcel(buildParams(1, { forExport: true }));
      saveBlob(blob, `fee-report-${reportType}.xlsx`);
      toast.success('Excel exported successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to export Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handlePrint = async () => {
    if (printLoading) return;
    setPrintLoading(true);
    try {
      let data = report;
      if (!data) {
        data = await feeReportsService.getPrintData(buildParams(1, { forExport: true }));
        setReport(data);
      }
      setPrintPreview(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to prepare report for printing');
    } finally {
      setPrintLoading(false);
    }
  };

  const printWindow = () => {
    window.print();
  };

  const totals = report?.totals || {
    totalStudents: 0, totalCollected: 0, totalRemaining: 0, totalDiscount: 0, totalFine: 0, totalFees: 0,
  };

  const statCards = [
    { icon: UsersIcon, label: 'Total Students', value: totals.totalStudents, color: 'blue' },
    { icon: CurrencyDollarIcon, label: 'Total Collected', value: fullCurrency(totals.totalCollected), color: 'green' },
    { icon: ClockIcon, label: 'Total Remaining', value: fullCurrency(totals.totalRemaining), color: 'yellow' },
    { icon: ScaleIcon, label: 'Total Discount', value: fullCurrency(totals.totalDiscount), color: 'blue' },
    { icon: BanknotesIcon, label: 'Total Fine', value: fullCurrency(totals.totalFine), color: 'orange' },
    { icon: ReceiptPercentIcon, label: 'Total Fees', value: fullCurrency(totals.totalFees), color: 'blue' },
  ];

  const rows = report?.rows || [];
  const pagination = report?.pagination || null;

  const renderHeaderRow = () => {
    if (reportType === 'monthly') {
      return (
        <tr className="bg-gray-50 dark:bg-gray-800/50">
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Month</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Total Collected</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Students</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Total Remaining</th>
        </tr>
      );
    }
    if (reportType === 'classWise') {
      return (
        <tr className="bg-gray-50 dark:bg-gray-800/50">
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Collected</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Pending</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Partial</th>
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Students</th>
        </tr>
      );
    }
    return (
      <tr className="bg-gray-50 dark:bg-gray-800/50">
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt No</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student ID</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Year</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Remaining</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Method</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
        {reportType === 'outstanding' && (
          <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Due</th>
        )}
        <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Collected By</th>
      </tr>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={12} className="px-2 py-10 text-center">
            <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </td>
        </tr>
      );
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={12} className="px-2 py-8 text-center text-gray-400 dark:text-gray-500">No records match the selected filters</td>
        </tr>
      );
    }
    if (reportType === 'monthly') {
      return rows.map((row) => (
        <tr key={row.month} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <td className="px-1.5 py-2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.monthLabel}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{fullCurrency(row.totalCollected)}</td>
          <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.studentCount}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">{fullCurrency(row.totalRemaining)}</td>
        </tr>
      ));
    }
    if (reportType === 'classWise') {
      return rows.map((row) => (
        <tr key={row.class} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <td className="px-1.5 py-2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.class}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{fullCurrency(row.collected)}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-orange-600 dark:text-orange-400 whitespace-nowrap">{fullCurrency(row.pending)}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">{fullCurrency(row.partial)}</td>
          <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.studentCount}</td>
        </tr>
      ));
    }
    return rows.map((row) => (
      <tr key={row._id || row.receiptNumber} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <td className="px-1.5 py-2 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.receiptNumber}</td>
          <td className="px-1.5 py-2">
            <div className="flex items-center gap-2">
              {row.studentImage ? (
                <img src={row.studentImage} alt={row.studentName} className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" />
              ) : (
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(row.studentName)} flex items-center justify-center text-white font-bold text-[8px] flex-shrink-0`}>
                  {getInitials(row.studentName)}
                </div>
              )}
              <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[110px]">{row.studentName || '-'}</span>
            </div>
          </td>
          <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{row.studentId || '-'}</td>
          <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.class}</td>
          <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{row.academicYear}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{row.paidAmount > 0 ? fullCurrency(row.paidAmount) : '-'}</td>
          <td className="px-1.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">{row.remainingAmount > 0 ? fullCurrency(row.remainingAmount) : '-'}</td>
          <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.paymentMethod || '-'}</td>
          <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(row.paymentDate)}</td>
          <td className="px-1.5 py-2 whitespace-nowrap">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyles[row.status] || statusStyles.Due}`}>{row.status}</span>
          </td>
          {reportType === 'outstanding' && (
            <td className="px-1.5 py-2 whitespace-nowrap">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusStyles[row.dueStatus] || statusStyles.Due}`}>{row.dueStatus}</span>
            </td>
          )}
          <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{row.collectedBy?.fullName || '-'}</td>
        </tr>
    ));
  };

  const renderPrintPreview = () => {
    if (!printPreview || !report) return null;
    const isList = LIST_REPORT_TYPES.includes(report.reportType);
    return (
      <Modal isOpen title="Print Preview" onClose={() => setPrintPreview(false)} maxWidth="max-w-5xl">
        <div className="max-h-[75vh] overflow-y-auto">
          <div id="report-print-content" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-gray-300 dark:border-gray-600 pb-4">
              <div className="flex items-center gap-3">
                {report.school?.schoolLogo && (
                  <img src={report.school.schoolLogo} alt="School" className="w-11 h-11 rounded-full object-cover" />
                )}
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{report.school?.schoolName}</h2>
                  {report.school?.address && <p className="text-[10px] text-gray-500 dark:text-gray-400">{report.school.address}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{report.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Generated: {formatDate(report.meta?.generatedAt)}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Filters: {report.filtersApplied}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/30">
                    {isList ? (
                      <>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Receipt No</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Student</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">ID</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Class</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Paid</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Remaining</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Method</th>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Status</th>
                      </>
                    ) : report.reportType === 'monthly' ? (
                      <>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Month</th>
                        <th className="px-2 py-1.5 text-right text-[9px] uppercase font-semibold">Collected</th>
                        <th className="px-2 py-1.5 text-center text-[9px] uppercase font-semibold">Students</th>
                        <th className="px-2 py-1.5 text-right text-[9px] uppercase font-semibold">Remaining</th>
                      </>
                    ) : (
                      <>
                        <th className="px-2 py-1.5 text-left text-[9px] uppercase font-semibold">Class</th>
                        <th className="px-2 py-1.5 text-right text-[9px] uppercase font-semibold">Collected</th>
                        <th className="px-2 py-1.5 text-right text-[9px] uppercase font-semibold">Pending</th>
                        <th className="px-2 py-1.5 text-right text-[9px] uppercase font-semibold">Partial</th>
                        <th className="px-2 py-1.5 text-center text-[9px] uppercase font-semibold">Students</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.length === 0 ? (
                    <tr><td colSpan={8} className="px-2 py-6 text-center text-gray-400 dark:text-gray-500">No records match the selected filters</td></tr>
                  ) : report.reportType === 'monthly' ? (
                    report.rows.map((row) => (
                      <tr key={row.month} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-2 py-1.5">{row.monthLabel}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.totalCollected)}</td>
                        <td className="px-2 py-1.5 text-center">{row.studentCount}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.totalRemaining)}</td>
                      </tr>
                    ))
                  ) : report.reportType === 'classWise' ? (
                    report.rows.map((row) => (
                      <tr key={row.class} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-2 py-1.5">{row.class}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.collected)}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.pending)}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.partial)}</td>
                        <td className="px-2 py-1.5 text-center">{row.studentCount}</td>
                      </tr>
                    ))
                  ) : (
                    report.rows.map((row) => (
                      <tr key={row._id || row.receiptNumber} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-2 py-1.5 font-mono text-[10px]">{row.receiptNumber}</td>
                        <td className="px-2 py-1.5">{row.studentName}</td>
                        <td className="px-2 py-1.5 text-[10px]">{row.studentId}</td>
                        <td className="px-2 py-1.5">{row.class}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.paidAmount)}</td>
                        <td className="px-2 py-1.5 text-right font-medium">{fullCurrency(row.remainingAmount)}</td>
                        <td className="px-2 py-1.5">{row.paymentMethod}</td>
                        <td className="px-2 py-1.5">{row.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">Grand Totals</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Total Students', report.totals.totalStudents],
                  ['Total Collected', fullCurrency(report.totals.totalCollected)],
                  ['Total Remaining', fullCurrency(report.totals.totalRemaining)],
                  ['Total Discount', fullCurrency(report.totals.totalDiscount)],
                  ['Total Fine', fullCurrency(report.totals.totalFine)],
                  ['Total Fees', fullCurrency(report.totals.totalFees)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-700/30 rounded p-2">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">{label}</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">Generated on {formatDate(report.meta?.generatedAt)} by {report.meta?.generatedBy}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <div className="flex-1">
              <Button variant="secondary" onClick={() => setPrintPreview(false)}>Close</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={printWindow}>
                <PrinterIcon className="h-3.5 w-3.5 mr-1 inline" /> Print Report
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <style>{`@media print { body * { visibility: hidden; } #report-print-content, #report-print-content * { visibility: visible; } #report-print-content { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Fee Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate, export and print fee reports from live collection data</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-1 flex flex-wrap gap-1">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => { setReportType(type.value); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              reportType === type.value
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <FilterDropdown label="Academic Year" options={['All', ...SESSIONS]} value={filters.year} onChange={handleFilterChange('year')} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Month" options={['All', ...MONTHS]} value={filters.month} onChange={handleFilterChange('month')} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={filters.class} onChange={handleFilterChange('class')} />
          </div>
          <div className="w-32">
            <FilterDropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={STATUS_LOCKED_TYPES.includes(reportType) ? 'All' : filters.status}
              onChange={handleFilterChange('status')}
            />
          </div>
          <div className="w-36">
            <FilterDropdown label="Payment Method" options={PAYMENT_METHODS} value={filters.paymentMethod} onChange={handleFilterChange('paymentMethod')} />
          </div>
          <div className="w-44">
            <DateInput label="Start Date" name="startDate" value={filters.startDate} onChange={(e) => handleFilterChange('startDate')(e.target.value)} />
          </div>
          <div className="w-44">
            <DateInput label="End Date" name="endDate" value={filters.endDate} onChange={(e) => handleFilterChange('endDate')(e.target.value)} />
          </div>
          <div className="w-56">
            <SearchInput placeholder="Search student or receipt no..." value={filters.search} onChange={handleFilterChange('search')} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleGenerate} disabled={generating}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {generating && <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <DocumentChartBarIcon className="h-3.5 w-3.5" /> Generate
            </button>
            <button onClick={handleExportPdf} disabled={exportingPdf || loading}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {exportingPdf && <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <DocumentArrowDownIcon className="h-3.5 w-3.5" /> PDF
            </button>
            <button onClick={handleExportExcel} disabled={exportingExcel || loading}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {exportingExcel && <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <DocumentArrowDownIcon className="h-3.5 w-3.5" /> Excel
            </button>
            <button onClick={handlePrint} disabled={printLoading || loading}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {printLoading && <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <PrinterIcon className="h-3.5 w-3.5" /> Print
            </button>
            <button onClick={handleReset}
              className="px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer">
              <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
        {report && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
            Filters: {report.filtersApplied} · Generated {formatDate(report.meta?.generatedAt)} by {report.meta?.generatedBy}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} />
        ))}
      </div>

      <CardSection title={`${REPORT_TYPES.find((t) => t.value === reportType)?.label || 'Report'} (${pagination ? pagination.totalItems : rows.length})`}>
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm">
            <thead>{renderHeaderRow()}</thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{renderBody()}</tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); loadReport(Math.max(1, currentPage - 1)); }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300">{pagination.currentPage} / {pagination.totalPages}</span>
              <button
                onClick={() => { const next = Math.min(pagination.totalPages, currentPage + 1); setCurrentPage(next); loadReport(next); }}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardSection>

      {renderPrintPreview()}
    </div>
  );
};

export default FeeReports;
