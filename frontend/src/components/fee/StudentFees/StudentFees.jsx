import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon, CurrencyDollarIcon, BanknotesIcon, ExclamationTriangleIcon,
  PlusIcon, FunnelIcon, PrinterIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import CardSection from '../../common/CardSection';
import SearchInput from '../../common/SearchInput';
import FilterDropdown from '../../common/FilterDropdown';
import Modal from '../../common/Modal';
import ConfirmationModal from '../../common/ConfirmationModal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import SelectInput from '../../common/SelectInput';
import DateInput from '../../common/DateInput';
import studentFeesService from '../../../services/studentFees.service';

const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STATUS_FILTERS = ['All', 'Paid', 'Partial', 'Due'];
const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];

const formatCurrency = (val) => {
  const n = Number(val);
  if (isNaN(n)) return 'Rs. 0';
  if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return 'Rs. ' + (n / 1000).toFixed(0) + 'K';
  return 'Rs. ' + n.toLocaleString();
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return 'from-gray-500 to-gray-700';
  const colors = [
    'from-blue-500 to-blue-700', 'from-green-500 to-green-700', 'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700', 'from-indigo-500 to-indigo-700', 'from-teal-500 to-teal-700',
    'from-orange-500 to-orange-700', 'from-cyan-500 to-cyan-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const statusBadge = (status) => {
  const map = {
    Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    Partial: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    Due: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  return map[status] || map.Due;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const collectFormEmpty = {
  studentId: '',
  month: MONTHS[new Date().getMonth()],
  discount: '',
  lateFine: '',
  amount: '',
  date: todayStr(),
  paymentMethod: 'Cash',
  remarks: '',
};

const StudentFees = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('2025');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [collectModal, setCollectModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [collectForm, setCollectForm] = useState({ ...collectFormEmpty });
  const [editForm, setEditForm] = useState({ monthlyFee: '', discount: '', lateFine: '', status: 'Paid' });
  const [collectErrors, setCollectErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    try {
      const data = studentFeesService.getAll();
      setStudents(data || []);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.admissionNo.toLowerCase().includes(search.toLowerCase());
      const matchYear = yearFilter === 'All' || s.academicYear === yearFilter;
      const matchClass = classFilter === 'All' || s.class === classFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchSearch && matchYear && matchClass && matchStatus;
    });
  }, [students, search, yearFilter, classFilter, statusFilter]);

  const stats = useMemo(() => {
    try {
      return studentFeesService.getStats();
    } catch {
      return { totalStudents: 0, collectedToday: 0, outstandingAmount: 0, pendingStudents: 0 };
    }
  }, [students]);

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('2025');
    setClassFilter('All');
    setStatusFilter('All');
  };

  const handleView = (item) => setViewItem(item);

  const openCollectModal = (student) => {
    const m = new Date().getMonth();
    setCollectForm({
      studentId: student ? student.id : '',
      month: MONTHS[m],
      discount: student ? String(student.discount || 0) : '0',
      lateFine: student ? String(student.lateFine || 0) : '0',
      amount: '',
      date: todayStr(),
      paymentMethod: 'Cash',
      remarks: '',
    });
    setCollectErrors({});
    setCollectModal(student ? 'row' : 'header');
  };

  const handleCollectFormChange = (e) => {
    const { name, value } = e.target;
    setCollectForm((prev) => ({ ...prev, [name]: value }));
    if (collectErrors[name]) setCollectErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const selectedStudent = useMemo(() => {
    if (!collectForm.studentId) return null;
    return students.find((s) => s.id === collectForm.studentId) || null;
  }, [collectForm.studentId, students]);

  const totalPayable = useMemo(() => {
    if (!selectedStudent) return 0;
    const fee = Number(selectedStudent.monthlyFee || 0);
    const disc = Number(collectForm.discount || 0);
    const fine = Number(collectForm.lateFine || 0);
    const prevDue = Number(selectedStudent.remaining || 0);
    return Math.max(0, fee - disc + fine + prevDue);
  }, [selectedStudent, collectForm.discount, collectForm.lateFine]);

  useEffect(() => {
    if (collectForm.studentId) {
      setCollectForm((prev) => ({ ...prev, amount: String(totalPayable) }));
    }
  }, [totalPayable, collectForm.studentId]);

  const validateCollectForm = () => {
    const errors = {};
    if (!collectForm.studentId) errors.studentId = 'Please select a student';
    if (!collectForm.amount || isNaN(collectForm.amount) || Number(collectForm.amount) <= 0) errors.amount = 'Enter a valid amount';
    if (!collectForm.paymentMethod) errors.paymentMethod = 'Select payment method';
    if (!collectForm.date) errors.date = 'Select payment date';
    setCollectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCollectFee = async () => {
    if (!validateCollectForm()) return;
    setSaving(true);
    try {
      const result = studentFeesService.collectFee(collectForm.studentId, {
        month: collectForm.month,
        amount: collectForm.amount,
        discount: collectForm.discount || 0,
        lateFine: collectForm.lateFine || 0,
        date: collectForm.date,
        paymentMethod: collectForm.paymentMethod,
        remarks: collectForm.remarks,
      });
      if (result) {
        toast.success('Fee collected successfully');
        setCollectForm({ ...collectFormEmpty });
        setCollectModal(null);
        loadData();
        setReceiptData({ ...result.student, receiptNo: result.receiptNo, collectionDate: collectForm.date, collectedAmount: collectForm.amount, paymentMethod: collectForm.paymentMethod });
      } else {
        toast.error('Failed to collect fee');
      }
    } catch {
      toast.error('Failed to collect fee');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditForm({
      monthlyFee: String(item.monthlyFee || ''),
      discount: String(item.discount || ''),
      lateFine: String(item.lateFine || ''),
      status: item.status || 'Paid',
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.monthlyFee || isNaN(editForm.monthlyFee) || Number(editForm.monthlyFee) < 0) errors.monthlyFee = 'Valid monthly fee required';
    if (editForm.discount && (isNaN(editForm.discount) || Number(editForm.discount) < 0)) errors.discount = 'Must be positive';
    if (editForm.lateFine && (isNaN(editForm.lateFine) || Number(editForm.lateFine) < 0)) errors.lateFine = 'Must be positive';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editItem) return;
    setSaving(true);
    try {
      studentFeesService.update(editItem.id, {
        monthlyFee: Number(editForm.monthlyFee),
        discount: Number(editForm.discount || 0),
        lateFine: Number(editForm.lateFine || 0),
        status: editForm.status,
      });
      toast.success('Fee details updated successfully');
      setEditItem(null);
      loadData();
    } catch {
      toast.error('Failed to update fee details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => setDeleteItem(item);

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      studentFeesService.update(deleteItem.id, { status: 'Due', monthlyFee: 0, discount: 0, lateFine: 0 });
      toast.success('Student fee record removed');
      setDeleteItem(null);
      loadData();
    } catch {
      toast.error('Failed to remove record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewHistory = (student) => setHistoryModal(student);
  const handlePrintReceipt = (student) => setReceiptData(student);

  const closeReceipt = () => setReceiptData(null);

  const handlePrint = () => {
    window.print();
  };

  const renderViewModal = () => {
    if (!viewItem) return null;
    return (
      <Modal isOpen title="Student Fee Profile" onClose={() => setViewItem(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(viewItem.name)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
              {getInitials(viewItem.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{viewItem.name}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{viewItem.admissionNo}</p>
            </div>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border flex-shrink-0 ${statusBadge(viewItem.status)}`}>{viewItem.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.class}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guardian</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.guardianName}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Fee</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.monthlyFee)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Discount</p>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-0.5">{formatCurrency(viewItem.discount)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Late Fine</p>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-0.5">{formatCurrency(viewItem.lateFine)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Due</p>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">{formatCurrency(viewItem.remaining)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Amount</p>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">{formatCurrency(viewItem.paid)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</p>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">{formatCurrency(viewItem.remaining)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Payment</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{viewItem.lastPaymentDate || '-'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border mt-0.5 ${statusBadge(viewItem.status)}`}>{viewItem.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Button variant="secondary" onClick={() => { setViewItem(null); handleViewHistory(viewItem); }}>
                <ClockIcon className="h-3.5 w-3.5 mr-1 inline" /> Fee History
              </Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={() => { setViewItem(null); handlePrintReceipt(viewItem); }}>
                <PrinterIcon className="h-3.5 w-3.5 mr-1 inline" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderCollectModal = () => {
    if (!collectModal) return null;
    const title = collectModal === 'row' && selectedStudent ? `Collect Fee - ${selectedStudent.name}` : 'Collect Fee';
    return (
      <Modal isOpen title={title} onClose={() => setCollectModal(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          {collectModal === 'header' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Student <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="studentId"
                  value={collectForm.studentId}
                  onChange={handleCollectFormChange}
                  className="appearance-none w-full px-3 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="" disabled>Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.admissionNo})</option>
                  ))}
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              {collectErrors.studentId && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{collectErrors.studentId}</p>}
            </div>
          )}
          {selectedStudent && (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(selectedStudent.name)} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>
                  {getInitials(selectedStudent.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{selectedStudent.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{selectedStudent.admissionNo} - {selectedStudent.class}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3">
                <SelectInput label="Month" name="month" value={collectForm.month} onChange={handleCollectFormChange} options={MONTHS} />
                <DateInput label="Payment Date" name="date" value={collectForm.date} onChange={handleCollectFormChange} required />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Monthly Fee</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(selectedStudent.monthlyFee)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Discount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(Number(collectForm.discount) || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Late Fine</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(Number(collectForm.lateFine) || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Previous Due</span>
                  <span className="font-medium text-red-600 dark:text-red-400">+ {formatCurrency(selectedStudent.remaining || 0)}</span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">Total Payable</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(totalPayable)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3">
                <Input label="Amount Receiving" name="amount" type="number" value={collectForm.amount} onChange={handleCollectFormChange} required error={collectErrors.amount} />
                <SelectInput label="Payment Method" name="paymentMethod" value={collectForm.paymentMethod} onChange={handleCollectFormChange} options={PAYMENT_METHODS} required />
              </div>

              <Input label="Remarks" name="remarks" type="text" value={collectForm.remarks} onChange={handleCollectFormChange} placeholder="Optional remarks..." />

              <div className="flex gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <Button variant="secondary" onClick={() => setCollectModal(null)}>Cancel</Button>
                </div>
                <div className="flex-1">
                  <Button variant="primary" onClick={handleCollectFee} loading={saving}>Collect Fee</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    );
  };

  const renderEditModal = () => {
    if (!editItem) return null;
    return (
      <Modal isOpen title={`Edit Fee - ${editItem.name}`} onClose={() => setEditItem(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(editItem.name)} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>
              {getInitials(editItem.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{editItem.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{editItem.admissionNo} - {editItem.class}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <Input label="Monthly Fee" name="monthlyFee" type="number" value={editForm.monthlyFee} onChange={handleEditFormChange} required error={editErrors.monthlyFee} />
            <Input label="Discount" name="discount" type="number" value={editForm.discount} onChange={handleEditFormChange} error={editErrors.discount} />
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <Input label="Late Fine" name="lateFine" type="number" value={editForm.lateFine} onChange={handleEditFormChange} error={editErrors.lateFine} />
            <SelectInput label="Status" name="status" value={editForm.status} onChange={handleEditFormChange} options={['Paid', 'Partial', 'Due']} />
          </div>

          <div className="flex gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handleEditSave} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const renderHistoryModal = () => {
    if (!historyModal) return null;
    const history = (historyModal.paymentHistory || []).sort((a, b) => b.date.localeCompare(a.date));
    return (
      <Modal isOpen title={`Payment History - ${historyModal.name}`} onClose={() => setHistoryModal(null)} maxWidth="max-w-2xl">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(historyModal.name)} flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0`}>
              {getInitials(historyModal.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{historyModal.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{historyModal.admissionNo} - {historyModal.class}</p>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No payment history available</p>
          ) : (
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Month</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Disc.</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Fine</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Method</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((h) => (
                    <tr key={h.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-1.5 py-1.5 text-[11px] font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{h.month}</td>
                      <td className="px-1.5 py-1.5 text-[11px] text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(h.paidAmount)}</td>
                      <td className="px-1.5 py-1.5 text-[10px] text-green-600 dark:text-green-400 whitespace-nowrap">{h.discount ? formatCurrency(h.discount) : '-'}</td>
                      <td className="px-1.5 py-1.5 text-[10px] text-orange-600 dark:text-orange-400 whitespace-nowrap">{h.lateFine ? formatCurrency(h.lateFine) : '-'}</td>
                      <td className="px-1.5 py-1.5 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{h.date}</td>
                      <td className="px-1.5 py-1.5 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{h.paymentMethod}</td>
                      <td className="px-1.5 py-1.5 text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-mono">{h.receiptNo}</td>
                      <td className="px-1.5 py-1.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium border ${statusBadge(h.status)}`}>{h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div>
            <Button variant="secondary" onClick={() => setHistoryModal(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderReceiptModal = () => {
    if (!receiptData) return null;
    return (
      <Modal isOpen title="Fee Receipt" onClose={closeReceipt} maxWidth="max-w-md">
        <div id="receipt-content" className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="text-center border-b border-gray-300 dark:border-gray-600 pb-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-1.5">
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">S</span>
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">School Management System</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Fee Receipt</p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Receipt No</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.receiptNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.collectionDate || todayStr()}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Student Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.name}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Admission No</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.admissionNo}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Class</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.class}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">Payment Method</p>
              <p className="font-medium text-gray-900 dark:text-white">{receiptData.paymentMethod || '-'}</p>
            </div>
          </div>

          <table className="w-full text-xs border-t border-b border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <th className="px-2 py-1.5 text-left text-[9px] uppercase text-gray-500 dark:text-gray-400 font-semibold">Description</th>
                <th className="px-2 py-1.5 text-right text-[9px] uppercase text-gray-500 dark:text-gray-400 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-1.5 text-[11px] text-gray-700 dark:text-gray-300">Monthly Fee ({receiptData.collectionDate ? new Date(receiptData.collectionDate).toLocaleString('default', { month: 'long' }) : ''})</td>
                <td className="px-2 py-1.5 text-[11px] text-right font-medium text-gray-900 dark:text-white">{formatCurrency(receiptData.monthlyFee || 0)}</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 text-[11px] text-gray-700 dark:text-gray-300">Discount</td>
                <td className="px-2 py-1.5 text-[11px] text-right font-medium text-green-600 dark:text-green-400">- {formatCurrency(receiptData.discount || 0)}</td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 text-[11px] text-gray-700 dark:text-gray-300">Late Fine</td>
                <td className="px-2 py-1.5 text-[11px] text-right font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(receiptData.lateFine || 0)}</td>
              </tr>
              <tr className="border-t border-gray-300 dark:border-gray-600">
                <td className="px-2 py-1.5 text-[11px] font-bold text-gray-900 dark:text-white">Total Paid</td>
                <td className="px-2 py-1.5 text-[11px] text-right font-bold text-gray-900 dark:text-white">{formatCurrency(receiptData.collectedAmount || receiptData.paid || 0)}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center pt-3">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Authorized Signature</p>
            <div className="mt-6 border-t border-gray-300 dark:border-gray-600 w-36 mx-auto pt-1"></div>
          </div>

          <div className="flex gap-2 pt-1">
            <div className="flex-1">
              <Button variant="secondary" onClick={closeReceipt}>Close</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handlePrint}>
                <PrinterIcon className="h-3.5 w-3.5 mr-1 inline" /> Print
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <style>{`@media print { body * { visibility: hidden; } #receipt-content, #receipt-content * { visibility: visible; } #receipt-content { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>

      <nav className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Dashboard</span>
        <span>/</span>
        <span className="text-gray-500 dark:text-gray-400">Fee Management</span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Student Fees</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Fees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage student fee collection and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => openCollectModal(null)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Collect Fee
          </button>
          <button onClick={() => {
            if (students.length > 0) handlePrintReceipt(students[0]);
            else toast.error('No students available');
          }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <PrinterIcon className="h-4 w-4" /> Generate Receipt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={CurrencyDollarIcon} label="Collected Today" value={formatCurrency(stats.collectedToday)} color="green" />
        <StatCard icon={BanknotesIcon} label="Outstanding Amount" value={formatCurrency(stats.outstandingAmount)} color="yellow" />
        <StatCard icon={ExclamationTriangleIcon} label="Pending Students" value={stats.pendingStudents} color="red" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <FilterDropdown label="Year" options={['All', ...SESSIONS]} value={yearFilter} onChange={setYearFilter} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={classFilter} onChange={setClassFilter} />
          </div>
          <div className="w-24">
            <FilterDropdown label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div className="w-full sm:w-56">
            <SearchInput placeholder="Search name or admission no..." value={search} onChange={setSearch} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <CardSection title={`Students (${filtered.length})`}>
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Adm. No</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">M. Fee</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Disc.</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Rem.</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Last Pay</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-2 py-8 text-center text-gray-400 dark:text-gray-500">No students found</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-1.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(item.name)} flex items-center justify-center text-white font-bold text-[8px] flex-shrink-0`}>
                          {getInitials(item.name)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-1.5 py-2 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.admissionNo}</td>
                    <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.class}</td>
                    <td className="px-1.5 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(item.monthlyFee)}</td>
                    <td className="px-1.5 py-2 text-[11px] text-green-600 dark:text-green-400 whitespace-nowrap">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                    <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{item.paid > 0 ? formatCurrency(item.paid) : '-'}</td>
                    <td className="px-1.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">{item.remaining > 0 ? formatCurrency(item.remaining) : '-'}</td>
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBadge(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.lastPaymentDate}</td>
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleView(item)}
                          className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer" title="View">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => openCollectModal(item)}
                          className="p-1 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors cursor-pointer" title="Collect Fee">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                        <button onClick={() => handleEdit(item)}
                          className="p-1 rounded text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer" title="Edit">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(item)}
                          className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer" title="Delete">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardSection>

      {renderViewModal()}
      {renderCollectModal()}
      {renderEditModal()}
      {renderHistoryModal()}
      {renderReceiptModal()}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Remove Student Fee Record"
        message={`Are you sure you want to remove the fee record for ${deleteItem?.name} (${deleteItem?.admissionNo})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentFees;
