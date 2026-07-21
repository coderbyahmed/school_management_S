import { useState } from 'react';
import {
  UserGroupIcon, CurrencyDollarIcon, ClockIcon, ArrowTrendingUpIcon,
  ExclamationTriangleIcon, CheckBadgeIcon, ArrowPathIcon,
  BanknotesIcon, ReceiptPercentIcon, DocumentTextIcon, ChartBarSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CardSection from '../../common/CardSection';
import FilterDropdown from '../../common/FilterDropdown';
import Modal from '../../common/Modal';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sessions = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const monthlyData = [
  { month: 'Jan', collection: 850000, previous: 720000 },
  { month: 'Feb', collection: 920000, previous: 780000 },
  { month: 'Mar', collection: 880000, previous: 810000 },
  { month: 'Apr', collection: 950000, previous: 830000 },
  { month: 'May', collection: 1020000, previous: 860000 },
  { month: 'Jun', collection: 980000, previous: 890000 },
];

const feeStatusData = [
  { name: 'Paid', value: 65, color: '#22c55e' },
  { name: 'Pending', value: 18, color: '#eab308' },
  { name: 'Partial', value: 10, color: '#3b82f6' },
  { name: 'Overdue', value: 7, color: '#ef4444' },
];

const recentTransactions = [
  { id: 1, receipt: 'RCP-2026-0842', student: 'Ali Hassan', class: '10-A', admissionNo: 'STU-2024-0124', feeType: 'Tuition Fee', date: '20 Jul 2026', amount: 8500, remainingAmount: 0, paymentMethod: 'Cash', collectedBy: 'Mr. Rizwan Ahmed', paymentMonth: 'July 2026', status: 'Paid' },
  { id: 2, receipt: 'RCP-2026-0841', student: 'Fatima Ahmed', class: '9-B', admissionNo: 'STU-2023-0456', feeType: 'Annual Charges', date: '20 Jul 2026', amount: 12000, remainingAmount: 0, paymentMethod: 'Bank Transfer', collectedBy: 'Mrs. Saima Khan', paymentMonth: 'July 2026', status: 'Paid' },
  { id: 3, receipt: 'RCP-2026-0840', student: 'Muhammad Usman', class: '8-C', admissionNo: 'STU-2023-0789', feeType: 'Tuition Fee', date: '19 Jul 2026', amount: 7500, remainingAmount: 0, paymentMethod: 'JazzCash', collectedBy: 'Mr. Rizwan Ahmed', paymentMonth: 'July 2026', status: 'Paid' },
  { id: 4, receipt: 'RCP-2026-0839', student: 'Ayesha Khan', class: '7-A', admissionNo: 'STU-2022-1122', feeType: 'Transport Fee', date: '19 Jul 2026', amount: 3000, remainingAmount: 3000, paymentMethod: 'Cheque', collectedBy: 'Mrs. Saima Khan', paymentMonth: 'July 2026', status: 'Pending' },
  { id: 5, receipt: 'RCP-2026-0838', student: 'Bilal Zafar', class: '11-B', admissionNo: 'STU-2022-1567', feeType: 'Tuition Fee', date: '18 Jul 2026', amount: 9500, remainingAmount: 4500, paymentMethod: 'Cash', collectedBy: 'Mr. Rizwan Ahmed', paymentMonth: 'June 2026', status: 'Partial' },
  { id: 6, receipt: 'RCP-2026-0837', student: 'Sara Malik', class: '6-A', admissionNo: 'STU-2024-1890', feeType: 'Lab Fee', date: '18 Jul 2026', amount: 2000, remainingAmount: 0, paymentMethod: 'Bank Transfer', collectedBy: 'Mrs. Saima Khan', paymentMonth: 'July 2026', status: 'Paid' },
  { id: 7, receipt: 'RCP-2026-0836', student: 'Hamza Ali', class: '12-C', admissionNo: 'STU-2021-2234', feeType: 'Tuition Fee', date: '17 Jul 2026', amount: 10000, remainingAmount: 10000, paymentMethod: 'Cash', collectedBy: 'Mr. Rizwan Ahmed', paymentMonth: 'June 2026', status: 'Overdue' },
  { id: 8, receipt: 'RCP-2026-0835', student: 'Zainab Noor', class: '5-B', admissionNo: 'STU-2024-2567', feeType: 'Admission Fee', date: '17 Jul 2026', amount: 15000, remainingAmount: 0, paymentMethod: 'JazzCash', collectedBy: 'Mrs. Saima Khan', paymentMonth: 'July 2026', status: 'Paid' },
];

const upcomingDueFees = [
  { id: 1, student: 'Ali Hassan', class: '10-A', dueDate: '25 Jul 2026', amount: 8500, status: 'Upcoming' },
  { id: 2, student: 'Fatima Ahmed', class: '9-B', dueDate: '25 Jul 2026', amount: 7500, status: 'Upcoming' },
  { id: 3, student: 'Muhammad Usman', class: '8-C', dueDate: '28 Jul 2026', amount: 7500, status: 'Upcoming' },
  { id: 4, student: 'Sara Malik', class: '6-A', dueDate: '30 Jul 2026', amount: 6000, status: 'Upcoming' },
  { id: 5, student: 'Hamza Ali', class: '12-C', dueDate: '01 Aug 2026', amount: 10000, status: 'Overdue' },
];

const notifications = [
  { text: '15 fees collected today', type: 'success' },
  { text: '3 fees overdue', type: 'danger' },
  { text: '12 receipts generated', type: 'info' },
  { text: '5 new admissions pending fee setup', type: 'warning' },
];

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Upcoming: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
};

const formatCurrency = (val) => {
  if (val >= 100000) return 'Rs. ' + (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return 'Rs. ' + (val / 1000).toFixed(0) + 'K';
  return 'Rs. ' + val;
};

const FeeStatCard = ({ icon: Icon, label, value, color = 'blue', children }) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {children}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationTypeStyles = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
};

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
        <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>
          {payload[0].name}: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const FeeDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState('July');
  const [selectedSession, setSelectedSession] = useState('2026');
  const [viewTxn, setViewTxn] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor and manage all fee-related activities</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <FilterDropdown label="" options={months} value={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <div className="w-32">
            <FilterDropdown label="" options={sessions} value={selectedSession} onChange={setSelectedSession} />
          </div>
          <button className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" title="Refresh">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeeStatCard icon={UserGroupIcon} label="Total Students" value="2,450" color="blue">
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+12%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">vs last month</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Today's Collection: <span className="font-semibold text-gray-700 dark:text-gray-300">Rs. 1,85,000</span></p>
        </FeeStatCard>

        <FeeStatCard icon={CurrencyDollarIcon} label="Today's Collection" value="Rs. 1,85,000" color="green">
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+8.2%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Rs. 14,000 more than yesterday</span>
          </div>
        </FeeStatCard>

        <FeeStatCard icon={ClockIcon} label="Pending Fees" value="Rs. 4,20,000" color="yellow">
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">180 students</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">need to pay</span>
          </div>
        </FeeStatCard>

        <FeeStatCard icon={ArrowTrendingUpIcon} label="Monthly Revenue" value="Rs. 12,50,000" color="purple">
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">+15%</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Rs. 10,80,000 previous month</span>
          </div>
        </FeeStatCard>

        <FeeStatCard icon={ExclamationTriangleIcon} label="Overdue Fees" value="Rs. 2,80,000" color="red">
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">45 Critical</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">accounts need follow-up</span>
          </div>
        </FeeStatCard>

        <FeeStatCard icon={CheckBadgeIcon} label="Collection Rate" value="78%" color="orange">
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: '78%' }} />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Target: 90%</p>
          </div>
        </FeeStatCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CardSection title="Monthly Fee Collection">
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="collectionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" className="text-xs fill-gray-500 dark:fill-gray-400" tickLine={false} />
                  <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" tickLine={false} axisLine={false} tickFormatter={(v) => (v / 1000) + 'K'} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="previous" stroke="#9ca3af" strokeWidth={2} fill="url(#previousGradient)" name="Previous" />
                  <Area type="monotone" dataKey="collection" stroke="#3b82f6" strokeWidth={2} fill="url(#collectionGradient)" name="Collection" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardSection>
        </div>

        <div className="lg:col-span-2">
          <CardSection title="Fee Status Distribution">
            <div className="h-72 sm:h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="220">
                <PieChart>
                  <Pie data={feeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {feeStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {feeStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardSection>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Collect Fee', icon: BanknotesIcon, color: 'blue', iconClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
          { label: 'Generate Receipt', icon: ReceiptPercentIcon, color: 'green', iconClass: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
          { label: 'Add Student Fee', icon: DocumentTextIcon, color: 'purple', iconClass: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
          { label: 'Export Report', icon: ChartBarSquareIcon, color: 'orange', iconClass: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
        ].map((action) => (
          <button key={action.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer group">
            <div className={`p-3 rounded-lg ${action.iconClass} group-hover:scale-110 transition-transform`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CardSection title="Recent Transactions">
            <div className="-mx-2 sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Receipt #', 'Student', 'Class', 'Fee Type', 'Date', 'Amount', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-2.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentTransactions.map((txn) => (
                    <tr key={txn.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-2.5 py-2.5 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{txn.receipt}</td>
                      <td className="px-2.5 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{txn.student}</td>
                      <td className="px-2.5 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{txn.class}</td>
                      <td className="px-2.5 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{txn.feeType}</td>
                      <td className="px-2.5 py-2.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{txn.date}</td>
                      <td className="px-2.5 py-2.5 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(txn.amount)}</td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[txn.status]}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 whitespace-nowrap">
                        <button onClick={() => setViewTxn(txn)} className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardSection>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Notifications */}
          <CardSection title="Notifications">
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className={`p-3 rounded-lg border text-xs font-medium ${NotificationTypeStyles[n.type]}`}>
                  {n.text}
                </div>
              ))}
            </div>
          </CardSection>

          {/* Fee Summary */}
          <CardSection title="Fee Summary">
            <div className="space-y-4">
              {feeStatusData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </CardSection>
        </div>
      </div>

      {/* Upcoming Due Fees */}
      <CardSection title="Upcoming Due Fees">
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['Student', 'Class', 'Due Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingDueFees.map((fee) => (
                <tr key={fee.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{fee.student}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fee.class}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{fee.dueDate}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(fee.amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[fee.status]}`}>
                      {fee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardSection>

      <Modal isOpen={!!viewTxn} onClose={() => setViewTxn(null)} title="Transaction Details" maxWidth="max-w-2xl">
        {viewTxn && (
          <div className="flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/40 dark:to-blue-700/40 flex items-center justify-center text-blue-600 dark:text-blue-300 text-lg font-bold flex-shrink-0">
                {viewTxn.student.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{viewTxn.student}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission No: {viewTxn.admissionNo}</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 -mx-2 px-2 py-4 space-y-3 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Receipt Number" value={viewTxn.receipt} />
                <Field label="Class" value={viewTxn.class} />
                <Field label="Fee Type" value={viewTxn.feeType} />
                <Field label="Payment Month" value={viewTxn.paymentMonth} />
                <Field label="Amount Paid" value={formatCurrency(viewTxn.amount)} highlight />
                <Field label="Remaining Amount" value={formatCurrency(viewTxn.remainingAmount)} highlight />
                <Field label="Payment Method" value={viewTxn.paymentMethod} />
                <Field label="Payment Date" value={viewTxn.date} />
                <Field label="Payment Status">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[viewTxn.status]}`}>
                    {viewTxn.status}
                  </span>
                </Field>
                <Field label="Collected By" value={viewTxn.collectedBy} />
                <div className="sm:col-span-2">
                  <Field label="Remarks" value="Payment received and receipt generated successfully. No discrepancies found." />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button onClick={() => setViewTxn(null)}
                className="px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const Field = ({ label, value, children, highlight }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    {children || (
      <p className={`text-sm ${highlight ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{value}</p>
    )}
  </div>
);

export default FeeDashboard;
