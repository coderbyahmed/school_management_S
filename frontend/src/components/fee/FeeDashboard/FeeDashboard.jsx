import { useState, useEffect } from 'react';
import {
  UserGroupIcon, CurrencyDollarIcon, ClockIcon, BanknotesIcon,
  ArrowTrendingUpIcon, ScaleIcon, ArrowPathIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../../common/StatCard';
import CardSection from '../../common/CardSection';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import SelectInput from '../../common/SelectInput';
import feeDashboardService from '../../../services/feeDashboard.service';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const FeeDashboard = () => {
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [viewItem, setViewItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const result = feeDashboardService.getDashboardData();
      setData(result);
    } catch (e) {
      setError('Failed to load dashboard data');
    }
  }, []);

  const handleRefresh = () => {
    try {
      setData(null);
      setError(null);
      const result = feeDashboardService.refreshDashboard();
      setData(result);
    } catch (e) {
      setError('Failed to refresh data');
    }
  };

  const handleYearChange = (e) => setSelectedYear(e.target.value);
  const handleMonthChange = (e) => setSelectedMonth(e.target.value);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={handleRefresh}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
          >Try Again</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = data;

  const chartData = d.monthlyCollection || [];

  const statCards = [
    { icon: UserGroupIcon, label: 'Total Students', value: formatCurrency(d.totalStudents ?? 0), color: 'blue' },
    { icon: CurrencyDollarIcon, label: 'Total Fee Collection', value: formatCurrency(d.totalFeeCollection), color: 'green' },
    { icon: ClockIcon, label: 'Pending Fee', value: formatCurrency(d.pendingFee), color: 'yellow' },
    { icon: BanknotesIcon, label: "Today's Collection", value: formatCurrency(d.todayCollection), color: 'blue' },
    { icon: ArrowTrendingUpIcon, label: 'Monthly Collection', value: formatCurrency(d.monthlyCollectionTarget), color: 'blue' },
    { icon: ScaleIcon, label: 'Outstanding Balance', value: formatCurrency(d.outstandingBalance), color: 'red' },
  ];

  const growthRates = d.growthRates || {};
  const growthUp = d.growthUp || {};

  const statKeys = ['totalStudents', 'totalFeeCollection', 'pendingFee', 'todayCollection', 'monthlyCollectionTarget', 'outstandingBalance'];

  const recentPayments = d.recentPayments || [];
  const upcomingDue = d.upcomingDueStudents || [];
  const recentActivities = d.recentActivities || [];

  const getDueStatus = (dueDate) => {
    if (!dueDate) return 'normal';
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">Fee Management</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Fee Dashboard</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time overview of fee collection and outstanding payments</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <SelectInput label="Academic Year" name="year" value={selectedYear} onChange={handleYearChange}
              options={feeDashboardService.sessions} className="!mb-0" />
          </div>
          <div className="w-44">
            <SelectInput label="Month" name="month" value={selectedMonth} onChange={handleMonthChange}
              options={['All', ...feeDashboardService.months]} className="!mb-0" />
          </div>
          <button onClick={handleRefresh}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const key = statKeys[idx];
          const rate = growthRates[key];
          const up = growthUp[key];
          return (
            <div key={card.label} className="relative">
              <StatCard icon={card.icon} label={card.label} value={card.value} color={card.color} />
              {rate && (
                <span className={`absolute bottom-2 right-3 text-[10px] font-medium flex items-center gap-0.5 ${up ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  <span className={up ? '' : 'rotate-180 inline-block'}>&#9650;</span>
                  {rate}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSection title="Monthly Fee Collection" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip />
                <Legend verticalAlign="top" height={30} />
                <Line type="monotone" dataKey="collected" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="Collected" />
                <Line type="monotone" dataKey="trend" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#94a3b8' }} name="Trend" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardSection>

        <CardSection title="Fee Status Distribution">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.feeDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {(d.feeDistribution || []).map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardSection>
      </div>

      <CardSection title="Collection vs Pending">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="collected" fill="#2563eb" radius={[4, 4, 0, 0]} name="Collected" maxBarSize={40} />
              <Bar dataKey="pending" fill="#eab308" radius={[4, 4, 0, 0]} name="Pending" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardSection>

      <CardSection title="Recent Fee Collections">
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt No</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Method</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-1.5 py-6 text-center text-gray-400 dark:text-gray-500">No recent payments</td>
                </tr>
              ) : (
                recentPayments.slice(0, 8).map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono">{item.receipt}</td>
                    <td className="px-1.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(item.studentName)} flex items-center justify-center text-white font-bold text-[7px] flex-shrink-0`}>
                          {getInitials(item.studentName)}
                        </div>
                        <span className="text-[11px] font-medium text-gray-900 dark:text-white truncate max-w-[80px]">{item.studentName}</span>
                      </div>
                    </td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.className}</td>
                    <td className="px-1.5 py-2 text-[11px] font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.amount)}</td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.date}</td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.paymentMethod || '-'}</td>
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
                ))
              )}
            </tbody>
          </table>
          {recentPayments.length > 8 && (
            <div className="px-1.5 py-1.5 text-center border-t border-gray-200 dark:border-gray-700">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">Showing 8 of {recentPayments.length} payments</span>
            </div>
          )}
        </div>
      </CardSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSection title="Upcoming Due Students">
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Due Amount</th>
                  <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingDue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-1.5 py-6 text-center text-gray-400 dark:text-gray-500">No upcoming dues</td>
                  </tr>
                ) : (
                  upcomingDue.slice(0, 5).map((item) => {
                    const dueStatus = getDueStatus(item.dueDate);
                    const dueColors = {
                      overdue: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10',
                      urgent: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10',
                      normal: '',
                    };
                    return (
                      <tr key={item.id} className={`bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${dueColors[dueStatus] || ''}`}>
                        <td className="px-1.5 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(item.studentName)} flex items-center justify-center text-white font-bold text-[7px] flex-shrink-0`}>
                              {getInitials(item.studentName)}
                            </div>
                            <span className="text-[11px] font-medium text-gray-900 dark:text-white truncate max-w-[80px]">{item.studentName}</span>
                          </div>
                        </td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.className}</td>
                        <td className="px-1.5 py-2 text-[11px] font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(item.dueAmount)}</td>
                        <td className="px-1.5 py-2 whitespace-nowrap">
                          <span className={`text-[10px] ${dueStatus === 'overdue' ? 'text-red-600 dark:text-red-400 font-medium' : dueStatus === 'urgent' ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.dueDate}
                            {dueStatus === 'overdue' && ' (Overdue)'}
                            {dueStatus === 'urgent' && ' (Due soon)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardSection>

        <CardSection title="Recent Activity">
          <div className="space-y-0">
            {recentActivities.length === 0 ? (
              <div className="py-6 text-center text-gray-400 dark:text-gray-500">No recent activity</div>
            ) : (
              recentActivities.slice(0, 6).map((activity, idx) => {
                const iconMap = {
                  collection: { bg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', icon: CurrencyDollarIcon },
                  receipt: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', icon: DocumentTextIcon },
                  discount: { bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', icon: ArrowTrendingUpIcon },
                  fine: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: ClockIcon },
                  update: { bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', icon: ArrowPathIcon },
                  enroll: { bg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400', icon: UserGroupIcon },
                };
                const style = iconMap[activity.icon] || iconMap.collection;
                const IconComp = style.icon;
                return (
                  <div key={activity.id} className="relative flex items-start gap-2 py-2">
                    {idx < Math.min(recentActivities.slice(0, 6).length - 1, 5) && (
                      <div className="absolute left-[18px] top-7 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                    )}
                    <div className={`p-1 rounded-full flex-shrink-0 ${style.bg}`}>
                      <IconComp className="h-2.5 w-2.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{activity.action}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{activity.desc}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] text-gray-400 dark:text-gray-500">{activity.date}</span>
                        <span className="text-[8px] text-gray-400 dark:text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardSection>
      </div>

      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title="Payment Details" maxWidth="max-w-md">
          <div className="max-h-[75vh] overflow-y-auto space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.studentName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                {getInitials(viewItem.studentName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewItem.studentName}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Admission: {viewItem.admissionNo}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${statusStyles[viewItem.status] || statusStyles.Pending}`}>
                {viewItem.status || 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.className || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt No</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 font-mono">{viewItem.receipt || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.amount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.date || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.paymentMethod || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border mt-0.5 ${statusStyles[viewItem.status] || statusStyles.Pending}`}>
                  {viewItem.status || 'Pending'}
                </span>
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
