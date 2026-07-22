import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  DocumentChartBarIcon, CurrencyDollarIcon, ClockIcon, ArrowTrendingUpIcon,
  FunnelIcon, ArrowPathIcon, DocumentArrowDownIcon, PrinterIcon,
  CheckCircleIcon, XCircleIcon, Cog6ToothIcon, DocumentTextIcon,
  BellIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import CardSection from '../../common/CardSection';
import SearchInput from '../../common/SearchInput';
import FilterDropdown from '../../common/FilterDropdown';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import SelectInput from '../../common/SelectInput';
import reportsSettingsService from '../../../services/reportsSettings.service';

const SESSIONS = reportsSettingsService.sessions;
const MONTHS = reportsSettingsService.months;
const CLASSES = reportsSettingsService.classes;
const STATUS_OPTIONS = reportsSettingsService.statusOptions;

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Due: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const formatCurrency = (val) => {
  const n = Number(val);
  if (isNaN(n)) return 'Rs. 0';
  if (n >= 10000000) return 'Rs. ' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return 'Rs. ' + (n / 1000).toFixed(0) + 'K';
  return 'Rs. ' + n.toLocaleString();
};

const getInitials = (name) => {
  if (!name) return 'N/A';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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

const REMINDER_METHODS = ['SMS', 'Email', 'WhatsApp', 'Push Notification'];

const ReportsSettings = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, feeCollected: 0, pendingDues: 0, collectionRate: 0 });
  const [filters, setFilters] = useState({ year: '2025', month: 'All', class: 'All', status: 'All', search: '' });
  const [viewItem, setViewItem] = useState(null);
  const [settings, setSettings] = useState(reportsSettingsService.getSettings());

  const loadData = useCallback(() => {
    const data = reportsSettingsService.getReportData(filters);
    const s = reportsSettingsService.getStats(filters);
    setReportData(data);
    setStats(s);
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFilterChange = (key) => (value) => setFilters((p) => ({ ...p, [key]: value }));
  const handleSearch = (val) => setFilters((p) => ({ ...p, search: val }));

  const handleReset = () => {
    setFilters({ year: '2025', month: 'All', class: 'All', status: 'All', search: '' });
  };

  const handleGenerateReport = () => {
    toast.success('Report generated successfully');
  };

  const handleExportPDF = () => {
    toast.success('PDF export started — download will begin shortly');
  };

  const handleExportExcel = () => {
    toast.success('Excel export started — download will begin shortly');
  };

  const handleSettingChange = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSaveSettings = () => {
    reportsSettingsService.saveSettings(settings);
    toast.success('Settings saved successfully');
  };

  const handleResetSettings = () => {
    const fresh = reportsSettingsService.resetSettings();
    setSettings(fresh);
    toast.success('Settings reset to defaults');
  };

  const statCards = [
    { icon: DocumentChartBarIcon, label: 'Total Reports', value: stats.totalReports, color: 'blue' },
    { icon: CurrencyDollarIcon, label: 'Fee Collected', value: formatCurrency(stats.feeCollected), color: 'green' },
    { icon: ClockIcon, label: 'Pending Dues', value: formatCurrency(stats.pendingDues), color: 'yellow' },
    { icon: ArrowTrendingUpIcon, label: 'Collection Rate', value: `${stats.collectionRate}%`, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">Fee Management</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Reports & Settings</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate reports and configure fee settings</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'reports' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-36">
                <FilterDropdown label="Academic Year" options={['All', ...SESSIONS]} value={filters.year} onChange={handleFilterChange('year')} />
              </div>
              <div className="w-36">
                <FilterDropdown label="Month" options={['All', ...MONTHS]} value={filters.month} onChange={handleFilterChange('month')} />
              </div>
              <div className="w-36">
                <FilterDropdown label="Class" options={CLASSES} value={filters.class} onChange={handleFilterChange('class')} />
              </div>
              <div className="w-36">
                <FilterDropdown label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={handleFilterChange('status')} />
              </div>
              <div className="w-48">
                <SearchInput placeholder="Search student..." value={filters.search} onChange={handleSearch} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleGenerateReport}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1.5 cursor-pointer">
                  <DocumentChartBarIcon className="h-3.5 w-3.5" /> Generate
                </button>
                <button onClick={handleExportPDF}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer">
                  <DocumentArrowDownIcon className="h-3.5 w-3.5" /> PDF
                </button>
                <button onClick={handleExportExcel}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer">
                  <DocumentArrowDownIcon className="h-3.5 w-3.5" /> Excel
                </button>
                <button onClick={handleReset}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 cursor-pointer">
                  <ArrowPathIcon className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} color={card.color} />
            ))}
          </div>

          <CardSection title="Fee Reports">
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Admission No</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Month</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Fee Amount</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Due</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-1.5 py-8 text-center text-gray-400 dark:text-gray-500 text-xs">No report data found</td>
                    </tr>
                  ) : (
                    reportData.slice(0, 50).map((item) => (
                      <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-1.5 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(item.studentName)} flex items-center justify-center text-white font-bold text-[7px] flex-shrink-0`}>
                              {getInitials(item.studentName)}
                            </div>
                            <span className="text-[11px] font-medium text-gray-900 dark:text-white truncate max-w-[90px]">{item.studentName}</span>
                          </div>
                        </td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono">{item.admissionNo}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.class}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.month}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatCurrency(item.feeAmount)}</td>
                        <td className="px-1.5 py-2 text-[10px] font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.paidAmount)}</td>
                        <td className="px-1.5 py-2 text-[10px] whitespace-nowrap">
                          <span className={item.dueAmount > 0 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                            {formatCurrency(item.dueAmount)}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium border ${statusStyles[item.status] || statusStyles.Due}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.date}</td>
                        <td className="px-1.5 py-2 whitespace-nowrap">
                          <button onClick={() => setViewItem(item)}
                            className="px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {reportData.length > 50 && (
                <div className="px-1.5 py-1.5 text-center border-t border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Showing 50 of {reportData.length} entries</span>
                </div>
              )}
            </div>
          </CardSection>
        </>
      )}

      {activeTab === 'settings' && (
        <>
          <CardSection title="School Fee Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label="Currency" name="currency" value={settings.schoolFee.currency}
                onChange={(e) => handleSettingChange('schoolFee', 'currency', e.target.value)}
                options={['PKR', 'INR', 'USD']}
              />
              <SelectInput
                label="Academic Year" name="academicYear" value={settings.schoolFee.academicYear}
                onChange={(e) => handleSettingChange('schoolFee', 'academicYear', e.target.value)}
                options={SESSIONS}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {[
                { key: 'admissionFeeEnabled', label: 'Admission Fee' },
                { key: 'examFeeEnabled', label: 'Exam Fee' },
                { key: 'labFeeEnabled', label: 'Lab Fee' },
                { key: 'libraryFeeEnabled', label: 'Library Fee' },
                { key: 'transportFeeEnabled', label: 'Transport Fee' },
                { key: 'autoAssignFee', label: 'Auto-Assign Fee to New Students' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.schoolFee[key]}
                    onChange={(e) => handleSettingChange('schoolFee', key, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </CardSection>

          <CardSection title="Receipt Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Receipt Prefix" name="prefix" value={settings.receipt.prefix}
                onChange={(e) => handleSettingChange('receipt', 'prefix', e.target.value)}
                placeholder="RCP"
              />
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Auto-Generate Receipts</label>
                <label className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.receipt.autoGenerate}
                    onChange={(e) => handleSettingChange('receipt', 'autoGenerate', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-generate on payment</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {[
                { key: 'showSchoolLogo', label: 'Show School Logo' },
                { key: 'showStudentPhoto', label: 'Show Student Photo' },
                { key: 'showClassInfo', label: 'Show Class Info' },
                { key: 'showFeeBreakdown', label: 'Show Fee Breakdown' },
                { key: 'showPaymentMethod', label: 'Show Payment Method' },
                { key: 'showRemarks', label: 'Show Remarks' },
                { key: 'showSignature', label: 'Show Signature Area' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.receipt[key]}
                    onChange={(e) => handleSettingChange('receipt', key, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </CardSection>

          <CardSection title="Fine Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Late Fee Amount (per day)" name="lateFeeAmount" type="number"
                value={settings.fine.lateFeeAmount}
                onChange={(e) => handleSettingChange('fine', 'lateFeeAmount', Number(e.target.value))}
              />
              <Input
                label="Grace Period (days)" name="lateFeeDays" type="number"
                value={settings.fine.lateFeeDays}
                onChange={(e) => handleSettingChange('fine', 'lateFeeDays', Number(e.target.value))}
              />
              <Input
                label="Maximum Fine Amount" name="maxFine" type="number"
                value={settings.fine.maxFine}
                onChange={(e) => handleSettingChange('fine', 'maxFine', Number(e.target.value))}
              />
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fine Rules</label>
                <div className="space-y-2">
                  {[
                    { key: 'lateFeeEnabled', label: 'Enable Late Fee' },
                    { key: 'autoApplyFine', label: 'Auto-Apply Fine' },
                    { key: 'fineOnHoliday', label: 'Apply Fine on Holidays' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.fine[key]}
                        onChange={(e) => handleSettingChange('fine', key, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardSection>

          <CardSection title="Reminder Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Remind Before Due (days)" name="reminderDaysBefore" type="number"
                value={settings.reminder.reminderDaysBefore}
                onChange={(e) => handleSettingChange('reminder', 'reminderDaysBefore', Number(e.target.value))}
              />
              <Input
                label="Remind After Due (days)" name="reminderDaysAfter" type="number"
                value={settings.reminder.reminderDaysAfter}
                onChange={(e) => handleSettingChange('reminder', 'reminderDaysAfter', Number(e.target.value))}
              />
              <Input
                label="Max Reminders per Student" name="maxReminders" type="number"
                value={settings.reminder.maxReminders}
                onChange={(e) => handleSettingChange('reminder', 'maxReminders', Number(e.target.value))}
              />
              <SelectInput
                label="Reminder Method" name="reminderMethod" value={settings.reminder.reminderMethod}
                onChange={(e) => handleSettingChange('reminder', 'reminderMethod', e.target.value)}
                options={REMINDER_METHODS}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {[
                { key: 'enabled', label: 'Enable Reminders' },
                { key: 'includeAmount', label: 'Include Fee Amount' },
                { key: 'includeDueDate', label: 'Include Due Date' },
                { key: 'autoReminder', label: 'Send Automatically' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.reminder[key]}
                    onChange={(e) => handleSettingChange('reminder', key, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </CardSection>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleResetSettings}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </>
      )}

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title="Report Details" maxWidth="max-w-md">
          <div className="max-h-[75vh] overflow-y-auto space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.studentName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                {getInitials(viewItem.studentName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewItem.studentName}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Admission: {viewItem.admissionNo}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${statusStyles[viewItem.status] || statusStyles.Due}`}>
                {viewItem.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.class}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.month}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fee Amount</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.feeAmount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.discount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Amount</p>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mt-0.5">{formatCurrency(viewItem.paidAmount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Amount</p>
                <p className={`text-xs font-medium mt-0.5 ${viewItem.dueAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {formatCurrency(viewItem.dueAmount)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Late Fine</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.lateFine)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt No</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{viewItem.receiptNo}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.paymentMethod}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.date}</p>
              </div>
            </div>

            <div>
              <Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsSettings;
