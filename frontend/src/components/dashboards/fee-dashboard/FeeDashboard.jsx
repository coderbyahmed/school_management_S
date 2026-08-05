import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  UserGroupIcon, CurrencyDollarIcon, ClockIcon, BanknotesIcon,
  ArrowTrendingUpIcon, ArrowPathIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import StatCard from '../../common/StatCard/StatCard';
import CardSection from '../../common/CardSection/CardSection';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import DateInput from '../../common/DateInput/DateInput';
import feeDashboardService from '../../../services/feeDashboard/feeDashboard.service';

const MONTHS = feeDashboardService.months;
const SESSIONS = feeDashboardService.sessions;
const CLASSES = feeDashboardService.classes;

const ITEMS_PER_PAGE = 10;

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

const formatDateTime = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

const PIE_COLORS = {
  Paid: '#16a34a',
  Pending: '#f59e0b',
  Partial: '#2563eb',
  Cash: '#16a34a',
  Cheque: '#2563eb',
  UPI: '#8b5cf6',
  'Bank Transfer': '#f59e0b',
  Other: '#6b7280',
};

const emptyFilters = {
  year: 'All',
  class: 'All',
  month: 'All',
  startDate: '',
  endDate: '',
};

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700/50 rounded-lg ${className}`} />
);

const StatSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm h-full">
    <Skeleton className="w-24 h-3 mb-3" />
    <Skeleton className="w-32 h-7 mb-2" />
    <Skeleton className="w-40 h-2.5" />
  </div>
);

const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="w-40 h-3" />
    <Skeleton className="w-full h-56" />
  </div>
);

const FeeDashboard = () => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await feeDashboardService.getDashboardData(filters);
      setData(result);
    } catch (err) {
      setData(null);
      toast.error(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await feeDashboardService.getDashboardData(filters);
      setData(result);
      toast.success('Dashboard refreshed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ ...emptyFilters });
    setCurrentPage(1);
  };

  const d = data || {};
  const cards = d.cards || null;
  const summary = d.financialSummary || null;
  const charts = d.charts || null;

  const recentPayments = d.recentCollections || [];
  const upcomingDue = d.upcomingDues || [];
  const recentActivities = d.recentActivities || [];

  const totalPages = Math.max(1, Math.ceil(recentPayments.length / ITEMS_PER_PAGE));
  const paginatedPayments = recentPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const monthlyTrendData = charts?.monthlyTrend || [];
  const feeStatusData = charts?.feeStatusDistribution || [];
  const classWiseData = charts?.classWise || [];
  const paymentMethodsData = charts?.paymentMethods || [];
  const comparison = charts?.collectionComparison || {};

  const comparisonData = [
    { name: 'Current Month', value: comparison.currentMonth || 0 },
    { name: 'Previous Month', value: comparison.previousMonth || 0 },
    { name: 'Current Year', value: comparison.currentAcademicYear || 0 },
    { name: 'Previous Year', value: comparison.previousAcademicYear || 0 },
  ];

  const getDueStatus = (remainingDays) => {
    if (remainingDays < 0) return 'overdue';
    if (remainingDays <= 3) return 'urgent';
    return 'normal';
  };

  const activityIconMap = {
    collection: { bg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', icon: CurrencyDollarIcon },
    receipt: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', icon: DocumentTextIcon },
    discount: { bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', icon: ArrowTrendingUpIcon },
    fine: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: ClockIcon },
    update: { bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', icon: ArrowPathIcon },
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <StatSkeleton key={i} />)}
        </div>
      );
    }
    if (!cards) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserGroupIcon}
          label="Total Students"
          value={cards.totalStudents.total.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Today's Collection"
          value={fullCurrency(cards.today.totalCollection)}
          color="green"
        />
        <StatCard
          icon={ClockIcon}
          label="Outstanding Amount"
          value={fullCurrency(cards.outstanding.totalRemaining)}
          color="yellow"
        />
        <StatCard
          icon={BanknotesIcon}
          label={`Monthly Collection (${cards.monthly.currentMonth})`}
          value={fullCurrency(cards.monthly.currentMonthCollection)}
          color="blue"
        />
      </div>
    );
  };

  const renderCardDetails = () => {
    if (loading || !cards) return null;
    const pct = cards.monthly.percentageChange;
    const pctUp = pct >= 0;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Fee Record Coverage</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">
            {cards.totalStudents.withFeeRecords} with fee records
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{cards.totalStudents.withoutFeeRecords} without</p>
        </div>
        <div className="bg-green-50/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Today's Transactions</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{cards.today.transactions} transactions</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg {fullCurrency(cards.today.averageTransaction)}</p>
        </div>
        <div className="bg-yellow-50/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Outstanding Breakdown</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{cards.outstanding.pendingStudents} pending</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{cards.outstanding.partialStudents} partial</p>
        </div>
        <div className="bg-indigo-50/60 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">vs {cards.monthly.previousMonth}</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1 flex items-center gap-1">
            {pctUp ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 dark:text-red-400 rotate-180" />
            )}
            {Math.abs(pct).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pctUp ? 'up' : 'down'} {fullCurrency(Math.abs(cards.monthly.difference))}
          </p>
        </div>
      </div>
    );
  };

  const renderFinancialSummary = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }, (_, i) => <StatSkeleton key={i} />)}
        </div>
      );
    }
    if (!summary) return null;
    const items = [
      { label: 'Total Fees', value: fullCurrency(summary.totalFees), color: 'text-blue-600 dark:text-blue-400' },
      { label: 'Total Collected', value: fullCurrency(summary.totalCollected), color: 'text-green-600 dark:text-green-400' },
      { label: 'Total Outstanding', value: fullCurrency(summary.totalOutstanding), color: 'text-red-600 dark:text-red-400' },
      { label: 'Total Discount', value: fullCurrency(summary.totalDiscount), color: 'text-purple-600 dark:text-purple-400' },
      { label: 'Total Fine', value: fullCurrency(summary.totalFine), color: 'text-orange-600 dark:text-orange-400' },
      { label: 'Net Collection', value: fullCurrency(summary.totalNetCollection), color: 'text-teal-600 dark:text-teal-400' },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
            <p className={`text-lg font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderCharts = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSection title="Monthly Collection Trend" className="lg:col-span-2"><ChartSkeleton /></CardSection>
            <CardSection title="Fee Status Distribution"><ChartSkeleton /></CardSection>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSection title="Class-wise Collection" className="lg:col-span-2"><ChartSkeleton /></CardSection>
            <CardSection title="Payment Method Distribution"><ChartSkeleton /></CardSection>
          </div>
        </div>
      );
    }
    if (!charts) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSection title="Monthly Collection Trend (Last 12 Months)" className="lg:col-span-2">
            <div className="h-72">
              {monthlyTrendData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">No collection data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => fullCurrency(value)} />
                    <Legend verticalAlign="top" height={30} />
                    <Line type="monotone" dataKey="collected" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Collected" />
                    <Line type="monotone" dataKey="remaining" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#f59e0b' }} name="Remaining" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardSection>

          <CardSection title="Fee Status Distribution">
            <div className="h-72 flex items-center justify-center">
              {feeStatusData.every((f) => f.value === 0) ? (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No records available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {feeStatusData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#6b7280'} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSection title="Class-wise Collection" className="lg:col-span-2">
            <div className="h-72">
              {classWiseData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">No collection data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classWiseData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="className" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => fullCurrency(value)} />
                    <Legend verticalAlign="top" height={30} />
                    <Bar dataKey="collected" fill="#2563eb" radius={[4, 4, 0, 0]} name="Collected" maxBarSize={30} />
                    <Bar dataKey="remaining" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Remaining" maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardSection>

          <CardSection title="Payment Method Distribution">
            <div className="h-72 flex items-center justify-center">
              {paymentMethodsData.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500 text-sm">No payment data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethodsData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="collected">
                      {paymentMethodsData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#6b7280'} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => fullCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardSection>
        </div>

        <CardSection title="Collection Comparison">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => fullCurrency(value)} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} name="Collection" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardSection>
      </div>
    );
  };

  const renderRecentCollections = () => {
    return (
      <CardSection title={`Recent Fee Collections (${recentPayments.length})`}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="w-full h-10" />)}
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="py-8 text-center text-gray-400 dark:text-gray-500">No recent fee collections</div>
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt No</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Method</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Collected By</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPayments.map((item) => (
                  <tr key={item._id || item.receiptNumber} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono">{item.receiptNumber}</td>
                    <td className="px-1.5 py-2">
                      <div className="flex items-center gap-1.5">
                        {item.studentImage ? (
                          <img src={item.studentImage} alt={item.studentName} className="w-5 h-5 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(item.studentName)} flex items-center justify-center text-white font-bold text-[7px] flex-shrink-0`}>
                            {getInitials(item.studentName)}
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{item.studentName}</span>
                      </div>
                    </td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.class}</td>
                    <td className="px-1.5 py-2 text-[11px] font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{fullCurrency(item.paidAmount)}</td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.paymentMethod || '-'}</td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.collectedByName || '-'}</td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(item.paymentDate)}</td>
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium border ${statusStyles[item.status] || statusStyles.Pending}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <button onClick={() => setViewItem(item)}
                        className="px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && recentPayments.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardSection>
    );
  };

  const renderUpcomingDues = () => {
    return (
      <CardSection title={`Upcoming Due Students (${upcomingDue.length})`}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="w-full h-10" />)}
          </div>
        ) : upcomingDue.length === 0 ? (
          <div className="py-8 text-center text-gray-400 dark:text-gray-500">No upcoming dues</div>
        ) : (
          <div className="space-y-2">
            {upcomingDue.map((item) => {
              const dueStatus = getDueStatus(item.remainingDays);
              const statusColor = {
                overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
                urgent: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
                normal: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
              };
              const statusLabel =
                dueStatus === 'overdue' ? 'Overdue' : dueStatus === 'urgent' ? 'Due soon' : 'Upcoming';
              return (
                <div key={item.studentId} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {item.studentImage ? (
                    <img src={item.studentImage} alt={item.fullName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(item.fullName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                      {getInitials(item.fullName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.fullName}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {item.class} · {item.studentNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{fullCurrency(item.dueAmount)}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{formatDate(item.dueDate)}</p>
                  </div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border flex-shrink-0 ${statusColor[dueStatus]}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardSection>
    );
  };

  const renderActivities = () => {
    return (
      <CardSection title={`Recent Activities (${recentActivities.length})`}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="w-full h-10" />)}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="py-8 text-center text-gray-400 dark:text-gray-500">No recent activity</div>
        ) : (
          <div className="space-y-0">
            {recentActivities.map((activity, idx) => {
              const style = activityIconMap[activity.type] || activityIconMap.collection;
              const IconComp = style.icon;
              return (
                <div key={idx} className="relative flex items-start gap-2 py-2">
                  {idx < recentActivities.length - 1 && (
                    <div className="absolute left-[18px] top-7 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className={`p-1 rounded-full flex-shrink-0 ${style.bg}`}>
                    <IconComp className="h-2.5 w-2.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{activity.action}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
                    <span className="text-[8px] text-gray-400 dark:text-gray-500">{formatDateTime(activity.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardSection>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time overview of fee collection and outstanding payments</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing || loading}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {refreshing ? <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <ArrowPathIcon className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <FilterDropdown label="Academic Year" options={['All', ...SESSIONS]} value={filters.year} onChange={handleFilterChange('year')} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={filters.class} onChange={handleFilterChange('class')} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Month" options={['All', ...MONTHS]} value={filters.month} onChange={handleFilterChange('month')} />
          </div>
          <div className="w-44">
            <DateInput label="Start Date" name="startDate" value={filters.startDate} onChange={(e) => handleFilterChange('startDate')(e.target.value)} />
          </div>
          <div className="w-44">
            <DateInput label="End Date" name="endDate" value={filters.endDate} onChange={(e) => handleFilterChange('endDate')(e.target.value)} />
          </div>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            Reset
          </button>
        </div>
        {data?.meta?.generatedAt && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
            Generated {formatDateTime(data.meta.generatedAt)} by {data.meta.generatedBy}
          </p>
        )}
      </div>

      {renderCards()}
      {renderCardDetails()}
      {renderFinancialSummary()}
      {renderCharts()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderUpcomingDues()}
        {renderActivities()}
      </div>

      {renderRecentCollections()}

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title="Payment Details" maxWidth="max-w-md">
          <div className="max-h-[75vh] overflow-y-auto space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              {viewItem.studentImage ? (
                <img src={viewItem.studentImage} alt={viewItem.studentName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0" />
              ) : (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.studentName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                  {getInitials(viewItem.studentName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewItem.studentName}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{viewItem.student?.studentId || '-'}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${statusStyles[viewItem.status] || statusStyles.Pending}`}>
                {viewItem.status || 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.class || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt No</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{viewItem.receiptNumber || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{fullCurrency(viewItem.paidAmount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(viewItem.paymentDate)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.paymentMethod || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collected By</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.collectedByName || '-'}</p>
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

export default FeeDashboard;
