import { useState } from 'react';
import { UsersIcon, BanknotesIcon, CurrencyDollarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import Table from '../../common/Table';
import Modal from '../../common/Modal';

const payrollRecords = [];

const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const paymentStatuses = ['All', 'Paid', 'Unpaid'];

const TeacherPayroll = () => {
  const [monthFilter, setMonthFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [viewRecord, setViewRecord] = useState(null);

  const filteredRecords = payrollRecords.filter((r) => {
    if (monthFilter && r.month !== monthFilter) return false;
    if (paymentFilter !== 'All' && r.paymentStatus !== paymentFilter) return false;
    return true;
  });

  const totalStaff = payrollRecords.length;
  const paidStaff = payrollRecords.filter((r) => r.paymentStatus === 'Paid').length;
  const unpaidStaff = payrollRecords.filter((r) => r.paymentStatus === 'Unpaid').length;
  const currentMonthSalary = payrollRecords.filter((r) => r.month === monthFilter || !monthFilter).reduce((sum, r) => sum + (r.salary || 0), 0);

  const columns = [
    { key: 'teacher', label: 'Teacher' },
    { key: 'salary', label: 'Salary' },
    { key: 'month', label: 'Month' },
    { key: 'paymentStatus', label: 'Payment Status' },
    { key: 'paymentDate', label: 'Payment Date' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (record) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
            {record.teacherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC'}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{record.teacherName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{record.salary}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{record.month}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          record.paymentStatus === 'Paid'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>
          {record.paymentStatus}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{record.paymentDate}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => setViewRecord(record)}
          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
          title="View"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Payroll</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Staff" value={totalStaff} color="blue" />
        <StatCard icon={BanknotesIcon} label="Paid" value={paidStaff} color="green" />
        <StatCard icon={CurrencyDollarIcon} label="Unpaid" value={unpaidStaff} color="red" />
        <StatCard icon={CalendarDaysIcon} label="Current Month Salary" value={`$${currentMonthSalary}`} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Month</label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm">No payroll records found</p>
        </div>
      ) : (
        <Table columns={columns} data={filteredRecords} renderRow={renderRow} />
      )}

      <Modal
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title="Payroll Details"
        maxWidth="max-w-sm"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">Teacher</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewRecord?.teacherName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">Salary</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewRecord?.salary}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">Month</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewRecord?.month}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">Payment Status</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewRecord?.paymentStatus}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">Payment Date</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{viewRecord?.paymentDate}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherPayroll;
