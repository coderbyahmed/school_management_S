import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon,
  UserGroupIcon, ArrowPathIcon, DocumentArrowDownIcon,
  PrinterIcon, EyeIcon, MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SearchInput from '../../common/SearchInput';
import attendanceHistoryService from '../../../services/attendanceHistory.service';

const STATUS_OPTIONS = ['All', 'Present', 'Absent', 'Leave', 'Late'];
const TYPE_OPTIONS = ['All', 'Students', 'Teachers'];

const STATUS_STYLES = {
  Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Leave: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Late: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTimeDisplay(timeStr) {
  if (!timeStr) return '—';
  return timeStr;
}

const AttendanceHistory = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [type, setType] = useState('All');
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const records = attendanceHistoryService.getRecords();
    setAllRecords(records);
  }, []);

  const filteredRecords = useMemo(() => {
    let list = allRecords;
    const typeFilter = type === 'All' ? null : type === 'Students' ? 'Student' : 'Teacher';
    if (typeFilter) list = list.filter((r) => r.type === typeFilter);
    if (academicYear) list = list.filter((r) => r.academicYear === academicYear);
    if (className) list = list.filter((r) => r.classOrDept === className);
    if (status !== 'All') list = list.filter((r) => r.status === status);
    if (fromDate) list = list.filter((r) => r.date >= fromDate);
    if (toDate) list = list.filter((r) => r.date <= toDate);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.personId.toLowerCase().includes(q));
    }
    return list;
  }, [allRecords, type, academicYear, className, fromDate, toDate, status, search]);

  const stats = useMemo(() => attendanceHistoryService.getStats(filteredRecords), [filteredRecords]);

  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalRecords: filteredRecords.length,
      todayRecords: filteredRecords.filter((r) => r.date === today).length,
      studentRecords: filteredRecords.filter((r) => r.type === 'Student').length,
      teacherRecords: filteredRecords.filter((r) => r.type === 'Teacher').length,
    };
  }, [filteredRecords]);

  const deptOptions = useMemo(() => {
    if (type === 'Teachers') return attendanceHistoryService.DEPARTMENTS;
    if (type === 'All') return [...attendanceHistoryService.CLASSES, ...attendanceHistoryService.DEPARTMENTS];
    return attendanceHistoryService.CLASSES;
  }, [type]);

  const handleSearch = () => {
    const records = attendanceHistoryService.getRecords({
      type: type === 'All' ? undefined : type === 'Students' ? 'Student' : 'Teacher',
      academicYear: academicYear || undefined,
      className: className || undefined,
      status: status !== 'All' ? status : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      search: search || undefined,
    });
    setAllRecords(records);
  };

  const handleReset = () => {
    setType('All');
    setAcademicYear('');
    setClassName('');
    setFromDate('');
    setToDate('');
    setStatus('All');
    setSearch('');
    const records = attendanceHistoryService.getRecords();
    setAllRecords(records);
  };

  const handleExportPdf = async () => {
    if (!filteredRecords.length) { toast.error('No records to export'); return; }
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const tableEl = tableRef.current;
      if (!tableEl) return;

      const printStyles = `
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; }
          th { background: #2563eb; color: white; padding: 6px 8px; text-align: left; }
          td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
          .badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 8px; font-weight: 600; }
          h2 { text-align: center; margin-bottom: 12px; color: #1f2937; }
        </style>
      `;

      const clone = tableEl.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());

      const html = `
        <!DOCTYPE html>
        <html><head><title>Attendance History</title>${printStyles}</head>
        <body>
          <h2>Attendance History Report</h2>
          ${clone.outerHTML}
          <p style="text-align:right;font-size:8px;color:#9ca3af;margin-top:8px;">Generated on ${new Date().toLocaleDateString()}</p>
        </body></html>
      `;

      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.appendChild(el);

      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `Attendance-History-${academicYear || 'all'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(el).save();

      document.body.removeChild(el);
      toast.success('PDF exported successfully');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { window.print(); return; }

    const printStyles = `
      @page { size: A4 landscape; margin: 8mm; }
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table { width: 100%; border-collapse: collapse; font-size: 9px; }
      th { background: #2563eb; color: white; padding: 6px 8px; text-align: left; }
      td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
      .badge { display: inline-block; padding: 1px 6px; border-radius: 9999px; font-size: 8px; font-weight: 600; }
      h2 { text-align: center; margin-bottom: 12px; color: #1f2937; }
      .print-footer { text-align: right; font-size: 8px; color: #9ca3af; margin-top: 8px; }
    `;

    const clone = tableRef.current.cloneNode(true);
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());

    const html = `
      <!DOCTYPE html>
      <html><head><title>Attendance History</title><style>${printStyles}</style></head>
      <body>
        <h2>Attendance History Report</h2>
        ${clone.outerHTML}
        <p class="print-footer">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const renderPhoto = (record) => (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ring-1 flex-shrink-0 ${
      record.type === 'Teacher'
        ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
        : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
    }`}>
      {getInitials(record.name)}
    </div>
  );

  const renderStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Present;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
        {status === 'Present' && <CheckCircleIcon className="h-3 w-3" />}
        {status === 'Absent' && <XCircleIcon className="h-3 w-3" />}
        {status === 'Leave' && <ClockIcon className="h-3 w-3" />}
        {status === 'Late' && <CalendarDaysIcon className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  const renderModeBadge = (mode) => {
    const colors = {
      Manual: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      'QR Code': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      'Hardware (Coming Soon)': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${colors[mode] || colors.Manual}`}>
        {mode}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage complete attendance records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label="Total Records" value={dashboardStats.totalRecords} color="blue" />
        <StatCard icon={CalendarDaysIcon} label="Today's Records" value={dashboardStats.todayRecords} color="green" />
        <StatCard icon={UserGroupIcon} label="Student Records" value={dashboardStats.studentRecords} color="yellow" />
        <StatCard icon={UserGroupIcon} label="Teacher Records" value={dashboardStats.teacherRecords} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Attendance Type</label>
            <div className="relative">
              <select value={type} onChange={(e) => { setType(e.target.value); setClassName(''); }}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                {TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Academic Year</label>
            <div className="relative">
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Years</option>
                {attendanceHistoryService.ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {type === 'Teachers' ? 'Department' : 'Class'}
            </label>
            <div className="relative">
              <select value={className} onChange={(e) => setClassName(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">{type === 'Teachers' ? 'All Departments' : 'All Classes'}</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
            <div className="relative">
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleSearch}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Search
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" />
            Reset
          </button>
          <button onClick={handleExportPdf}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export PDF
          </button>
          <button onClick={handlePrint}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
          <div className="ml-auto">
            <SearchInput placeholder="Search by name or ID..." value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto" ref={tableRef}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Photo</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">ID</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Type</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class / Dept</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Check In</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Mode</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No attendance records found</p>
                    <p className="text-xs">Try adjusting filters or date range</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">{renderPhoto(record)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{record.name}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{record.personId}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      record.type === 'Teacher'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{record.classOrDept}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDateDisplay(record.date)}</td>
                  <td className="px-3 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">{formatTimeDisplay(record.checkIn)}</td>
                  <td className="px-3 py-3">{renderStatusBadge(record.status)}</td>
                  <td className="px-3 py-3">{renderModeBadge(record.mode)}</td>
                  <td className="px-3 py-3 no-print">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedRecord(record)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View Details">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => {
                        const pw = window.open('', '_blank');
                        if (!pw) return;
                        const html = `
                          <html><head><title>Attendance Record</title>
                          <style>
                            @page { margin: 15mm; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            .card { max-width: 500px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                            h2 { text-align: center; color: #1f2937; margin-bottom: 16px; }
                            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                            .label { color: #6b7280; }
                            .value { font-weight: 600; color: #1f2937; }
                            .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
                          </style></head>
                          <body>
                            <div class="card">
                              <h2>Attendance Record</h2>
                              <div class="row"><span class="label">Name</span><span class="value">${record.name}</span></div>
                              <div class="row"><span class="label">ID</span><span class="value">${record.personId}</span></div>
                              <div class="row"><span class="label">Type</span><span class="value">${record.type}</span></div>
                              <div class="row"><span class="label">Class/Department</span><span class="value">${record.classOrDept}</span></div>
                              <div class="row"><span class="label">Date</span><span class="value">${formatDateDisplay(record.date)}</span></div>
                              <div class="row"><span class="label">Check In</span><span class="value">${formatTimeDisplay(record.checkIn)}</span></div>
                              <div class="row"><span class="label">Status</span><span class="value">${record.status}</span></div>
                              <div class="row"><span class="label">Mode</span><span class="value">${record.mode}</span></div>
                            </div>
                            <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p>
                          </body></html>
                        `;
                        pw.document.write(html);
                        pw.document.close();
                        pw.focus();
                        setTimeout(() => pw.print(), 300);
                      }} className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer" title="Print Record">
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredRecords.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
            <span>{stats.present} Present | {stats.absent} Absent | {stats.leave} Leave | {stats.late} Late</span>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Attendance Record Details</h2>
              <button onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ${
                  selectedRecord.type === 'Teacher'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
                }`}>
                  {getInitials(selectedRecord.name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedRecord.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecord.personId}</p>
                </div>
                <div className="ml-auto">
                  {renderStatusBadge(selectedRecord.status)}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ['Type', selectedRecord.type],
                  ['Class / Department', selectedRecord.classOrDept],
                  ['Academic Year', selectedRecord.academicYear],
                  ['Date', formatDateDisplay(selectedRecord.date)],
                  ['Check In Time', formatTimeDisplay(selectedRecord.checkIn)],
                  ['Attendance Mode', selectedRecord.mode],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                  Close
                </button>
                <button
                  onClick={() => {
                    const pw = window.open('', '_blank');
                    if (!pw) return;
                    const html = `
                      <html><head><title>Attendance Record</title>
                      <style>
                        @page { margin: 15mm; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                        .card { max-width: 500px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                        h2 { text-align: center; color: #1f2937; margin-bottom: 16px; }
                        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                        .label { color: #6b7280; }
                        .value { font-weight: 600; color: #1f2937; }
                      </style></head>
                      <body>
                        <div class="card">
                          <h2>Attendance Record</h2>
                          <div class="row"><span class="label">Name</span><span class="value">${selectedRecord.name}</span></div>
                          <div class="row"><span class="label">ID</span><span class="value">${selectedRecord.personId}</span></div>
                          <div class="row"><span class="label">Type</span><span class="value">${selectedRecord.type}</span></div>
                          <div class="row"><span class="label">Class/Department</span><span class="value">${selectedRecord.classOrDept}</span></div>
                          <div class="row"><span class="label">Academic Year</span><span class="value">${selectedRecord.academicYear}</span></div>
                          <div class="row"><span class="label">Date</span><span class="value">${formatDateDisplay(selectedRecord.date)}</span></div>
                          <div class="row"><span class="label">Check In</span><span class="value">${formatTimeDisplay(selectedRecord.checkIn)}</span></div>
                          <div class="row"><span class="label">Status</span><span class="value">${selectedRecord.status}</span></div>
                          <div class="row"><span class="label">Mode</span><span class="value">${selectedRecord.mode}</span></div>
                        </div>
                        <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p>
                      </body></html>
                    `;
                    pw.document.write(html);
                    pw.document.close();
                    pw.focus();
                    setTimeout(() => pw.print(), 300);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <PrinterIcon className="h-3.5 w-3.5" /> Print Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;