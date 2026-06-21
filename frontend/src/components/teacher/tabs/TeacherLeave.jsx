import { useState } from 'react';
import { ClipboardDocumentListIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ConfirmationModal from '../../common/ConfirmationModal';

const leaveRequests = [];

const leaveTypes = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Other'];

const TeacherLeave = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);

  const filteredLeaves = leaveRequests.filter((l) => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (dateFilter && l.fromDate !== dateFilter && l.toDate !== dateFilter) return false;
    return true;
  });

  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter((l) => l.status === 'Pending').length;
  const approvedRequests = leaveRequests.filter((l) => l.status === 'Approved').length;
  const rejectedRequests = leaveRequests.filter((l) => l.status === 'Rejected').length;

  const columns = [
    { key: 'teacher', label: 'Teacher' },
    { key: 'leaveType', label: 'Leave Type' },
    { key: 'fromDate', label: 'From Date' },
    { key: 'toDate', label: 'To Date' },
    { key: 'totalDays', label: 'Total Days' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (leave) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
            {leave.teacherName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC'}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{leave.teacherName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{leave.leaveType}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{leave.fromDate}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{leave.toDate}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{leave.totalDays}</td>
      <td className="px-4 py-3">
        <StatusBadge status={leave.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setActionTarget(leave); setActionType('approve'); }}
            className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
            title="Approve"
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setActionTarget(leave); setActionType('reject'); }}
            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            title="Reject"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardDocumentListIcon} label="Total Leave Requests" value={totalRequests} color="blue" />
        <StatCard icon={ClockIcon} label="Pending" value={pendingRequests} color="yellow" />
        <StatCard icon={CheckCircleIcon} label="Approved" value={approvedRequests} color="green" />
        <StatCard icon={XCircleIcon} label="Rejected" value={rejectedRequests} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full sm:w-44">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="appearance-none w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
        <div className="w-full sm:w-36">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm">No leave requests found</p>
        </div>
      ) : (
        <Table columns={columns} data={filteredLeaves} renderRow={renderRow} />
      )}

      <ConfirmationModal
        isOpen={!!actionTarget}
        onClose={() => { setActionTarget(null); setActionType(null); }}
        title={actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        message={`Are you sure you want to ${actionType} this leave request?`}
        confirmLabel={actionType === 'approve' ? 'Approve' : 'Reject'}
        cancelLabel="Cancel"
        variant={actionType === 'approve' ? 'primary' : 'danger'}
        onConfirm={() => {
          setActionTarget(null);
          setActionType(null);
        }}
      />
    </div>
  );
};

export default TeacherLeave;
