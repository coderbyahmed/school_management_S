import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon,
  UserGroupIcon, ArrowPathIcon, DocumentArrowDownIcon,
  PrinterIcon, EyeIcon, MagnifyingGlassIcon, ChevronDownIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import { ACADEMIC_YEARS } from '../../../utils/classNames';
import attendanceReportsService from '../../../services/attendanceReports.service';

const TYPE_OPTIONS = ['All', 'Students', 'Teachers'];

function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const DonutChart = ({ present, absent, leave, late, total }) => {
  if (!total) return null;
  const segments = [
    { label: 'Present', value: present, color: '#22c55e' },
    { label: 'Absent', value: absent, color: '#ef4444' },
    { label: 'Leave', value: leave, color: '#eab308' },
    { label: 'Late', value: late, color: '#f97316' },
  ];
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let pathData = '';
  segments.forEach((seg) => {
    if (seg.value === 0) return;
    const ratio = seg.value / total;
    const length = ratio * circumference;
    pathData += `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="18" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)" />`;
    offset += length;
  });
  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160" dangerouslySetInnerHTML={{ __html: pathData }} />
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label} ({s.value})
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthlyBarChart = ({ data }) => {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => {
        const height = (d.total / maxVal) * 100;
        const presentH = (d.present / maxVal) * 100;
        const absentH = (d.absent / maxVal) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: '100px' }}>
              <div className="w-full relative" style={{ height: '100px' }}>
                <div className="absolute bottom-0 w-full bg-red-400 dark:bg-red-500 rounded-t transition-all" style={{ height: `${absentH}%`, minHeight: d.absent > 0 ? '2px' : '0' }} title={`${d.month}: ${d.absent} absent`} />
                <div className="absolute bottom-0 w-full bg-green-500 dark:bg-green-400 rounded-t transition-all" style={{ height: `${presentH}%`, minHeight: d.present > 0 ? '2px' : '0' }} title={`${d.month}: ${d.present} present`} />
              </div>
            </div>
            <span className="text-[8px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{d.month.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
};

const ClassBarChart = ({ data }) => {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((d) => {
        const pct = d.percentage;
        return (
          <div key={d.name} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 truncate text-right" title={d.name}>{d.name}</span>
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-8 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

const AttendanceReports = () => {
  const [allRecords, setAllRecords] = useState([]);
  const [type, setType] = useState('All');
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personSummary, setPersonSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    const records = attendanceReportsService.getRecords();
    setAllRecords(records);
  }, []);

  const filteredRecords = useMemo(() => {
    let list = allRecords;
    const typeFilter = type === 'All' ? null : type === 'Students' ? 'Student' : 'Teacher';
    if (typeFilter) list = list.filter((r) => r.type === typeFilter);
    if (academicYear) list = list.filter((r) => r.academicYear === academicYear);
    if (className) list = list.filter((r) => r.classOrDept === className);
    if (fromDate) list = list.filter((r) => r.date >= fromDate);
    if (toDate) list = list.filter((r) => r.date <= toDate);
    return list;
  }, [allRecords, type, academicYear, className, fromDate, toDate]);

  const isTeacherView = type === 'Teachers';

  const personSummaries = useMemo(() => {
    return attendanceReportsService.getPersonSummaries(filteredRecords);
  }, [filteredRecords]);

  const stats = useMemo(() => attendanceReportsService.getStats(filteredRecords), [filteredRecords]);
  const monthlyTrend = useMemo(() => attendanceReportsService.getMonthlyTrend(filteredRecords), [filteredRecords]);
  const classWiseStats = useMemo(() => attendanceReportsService.getClassWiseStats(filteredRecords), [filteredRecords]);
  const teacherOverview = useMemo(() => attendanceReportsService.getTeacherOverview(filteredRecords), [filteredRecords]);

  const deptOptions = useMemo(() => {
    if (type === 'All') return [...attendanceReportsService.CLASSES, ...attendanceReportsService.DEPARTMENTS];
    return attendanceReportsService.CLASSES;
  }, [type]);

  const handleGenerateReport = () => {
    const records = attendanceReportsService.getRecords({
      type: type === 'All' ? undefined : type === 'Students' ? 'Student' : 'Teacher',
      academicYear: academicYear || undefined,
      className: className || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
    setAllRecords(records);
  };

  const handleReset = () => {
    setType('All');
    setAcademicYear('');
    setClassName('');
    setFromDate('');
    setToDate('');
    const records = attendanceReportsService.getRecords();
    setAllRecords(records);
  };

  const handleExportPdf = async () => {
    if (!filteredRecords.length) { toast.error('No records to export'); return; }
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const tableEl = tableRef.current;
      if (!tableEl) return;
      const clone = tableEl.cloneNode(true);
      clone.querySelectorAll('.no-print').forEach((el) => el.remove());
      const printStyles = `
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { width: 100%; border-collapse: collapse; font-size: 8px; }
          th { background: #2563eb; color: white; padding: 5px 6px; text-align: left; }
          td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
          h2 { text-align: center; margin-bottom: 12px; color: #1f2937; }
        </style>`;
      const html = `<!DOCTYPE html><html><head><title>Attendance Report</title>${printStyles}</head><body><h2>Attendance Report</h2>${clone.outerHTML}<p style="text-align:right;font-size:8px;color:#9ca3af;margin-top:8px;">Generated on ${new Date().toLocaleDateString()}</p></body></html>`;
      const el = document.createElement('div');
      el.innerHTML = html;
      document.body.appendChild(el);
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `Attendance-Report-${academicYear || 'all'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(el).save();
      document.body.removeChild(el);
      toast.success('PDF exported successfully');
    } catch { toast.error('Failed to export PDF'); }
  };

  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { window.print(); return; }
    const printStyles = `
      @page { size: A4 landscape; margin: 8mm; }
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table { width: 100%; border-collapse: collapse; font-size: 8px; }
      th { background: #2563eb; color: white; padding: 5px 6px; text-align: left; }
      td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
      h2 { text-align: center; margin-bottom: 12px; color: #1f2937; }`;
    const clone = tableRef.current.cloneNode(true);
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());
    const html = `<!DOCTYPE html><html><head><title>Attendance Report</title><style>${printStyles}</style></head><body><h2>Attendance Report</h2>${clone.outerHTML}<p style="text-align:right;font-size:8px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p></body></html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, []);

  const handleViewReport = async (person) => {
    setLoadingSummary(true);
    setSelectedPerson(person);
    await new Promise((r) => setTimeout(r, 200));
    const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
    setPersonSummary(summary);
    setLoadingSummary(false);
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

  const renderPercentageBadge = (pct) => {
    const color = pct >= 80 ? 'text-green-600 dark:text-green-400' : pct >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
    return <span className={`text-xs font-mono font-semibold ${color}`}>{pct}%</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive attendance analytics and reporting dashboard</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={UserGroupIcon} label="Total Attendance" value={stats.total} color="blue" />
        <StatCard icon={CheckCircleIcon} label="Present" value={stats.present} color="green" />
        <StatCard icon={XCircleIcon} label="Absent" value={stats.absent} color="red" />
        <StatCard icon={ClockIcon} label="Leave" value={stats.leave} color="yellow" />
        <StatCard icon={CalendarDaysIcon} label="Late" value={stats.late} color="orange" />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance %</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.percentage}%</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <ChartBarSquareIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all" style={{ width: `${stats.percentage}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isTeacherView ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
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
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {!isTeacherView && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Class</label>
            <div className="relative">
              <select value={className} onChange={(e) => setClassName(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Classes</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          )}
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
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleGenerateReport}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Generate Report
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" />
            Reset
          </button>
          <button onClick={handlePrint}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <PrinterIcon className="h-4 w-4" />
            Print Report
          </button>
          <button onClick={handleExportPdf}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Charts */}
      {filteredRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Monthly Attendance Trend</h3>
            <MonthlyBarChart data={monthlyTrend} />
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Absent</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Present vs Absent</h3>
            <DonutChart present={stats.present} absent={stats.absent} leave={stats.leave} late={stats.late} total={stats.total} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Class-wise Attendance</h3>
            <ClassBarChart data={classWiseStats} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Teacher Attendance Overview</h3>
            {teacherOverview.length > 0 ? <ClassBarChart data={teacherOverview} /> : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                <UserGroupIcon className="h-8 w-8 mb-2" />
                <p className="text-xs">No teacher data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" ref={tableRef}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Photo</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Name</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">ID</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Type</th>
              {!isTeacherView && <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class</th>}
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Present Days</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Absent Days</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Leave Days</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Late Days</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Attendance %</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider no-print">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {personSummaries.length === 0 ? (
              <tr>
                <td colSpan={isTeacherView ? 10 : 11} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No attendance records found</p>
                    <p className="text-xs">Use filters and click Generate Report</p>
                  </div>
                </td>
              </tr>
            ) : (
              personSummaries.map((person) => (
                <tr key={person.personId} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">{renderPhoto(person)}</td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{person.name}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{person.personId}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      person.type === 'Teacher'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    }`}>
                      {person.type}
                    </span>
                  </td>
                  {!isTeacherView && <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{person.classOrDept}</td>}
                  <td className="px-3 py-3 text-xs font-mono text-green-600 dark:text-green-400 font-medium">{person.present}</td>
                  <td className="px-3 py-3 text-xs font-mono text-red-600 dark:text-red-400 font-medium">{person.absent}</td>
                  <td className="px-3 py-3 text-xs font-mono text-yellow-600 dark:text-yellow-400 font-medium">{person.leave}</td>
                  <td className="px-3 py-3 text-xs font-mono text-orange-600 dark:text-orange-400 font-medium">{person.late}</td>
                  <td className="px-3 py-3">{renderPercentageBadge(person.percentage)}</td>
                  <td className="px-3 py-3 no-print">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewReport(person)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View Report">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={async () => {
                        const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
                        if (!summary) return;
                        const pw = window.open('', '_blank');
                        if (!pw) return;
                        const modeRows = Object.entries(summary.modeStats || {}).map(([m, c]) =>
                          `<div class="row"><span class="label">${m}</span><span class="value">${c}</span></div>`
                        ).join('');
                        const monthlyRows = (summary.monthly || []).map((m) =>
                          `<div class="row"><span class="label">${m.month}</span><span class="value">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                        ).join('');
                        const html = `
                          <html><head><title>Full Report - ${summary.name}</title>
                          <style>
                            @page { margin: 12mm; }
                            body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                            .card { max-width: 600px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                            h2 { text-align: center; color: #1f2937; margin-bottom: 8px; font-size: 16px; }
                            .subtitle { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 20px; }
                            .section-title { font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
                            .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
                            .label { color: #6b7280; }
                            .value { font-weight: 600; color: #1f2937; }
                            .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
                            .stat-box { text-align: center; padding: 8px; background: #f9fafb; border-radius: 8px; }
                            .stat-value { font-size: 18px; font-weight: 700; color: #1f2937; }
                            .stat-label { font-size: 9px; color: #9ca3af; }
                            .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; }
                          </style></head>
                          <body>
                            <div class="card">
                              <h2>Attendance Report</h2>
                              <p class="subtitle">${summary.personId} &bull; ${summary.type} &bull; ${summary.classOrDept}</p>
                              <div class="stats-grid">
                                <div class="stat-box"><div class="stat-value">${summary.total}</div><div class="stat-label">Total</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#16a34a;">${summary.present}</div><div class="stat-label">Present</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#dc2626;">${summary.absent}</div><div class="stat-label">Absent</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#ca8a04;">${summary.leave}</div><div class="stat-label">Leave</div></div>
                                <div class="stat-box"><div class="stat-value" style="color:#ea580c;">${summary.late}</div><div class="stat-label">Late</div></div>
                              </div>
                              <div style="text-align:center;margin:12px 0;"><span style="font-size:24px;font-weight:700;color:#4f46e5;">${summary.percentage}%</span><span style="font-size:12px;color:#6b7280;margin-left:4px;">Attendance</span></div>
                              <div class="section-title">Details</div>
                              <div class="row"><span class="label">Academic Year</span><span class="value">${summary.academicYear}</span></div>
                              <div class="section-title">Monthly Summary</div>
                              ${monthlyRows}
                              <div class="section-title">Attendance Mode</div>
                              ${modeRows}
                            </div>
                            <p class="footer">Generated on ${new Date().toLocaleDateString()}</p>
                          </body></html>`;
                        pw.document.write(html);
                        pw.document.close();
                        pw.focus();
                        setTimeout(() => pw.print(), 300);
                      }} className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer" title="Print Report">
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button onClick={async () => {
                        try {
                          const summary = attendanceReportsService.getPersonSummary(allRecords, person.personId);
                          if (!summary) return;
                          const { default: html2pdf } = await import('html2pdf.js');
                          const modeRows = Object.entries(summary.modeStats || {}).map(([m, c]) =>
                            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m}</span><span style="font-weight:600;color:#1f2937;">${c}</span></div>`
                          ).join('');
                          const monthlyRows = (summary.monthly || []).map((m) =>
                            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m.month}</span><span style="font-weight:600;color:#1f2937;">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                          ).join('');
                          const qrHtml = `
                            <div style="max-width:600px;margin:12mm auto;font-family:'Segoe UI',Arial,sans-serif;">
                              <h2 style="text-align:center;color:#1f2937;font-size:16px;">Attendance Report</h2>
                              <p style="text-align:center;color:#6b7280;font-size:11px;margin-bottom:16px;">${summary.personId} &bull; ${summary.type} &bull; ${summary.classOrDept}</p>
                              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0;">
                                ${[['Total', summary.total], ['Present', summary.present], ['Absent', summary.absent], ['Leave', summary.leave], ['Late', summary.late]].map(([l, v]) =>
                                  `<div style="text-align:center;padding:6px;background:#f9fafb;border-radius:6px;"><div style="font-size:16px;font-weight:700;color:#1f2937;">${v}</div><div style="font-size:9px;color:#9ca3af;">${l}</div></div>`
                                ).join('')}
                              </div>
                              <p style="text-align:center;font-size:20px;font-weight:700;color:#4f46e5;margin:8px 0;">${summary.percentage}% Attendance</p>
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Details</h3>
                              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">Academic Year</span><span style="font-weight:600;color:#1f2937;">${summary.academicYear}</span></div>
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Monthly Summary</h3>
                              ${monthlyRows}
                              <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Attendance Mode</h3>
                              ${modeRows}
                              <p style="text-align:center;font-size:9px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p>
                            </div>`;
                          const el = document.createElement('div');
                          el.innerHTML = qrHtml;
                          document.body.appendChild(el);
                          await html2pdf().set({
                            margin: [8, 8, 8, 8],
                            filename: `Attendance-Report-${summary.personId}.pdf`,
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true, logging: false },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                          }).from(el).save();
                          document.body.removeChild(el);
                          toast.success('PDF downloaded');
                        } catch { toast.error('Failed to download PDF'); }
                      }} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Download PDF">
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {personSummaries.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
            <span>{personSummaries.length} person{personSummaries.length !== 1 ? 's' : ''}</span>
            <span className="hidden sm:block">{stats.present} Present | {stats.absent} Absent | {stats.leave} Leave | {stats.late} Late | {stats.percentage}% Attendance</span>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Report Details</h2>
              <button onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              {loadingSummary || !personSummary ? (
                <div className="flex items-center justify-center py-10">
                  <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ${
                      personSummary.type === 'Teacher'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-400/50'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700 ring-yellow-400/50'
                    }`}>
                      {getInitials(personSummary.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{personSummary.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{personSummary.personId}</p>
                    </div>
                    <div className="ml-auto text-center">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{personSummary.percentage}%</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Attendance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {[
                      ['Total', personSummary.total, 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'],
                      ['Present', personSummary.present, 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'],
                      ['Absent', personSummary.absent, 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'],
                      ['Leave', personSummary.leave, 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'],
                      ['Late', personSummary.late, 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'],
                    ].map(([label, value, color]) => (
                      <div key={label} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <p className={`text-lg font-bold ${color.split(' ')[2]}`}>{value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-5">
                    {[
                      ['Type', personSummary.type],
                      ['Class / Department', personSummary.classOrDept],
                      ['Academic Year', personSummary.academicYear],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                      </div>
                    ))}
                  </div>

                  {personSummary.monthly.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Monthly Summary</h4>
                      <div className="space-y-1.5">
                        {personSummary.monthly.map((m) => (
                          <div key={m.month} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 w-16">{m.month}</span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
                              <div className="h-full bg-green-500" style={{ width: `${(m.present / (m.total || 1)) * 100}%` }} />
                              <div className="h-full bg-red-400" style={{ width: `${(m.absent / (m.total || 1)) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-10 text-right">{m.present}/{m.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(personSummary.modeStats || {}).length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Attendance Mode</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(personSummary.modeStats).map(([mode, count]) => (
                          <div key={mode} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">{mode}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedPerson(null); setPersonSummary(null); }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      Close
                    </button>
                    <button onClick={() => {
                      if (!personSummary) return;
                      const pw = window.open('', '_blank');
                      if (!pw) return;
                      const modeRows = Object.entries(personSummary.modeStats || {}).map(([m, c]) =>
                        `<div class="row"><span class="label">${m}</span><span class="value">${c}</span></div>`
                      ).join('');
                      const monthlyRows = (personSummary.monthly || []).map((m) =>
                        `<div class="row"><span class="label">${m.month}</span><span class="value">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                      ).join('');
                      const html = `
                        <html><head><title>Full Report - ${personSummary.name}</title>
                        <style>
                          @page { margin: 12mm; }
                          body { font-family: 'Segoe UI', Arial, sans-serif; -webkit-print-color-adjust: exact; }
                          .card { max-width: 600px; margin: 0 auto; border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; }
                          h2 { text-align: center; color: #1f2937; margin-bottom: 8px; font-size: 16px; }
                          .subtitle { text-align: center; color: #6b7280; font-size: 12px; margin-bottom: 20px; }
                          .section-title { font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
                          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
                          .label { color: #6b7280; }
                          .value { font-weight: 600; color: #1f2937; }
                          .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
                          .stat-box { text-align: center; padding: 8px; background: #f9fafb; border-radius: 8px; }
                          .stat-value { font-size: 18px; font-weight: 700; color: #1f2937; }
                          .stat-label { font-size: 9px; color: #9ca3af; }
                          .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; }
                        </style></head>
                        <body>
                          <div class="card">
                            <h2>Attendance Report</h2>
                            <p class="subtitle">${personSummary.personId} &bull; ${personSummary.type} &bull; ${personSummary.classOrDept}</p>
                            <div class="stats-grid">
                              <div class="stat-box"><div class="stat-value">${personSummary.total}</div><div class="stat-label">Total</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#16a34a;">${personSummary.present}</div><div class="stat-label">Present</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#dc2626;">${personSummary.absent}</div><div class="stat-label">Absent</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#ca8a04;">${personSummary.leave}</div><div class="stat-label">Leave</div></div>
                              <div class="stat-box"><div class="stat-value" style="color:#ea580c;">${personSummary.late}</div><div class="stat-label">Late</div></div>
                            </div>
                            <div style="text-align:center;margin:12px 0;"><span style="font-size:24px;font-weight:700;color:#4f46e5;">${personSummary.percentage}%</span><span style="font-size:12px;color:#6b7280;margin-left:4px;">Attendance</span></div>
                            <div class="section-title">Details</div>
                            <div class="row"><span class="label">Academic Year</span><span class="value">${personSummary.academicYear}</span></div>
                            <div class="section-title">Monthly Summary</div>
                            ${monthlyRows}
                            <div class="section-title">Attendance Mode</div>
                            ${modeRows}
                          </div>
                          <p class="footer">Generated on ${new Date().toLocaleDateString()}</p>
                        </body></html>`;
                      pw.document.write(html);
                      pw.document.close();
                      pw.focus();
                      setTimeout(() => pw.print(), 300);
                    }} className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <PrinterIcon className="h-3.5 w-3.5" /> Print Report
                    </button>
                    <button onClick={async () => {
                      if (!personSummary) return;
                      try {
                        const { default: html2pdf } = await import('html2pdf.js');
                        const modeRows = Object.entries(personSummary.modeStats || {}).map(([m, c]) =>
                          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m}</span><span style="font-weight:600;color:#1f2937;">${c}</span></div>`
                        ).join('');
                        const monthlyRows = (personSummary.monthly || []).map((m) =>
                          `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">${m.month}</span><span style="font-weight:600;color:#1f2937;">${m.present}/${m.total} (${m.total > 0 ? Math.round((m.present / m.total) * 100) : 0}%)</span></div>`
                        ).join('');
                        const html = `
                          <div style="max-width:600px;margin:12mm auto;font-family:'Segoe UI',Arial,sans-serif;">
                            <h2 style="text-align:center;color:#1f2937;font-size:16px;">Attendance Report</h2>
                            <p style="text-align:center;color:#6b7280;font-size:11px;margin-bottom:16px;">${personSummary.personId} &bull; ${personSummary.type} &bull; ${personSummary.classOrDept}</p>
                            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0;">
                              ${[['Total', personSummary.total], ['Present', personSummary.present], ['Absent', personSummary.absent], ['Leave', personSummary.leave], ['Late', personSummary.late]].map(([l, v]) =>
                                `<div style="text-align:center;padding:6px;background:#f9fafb;border-radius:6px;"><div style="font-size:16px;font-weight:700;color:#1f2937;">${v}</div><div style="font-size:9px;color:#9ca3af;">${l}</div></div>`
                              ).join('')}
                            </div>
                            <p style="text-align:center;font-size:20px;font-weight:700;color:#4f46e5;margin:8px 0;">${personSummary.percentage}% Attendance</p>
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Details</h3>
                            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:11px;"><span style="color:#6b7280;">Academic Year</span><span style="font-weight:600;color:#1f2937;">${personSummary.academicYear}</span></div>
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Monthly Summary</h3>
                            ${monthlyRows}
                            <h3 style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;margin:12px 0 6px;">Attendance Mode</h3>
                            ${modeRows}
                            <p style="text-align:center;font-size:9px;color:#9ca3af;margin-top:16px;">Generated on ${new Date().toLocaleDateString()}</p>
                          </div>`;
                        const el = document.createElement('div');
                        el.innerHTML = html;
                        document.body.appendChild(el);
                        await html2pdf().set({
                          margin: [8, 8, 8, 8],
                          filename: `Attendance-Report-${personSummary.personId}.pdf`,
                          image: { type: 'jpeg', quality: 0.98 },
                          html2canvas: { scale: 2, useCORS: true, logging: false },
                          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        }).from(el).save();
                        document.body.removeChild(el);
                        toast.success('PDF downloaded');
                      } catch { toast.error('Failed to download PDF'); }
                    }} className="flex-1 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5">
                      <DocumentArrowDownIcon className="h-3.5 w-3.5" /> Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
