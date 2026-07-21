import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UserGroupIcon, CurrencyDollarIcon, ClockIcon, ExclamationTriangleIcon,
  ArrowPathIcon, EyeIcon, PencilSquareIcon, BanknotesIcon,
  PrinterIcon, XMarkIcon, DocumentTextIcon, ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SearchInput from '../../common/SearchInput';
import FilterDropdown from '../../common/FilterDropdown';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import ActionButtons from '../../common/ActionButtons';
import studentFeeService from '../../../services/student-fee.service';

const statusStyles = {
  Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  Pending: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
};

const initialPaymentForm = {
  date: new Date().toISOString().split('T')[0],
  method: 'Cash',
  amount: '',
  discount: '',
  fine: '',
  notes: '',
};

const StudentFees = () => {
  const [data, setData] = useState({ students: [], pagination: { totalStudents: 0, totalPages: 0, currentPage: 1 } });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('2025');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewItem, setViewItem] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [collectTarget, setCollectTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ ...initialPaymentForm });

  const loadData = () => {
    setLoading(true);
    const filters = {};
    if (searchQuery) filters.search = searchQuery;
    if (sessionFilter) filters.session = sessionFilter;
    if (classFilter) filters.className = classFilter;
    if (statusFilter) filters.status = statusFilter;
    const result = studentFeeService.getStudentFees(filters, currentPage);
    setData(result);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [searchQuery, sessionFilter, classFilter, statusFilter]);

  const stats = useMemo(() => studentFeeService.getStats(), []);

  const formatCurrency = (val) => {
    const n = Number(val);
    if (isNaN(n)) return 'Rs. 0';
    return 'Rs. ' + n.toLocaleString();
  };

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
      'from-orange-500 to-orange-700', 'from-cyan-500 to-cyan-700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const openCollectForm = (item) => {
    setEditingId(null);
    setCollectTarget(item);
    setPaymentForm({
      ...initialPaymentForm,
      date: new Date().toISOString().split('T')[0],
      discount: item.discount || '',
      fine: item.fine || '',
    });
    setShowPaymentForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setCollectTarget(null);
    setPaymentForm({
      date: item.updatedAt || new Date().toISOString().split('T')[0],
      method: 'Cash',
      amount: item.paidAmount || '',
      discount: item.discount || '',
      fine: item.fine || '',
      notes: '',
    });
    setShowPaymentForm(true);
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setEditingId(null);
    setCollectTarget(null);
    setPaymentForm({ ...initialPaymentForm });
  };

  const handlePaymentSave = () => {
    if (editingId) {
      studentFeeService.updateStudentFee(editingId, {
        discount: Number(paymentForm.discount) || 0,
        fine: Number(paymentForm.fine) || 0,
      });
      toast.success('Fee record updated successfully');
      closePaymentForm();
      loadData();
      if (viewItem) {
        const updated = studentFeeService.getStudentFee(viewItem.id);
        setViewItem(updated);
      }
      return;
    }
    if (!collectTarget) return;
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    studentFeeService.collectFee(collectTarget.id, {
      date: paymentForm.date,
      method: paymentForm.method,
      amount: Number(paymentForm.amount),
      discount: Number(paymentForm.discount) || 0,
      fine: Number(paymentForm.fine) || 0,
      notes: paymentForm.notes,
    });
    toast.success('Fee collected successfully');
    closePaymentForm();
    loadData();
    if (viewItem) {
      const updated = studentFeeService.getStudentFee(viewItem.id);
      setViewItem(updated);
    }
  };

  const handlePrintReceipt = (item) => {
    toast.success(`Receipt printed for ${item.studentName}`);
  };

  const handleView = (item) => {
    setViewItem(item);
  };

  const handleCloseView = () => {
    setViewItem(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSessionFilter('2025');
    setClassFilter('');
    setStatusFilter('');
  };

  const { students, pagination } = data;
  const totalPages = pagination.totalPages;
  const safeCurrentPage = pagination.currentPage;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    let start = Math.max(1, safeCurrentPage - 2);
    let end = Math.min(totalPages, safeCurrentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    const startRecord = (safeCurrentPage - 1) * studentFeeService.ITEMS_PER_PAGE + 1;
    const endRecord = Math.min(safeCurrentPage * studentFeeService.ITEMS_PER_PAGE, pagination.totalStudents);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startRecord}–{endRecord} of {pagination.totalStudents}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1 || loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Previous</button>
          {start > 1 && (
            <><button onClick={() => setCurrentPage(1)} className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">1</button>{start > 2 && <span className="px-1 text-gray-400">...</span>}</>
          )}
          {pages.map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} disabled={loading}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${safeCurrentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{page}</button>
          ))}
          {end < totalPages && (
            <>{end < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}<button onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">{totalPages}</button></>
          )}
          <button onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages || loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Next</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Fees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage fee collection for all students</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label="Total Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={CurrencyDollarIcon} label="Paid Amount" value={formatCurrency(stats.paidAmount)} color="green" />
        <StatCard icon={ClockIcon} label="Outstanding Amount" value={formatCurrency(stats.outstandingAmount)} color="yellow" />
        <StatCard icon={ExclamationTriangleIcon} label="Due Today" value={stats.dueToday} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-56">
            <SearchInput placeholder="Search by name or admission no..." value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="w-28">
            <FilterDropdown label="Year" options={studentFeeService.SESSIONS} value={sessionFilter} onChange={setSessionFilter} />
          </div>
          <div className="w-36">
            <FilterDropdown label="Class" options={['All Classes', ...studentFeeService.CLASSES]} value={classFilter || 'All Classes'} onChange={(v) => setClassFilter(v === 'All Classes' ? '' : v)} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Status" options={['All Status', 'Paid', 'Partial', 'Pending', 'Overdue']} value={statusFilter || 'All Status'} onChange={(v) => setStatusFilter(v === 'All Status' ? '' : v)} />
          </div>
          <button onClick={resetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                {[{ key: 'student', label: 'Student', className: 'text-left min-w-[150px]' }, { key: 'class', label: 'Class' }, { key: 'fee', label: 'Monthly Fee' }, { key: 'paid', label: 'Paid Amount' }, { key: 'remaining', label: 'Remaining' }, { key: 'installment', label: 'Inst.', className: 'hidden sm:table-cell' }, { key: 'status', label: 'Status' }, { key: 'due', label: 'Due Date', className: 'hidden sm:table-cell' }, { key: 'actions', label: 'Actions', className: 'text-right' }].map((col) => (
                  <th key={col.key} className={`px-2.5 py-3 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-400">Loading student fees...</p>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BanknotesIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-400 dark:text-gray-500">No student fee records found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-2.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(item.studentName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                          {getInitials(item.studentName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[130px]">{item.studentName}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.admissionNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.className}</td>
                    <td className="px-2.5 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.monthlyFee)}</td>
                    <td className="px-2.5 py-3 text-sm text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{formatCurrency(item.paidAmount)}</td>
                    <td className={`px-2.5 py-3 text-sm font-medium whitespace-nowrap ${item.remainingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatCurrency(item.remainingBalance)}</td>
                    <td className="px-2.5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">{item.paidInstallments}/{item.totalInstallments}</td>
                    <td className="px-2.5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="px-2.5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">{item.dueDate}</td>
                    <td className="px-2.5 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => handleView(item)} className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => openCollectForm(item)} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer" title="Collect Fee">
                          <CurrencyDollarIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditForm(item)} className="p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors cursor-pointer" title="Edit">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {students.length > 0 && !loading && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {renderPagination()}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewItem && !showPaymentForm && (
        <Modal isOpen={true} onClose={handleCloseView} title="Student Fee Details" maxWidth="max-w-lg">
          <div className="max-h-[75vh] overflow-y-auto -mx-6 px-6">
            {/* Student Profile */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.studentName)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {getInitials(viewItem.studentName)}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{viewItem.studentName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission: {viewItem.admissionNo} &middot; {viewItem.className}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[viewItem.status]}`}>{viewItem.status}</span>
            </div>

            {/* Fee Summary */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Fee Summary</p>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Monthly Fee</span><span className="text-xs font-medium text-gray-800 dark:text-gray-200">{formatCurrency(viewItem.monthlyFee)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Discount</span><span className="text-xs font-medium text-green-600 dark:text-green-400">{formatCurrency(viewItem.discount)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Fine</span><span className="text-xs font-medium text-red-600 dark:text-red-400">{formatCurrency(viewItem.fine)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Total Payable</span><span className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(viewItem.totalPayable)}</span></div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Paid Amount</span><span className="text-xs font-semibold text-green-600 dark:text-green-400">{formatCurrency(viewItem.paidAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Outstanding Amount</span><span className={`text-xs font-semibold ${viewItem.remainingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatCurrency(viewItem.remainingBalance)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500 dark:text-gray-400">Due Amount</span><span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{viewItem.status === 'Paid' ? 'Rs. 0' : formatCurrency(viewItem.remainingBalance)}</span></div>
                </div>
              </div>
            </div>

            {/* Installment Details */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Installment Details</p>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Installment Amount</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(viewItem.installmentAmount)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">{viewItem.paidInstallments}/{viewItem.totalInstallments}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">{viewItem.totalInstallments - viewItem.paidInstallments}</p>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {viewItem.paymentHistory && viewItem.paymentHistory.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment History</p>
                <div className="space-y-1.5">
                  {viewItem.paymentHistory.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <ReceiptPercentIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{formatCurrency(p.amount)}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{p.date} &middot; {p.method} &middot; Inst. #{p.installmentNo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{p.receiptNo}</p>
                        {p.notes && <p className="text-[10px] text-gray-400 dark:text-gray-500 max-w-[100px] truncate">{p.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10 rounded-xl px-4 py-3 border border-yellow-200 dark:border-yellow-800/30">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">Due Date</span>
                </div>
                <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">{viewItem.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={handleCloseView}>Close</Button>
            <Button variant="outline" onClick={() => handlePrintReceipt(viewItem)} className="!w-auto px-4 !py-2">
              <PrinterIcon className="h-4 w-4 mr-1.5" /> Print Receipt
            </Button>
            {viewItem.status !== 'Paid' && (
              <Button variant="primary" onClick={() => { setShowPaymentForm(true); openCollectForm(viewItem); }} className="!w-auto px-4 !py-2">
                <CurrencyDollarIcon className="h-4 w-4 mr-1.5" /> Collect Fee
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* Collect Fee / Edit Modal */}
      <Modal isOpen={showPaymentForm} onClose={closePaymentForm} title={editingId ? 'Edit Fee Record' : 'Collect Fee'} maxWidth="max-w-md">
        <div className="space-y-4">
          {collectTarget && (
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(collectTarget.studentName)} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}>
                {getInitials(collectTarget.studentName)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{collectTarget.studentName}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{collectTarget.admissionNo} &middot; {collectTarget.className}</p>
              </div>
              <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[collectTarget.status]}`}>{collectTarget.status}</span>
            </div>
          )}
          {editingId && (
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Updating fee record for selected student</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
              <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select value={paymentForm.method} onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Online">Online</option>
              </select>
            </div>
            {!editingId && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Received <span className="text-red-500">*</span></label>
                <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 5000" />
              </div>
            )}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
              <input type="number" value={paymentForm.discount} onChange={(e) => setPaymentForm((p) => ({ ...p, discount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 0" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fine</label>
              <input type="number" value={paymentForm.fine} onChange={(e) => setPaymentForm((p) => ({ ...p, fine: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 0" />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Optional remarks..." />
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="primary" onClick={handlePaymentSave}>{editingId ? 'Update Record' : 'Save Payment'}</Button>
            <Button variant="secondary" onClick={closePaymentForm}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentFees;
