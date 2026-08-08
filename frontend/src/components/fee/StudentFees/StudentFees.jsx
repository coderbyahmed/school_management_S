import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  UsersIcon, CurrencyDollarIcon, BanknotesIcon, ExclamationTriangleIcon,
  PlusIcon, FunnelIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import Modal from '../../common/Modal/Modal';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import SelectInput from '../../common/SelectInput/SelectInput';
import DateInput from '../../common/DateInput/DateInput';
import studentFeesService from '../../../services/studentFees/studentFees.service';
import { useCurrency } from '../../../hooks/useLocalization';

const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STATUS_FILTERS = ['All', 'Paid', 'Partial', 'Pending'];
const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];
const FEE_TYPES = ['Admission Fee', 'Monthly Fee', 'Examination Fee'];
const FEE_TYPE_FILTERS = ['All Fees', ...FEE_TYPES];

const getFeeTypeBase = (feeStructure, type) => {
  const fs = feeStructure || {};
  if (type === 'Admission Fee') return Number(fs.admissionFee || 0);
  if (type === 'Examination Fee') return Number(fs.examFee || 0);
  return Number(fs.monthlyFee || 0);
};

const feeTypeBadge = (type) => {
  const map = {
    'Admission Fee': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    'Monthly Fee': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    'Examination Fee': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  };
  return map[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
};

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
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
    Pending: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  return map[status] || map.Pending;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const collectFormEmpty = {
  studentId: '',
  discount: '',
  lateFine: '',
  paidAmount: '',
  paymentMethod: 'Cash',
  paymentDate: todayStr(),
  remarks: '',
};

const ITEMS_PER_PAGE = 10;

const StudentAvatar = ({ student, size = 'w-7 h-7', textSize = 'text-[8px]' }) => {
  if (student?.studentImage) {
    return (
      <img
        src={student.studentImage}
        alt={student.fullName || student.name || 'Student'}
        className={`${size} rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600`}
      />
    );
  }
  const name = student?.fullName || student?.name || '';
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white font-bold ${textSize} flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

const StudentFees = () => {
  const { formatCurrency } = useCurrency();
  const [collections, setCollections] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [stats, setStats] = useState({ totalCollections: 0, collectedToday: 0, outstandingAmount: 0, pendingCount: 0 });
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All Fees');
  const [currentPage, setCurrentPage] = useState(1);
  const [feeTypeOverrides, setFeeTypeOverrides] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ discount: '', lateFine: '', paidAmount: '', paymentMethod: 'Cash', paymentDate: todayStr(), remarks: '' });
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [collectModal, setCollectModal] = useState(null);
  const [collectSearchId, setCollectSearchId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [feeDetailsLoading, setFeeDetailsLoading] = useState(false);
  const [collectFeeType, setCollectFeeType] = useState('Monthly Fee');
  const [collectForm, setCollectForm] = useState({ ...collectFormEmpty });
  const [collectErrors, setCollectErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const searchTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(searchTimeoutRef.current), []);

  const fetchCollections = useCallback(async () => {
    const params = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (yearFilter !== 'All') params.academicYear = yearFilter;
    if (classFilter !== 'All') params.class = classFilter;
    if (statusFilter !== 'All') params.paymentStatus = statusFilter;
    if (search) params.search = search;
    return studentFeesService.getAll(params);
  }, [currentPage, yearFilter, classFilter, statusFilter, search]);

  useEffect(() => {
    let active = true;
    fetchCollections()
      .then((data) => {
        if (!active) return;
        setCollections(data.collections || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
        setStats(data.stats || { totalCollections: 0, collectedToday: 0, outstandingAmount: 0, pendingCount: 0 });
      })
      .catch(() => {
        if (!active) return;
        setCollections([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
        setStats({ totalCollections: 0, collectedToday: 0, outstandingAmount: 0, pendingCount: 0 });
      })
      .finally(() => {
        if (active) setFetchLoading(false);
      });
    return () => { active = false; };
  }, [fetchCollections, reload]);

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('All');
    setClassFilter('All');
    setStatusFilter('All');
    setFeeTypeFilter('All Fees');
    setCurrentPage(1);
  };

  const resolveFeeType = useCallback(
    (item) => item?.feeType || feeTypeOverrides[item?._id] || feeTypeOverrides[item?.receiptNumber] || 'Monthly Fee',
    [feeTypeOverrides]
  );

  const filteredCollections = useMemo(() => {
    if (feeTypeFilter === 'All Fees') return collections;
    return collections.filter((item) => resolveFeeType(item) === feeTypeFilter);
  }, [collections, feeTypeFilter, resolveFeeType]);

  const handleView = (item) => setViewItem(item);

  const openCollectModal = () => {
    setCollectModal('header');
    setCollectSearchId('');
    setSearchResults([]);
    setSelectedStudent(null);
    setFeeDetails(null);
    setCollectFeeType('Monthly Fee');
    setCollectForm({ ...collectFormEmpty });
    setCollectErrors({});
  };

  const handleCollectSearchChange = (val) => {
    setCollectSearchId(val);
    clearTimeout(searchTimeoutRef.current);

    const term = val.trim();
    if (term.length < 3) {
      setSearchResults([]);
      setSelectedStudent(null);
      setFeeDetails(null);
      setCollectForm((prev) => ({ ...prev, studentId: '' }));
      setCollectErrors((prev) => ({ ...prev, studentId: '' }));
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await studentFeesService.searchStudents(term);
        setSearchResults(data.students || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setCollectErrors((prev) => ({ ...prev, studentId: '' }));
    setFeeDetails(null);
    setFeeDetailsLoading(true);

    try {
      const data = await studentFeesService.loadStudentFeeDetails(student._id);
      setFeeDetails(data);
      const discount = Number(data.calculation?.discount || 0);
      const lateFine = collectFeeType === 'Admission Fee' ? 0 : Number(data.calculation?.lateFine || 0);
      const baseAmount = getFeeTypeBase(data.feeStructure, collectFeeType);
      setCollectForm((prev) => ({
        ...prev,
        studentId: student._id,
        discount: String(data.calculation?.discount || '0'),
        lateFine: String(data.calculation?.lateFine || '0'),
        paidAmount: String(Math.max(0, baseAmount + lateFine - discount)),
        paymentMethod: 'Cash',
        paymentDate: todayStr(),
        remarks: '',
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load fee details');
      setSelectedStudent(null);
      setFeeDetails(null);
    } finally {
      setFeeDetailsLoading(false);
    }
  };

  const handleCollectFeeTypeChange = (e) => {
    const type = e.target.value;
    setCollectFeeType(type);
    setCollectForm((prev) => {
      if (!feeDetails) return prev;
      const baseAmount = getFeeTypeBase(feeDetails.feeStructure, type);
      const discount = Number(prev.discount) || 0;
      const lateFine = type === 'Admission Fee' ? 0 : Number(prev.lateFine) || 0;
      return { ...prev, paidAmount: String(Math.max(0, baseAmount + lateFine - discount)) };
    });
  };

  const handleCollectFormChange = (e) => {
    const { name, value } = e.target;
    setCollectForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'discount' || name === 'lateFine') {
        if (feeDetails) {
          const baseAmount = getFeeTypeBase(feeDetails.feeStructure, collectFeeType);
          const discount = name === 'discount' ? Number(value) || 0 : Number(next.discount) || 0;
          const lateFine = name === 'lateFine' ? Number(value) || 0 : Number(next.lateFine) || 0;
          const effectiveLateFine = collectFeeType === 'Admission Fee' ? 0 : lateFine;
          next.paidAmount = String(Math.max(0, baseAmount + effectiveLateFine - discount));
        }
      }
      return next;
    });
    if (collectErrors[name]) setCollectErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const collectCalc = useMemo(() => {
    if (!feeDetails) return { baseAmount: 0, totalAmount: 0, remainingAmount: 0 };
    const baseAmount = getFeeTypeBase(feeDetails.feeStructure, collectFeeType);
    const discount = Number(collectForm.discount) || 0;
    const lateFine = collectFeeType === 'Admission Fee' ? 0 : Number(collectForm.lateFine) || 0;
    const totalAmount = Math.max(0, baseAmount + lateFine - discount);
    const paidAmount = Number(collectForm.paidAmount) || 0;
    return { baseAmount, totalAmount, remainingAmount: Math.max(0, totalAmount - paidAmount) };
  }, [feeDetails, collectFeeType, collectForm.discount, collectForm.lateFine, collectForm.paidAmount]);

  const validateCollectForm = () => {
    const errors = {};
    if (!selectedStudent || !feeDetails) errors.studentId = 'Please search and select a student';
    if (collectForm.paidAmount === '' || isNaN(collectForm.paidAmount) || Number(collectForm.paidAmount) < 0) errors.paidAmount = 'Enter a valid amount';
    if (Number(collectForm.paidAmount) > collectCalc.totalAmount) errors.paidAmount = 'Amount cannot exceed the total';
    if (!collectForm.paymentMethod) errors.paymentMethod = 'Select payment method';
    if (!collectForm.paymentDate) errors.paymentDate = 'Select payment date';
    setCollectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCollectFee = async () => {
    if (!validateCollectForm()) return;
    setSaving(true);
    try {
      const res = await studentFeesService.collectFee({
        studentId: collectForm.studentId,
        paidAmount: Number(collectForm.paidAmount),
        discount: Number(collectForm.discount || 0),
        lateFine: Number(collectForm.lateFine || 0),
        paymentMethod: collectForm.paymentMethod,
        paymentDate: collectForm.paymentDate,
        remarks: collectForm.remarks,
      });
      const created = res?.data?.collection;
      if (created?._id) {
        setFeeTypeOverrides((prev) => ({ ...prev, [created._id]: collectFeeType }));
      }
      toast.success('Fee collected successfully');
      setCollectModal(null);
      setCollectForm({ ...collectFormEmpty });
      setCollectFeeType('Monthly Fee');
      setCollectSearchId('');
      setSearchResults([]);
      setSelectedStudent(null);
      setFeeDetails(null);
      setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to collect fee');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditForm({
      discount: String(item.discount || ''),
      lateFine: String(item.lateFine || ''),
      paidAmount: String(item.paidAmount || ''),
      paymentMethod: item.paymentMethod || 'Cash',
      paymentDate: item.paymentDate ? String(item.paymentDate).slice(0, 10) : todayStr(),
      remarks: item.remarks || '',
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: '' }));
  };

const editCalc = useMemo(() => {
    if (!editItem) return { baseAmount: 0, totalAmount: 0, remainingAmount: 0 };
    const feeType = resolveFeeType(editItem);
    const baseAmount = getFeeTypeBase(editItem, feeType);
    const discount = Number(editForm.discount) || 0;
    const lateFine = feeType === 'Admission Fee' ? 0 : Number(editForm.lateFine) || 0;
    const totalAmount = Math.max(0, baseAmount + lateFine - discount);
    const paidAmount = Number(editForm.paidAmount) || 0;
    return { baseAmount, totalAmount, remainingAmount: Math.max(0, totalAmount - paidAmount) };
  }, [editItem, resolveFeeType, editForm.discount, editForm.lateFine, editForm.paidAmount]);

  const validateEditForm = () => {
    const errors = {};
    if (editForm.discount && (isNaN(editForm.discount) || Number(editForm.discount) < 0)) errors.discount = 'Must be positive';
    if (editForm.lateFine && (isNaN(editForm.lateFine) || Number(editForm.lateFine) < 0)) errors.lateFine = 'Must be positive';
    if (editForm.paidAmount === '' || isNaN(editForm.paidAmount) || Number(editForm.paidAmount) < 0) errors.paidAmount = 'Enter a valid amount';
    if (Number(editForm.paidAmount) > editCalc.totalAmount) errors.paidAmount = 'Amount cannot exceed the total';
    if (!editForm.paymentMethod) errors.paymentMethod = 'Select payment method';
    if (!editForm.paymentDate) errors.paymentDate = 'Select payment date';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editItem) return;
    setEditSaving(true);
    try {
      await studentFeesService.update(editItem._id, {
        discount: Number(editForm.discount || 0),
        lateFine: Number(editForm.lateFine || 0),
        paidAmount: Number(editForm.paidAmount || 0),
        paymentMethod: editForm.paymentMethod,
        paymentDate: editForm.paymentDate,
        remarks: editForm.remarks,
      });
      toast.success('Fee collection updated successfully');
      setEditItem(null);
      setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fee collection');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = (item) => setDeleteItem(item);

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      await studentFeesService.delete(deleteItem._id);
      toast.success('Fee collection deleted successfully');
      setDeleteItem(null);
      setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete fee collection');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderViewModal = () => {
    if (!viewItem) return null;
    const student = viewItem.studentId || {};
    return (
      <Modal isOpen title="Fee Collection Details" onClose={() => setViewItem(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <StudentAvatar student={student} size="w-10 h-10" textSize="text-xs" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{student.fullName || '-'}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{student.studentId || '-'} · {student.admissionNumber || '-'}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBadge(viewItem.paymentStatus)}`}>{viewItem.paymentStatus}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${feeTypeBadge(resolveFeeType(viewItem))}`}>{resolveFeeType(viewItem)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt No</p>
              <p className="text-xs font-semibold font-mono text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.receiptNumber}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(viewItem.paymentDate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.class}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Year</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.academicYear}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.paymentMethod}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.totalAmount)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Amount</p>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">{formatCurrency(viewItem.paidAmount)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</p>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5">{formatCurrency(viewItem.remainingAmount)}</p>
            </div>
          </div>
          {viewItem.remarks && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{viewItem.remarks}</p>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const renderCollectModal = () => {
    if (!collectModal) return null;
    const title = selectedStudent ? `Collect Fee - ${selectedStudent.fullName}` : 'Collect Fee';
    return (
      <Modal isOpen title={title} onClose={() => setCollectModal(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          {!selectedStudent && (
            <div>
              <Input
                label="Student ID / Name"
                name="collectSearchId"
                type="text"
                value={collectSearchId}
                onChange={(e) => handleCollectSearchChange(e.target.value)}
                placeholder="Search by Student ID, name or admission no"
                icon={MagnifyingGlassIcon}
                required
              />
              {searching && (
                <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Searching...
                </p>
              )}
              {!searching && searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelectStudent(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                    >
                      <StudentAvatar student={s} size="w-8 h-8" textSize="text-[9px]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{s.fullName}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{s.studentId} · {s.class}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono flex-shrink-0">{s.admissionNumber}</span>
                    </button>
                  ))}
                </div>
              )}
              {!searching && collectSearchId.trim().length >= 3 && searchResults.length === 0 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">No student found with this ID</p>
              )}
            </div>
          )}

          <div className="w-full sm:w-64">
            <SelectInput label="Fee Type" name="collectFeeType" value={collectFeeType} onChange={handleCollectFeeTypeChange} options={FEE_TYPES} required />
          </div>

          {selectedStudent && (
            <>
              {feeDetailsLoading || !feeDetails ? (
                <div className="py-10 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading fee structure...</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 flex items-center gap-2.5">
                    <StudentAvatar student={feeDetails.student} size="w-9 h-9" textSize="text-[10px]" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{feeDetails.student.fullName}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{feeDetails.student.studentId} · {feeDetails.student.class} · {feeDetails.student.academicYear}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {collectFeeType === 'Admission Fee' ? 'Default Admission Fee' : collectFeeType === 'Examination Fee' ? 'Default Examination Fee' : 'Default Monthly Fee'}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(collectCalc.baseAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(Number(collectForm.discount) || 0)}</span>
                    </div>
                    {collectFeeType !== 'Admission Fee' && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Late Fine</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(Number(collectForm.lateFine) || 0)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-1.5 flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">Total Payable</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(collectCalc.totalAmount)}</span>
                    </div>
                  </div>

                  {collectFeeType === 'Admission Fee' ? (
                    <Input label="Discount" name="discount" type="number" value={collectForm.discount} onChange={handleCollectFormChange} error={collectErrors.discount} />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-3">
                      <Input label="Discount" name="discount" type="number" value={collectForm.discount} onChange={handleCollectFormChange} error={collectErrors.discount} />
                      <Input label="Late Fine" name="lateFine" type="number" value={collectForm.lateFine} onChange={handleCollectFormChange} error={collectErrors.lateFine} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-3">
                    <Input label="Amount Receiving" name="paidAmount" type="number" value={collectForm.paidAmount} onChange={handleCollectFormChange} required error={collectErrors.paidAmount} />
                    <SelectInput label="Payment Method" name="paymentMethod" value={collectForm.paymentMethod} onChange={handleCollectFormChange} options={PAYMENT_METHODS} required />
                  </div>

                  <DateInput label="Payment Date" name="paymentDate" value={collectForm.paymentDate} onChange={handleCollectFormChange} required />

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
            </>
          )}
        </div>
      </Modal>
    );
  };

  const renderEditModal = () => {
    if (!editItem) return null;
    const student = editItem.studentId || {};
    const feeType = resolveFeeType(editItem);
    return (
      <Modal isOpen title={`Edit Fee Collection - ${student.fullName || ''}`} onClose={() => setEditItem(null)} maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5 flex items-center gap-2.5">
            <StudentAvatar student={student} size="w-8 h-8" textSize="text-[9px]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{student.fullName || '-'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{editItem.receiptNumber} · {editItem.class}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBadge(editItem.paymentStatus)}`}>{editItem.paymentStatus}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${feeTypeBadge(feeType)}`}>{feeType}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {feeType === 'Admission Fee' ? 'Default Admission Fee' : feeType === 'Examination Fee' ? 'Default Examination Fee' : 'Default Monthly Fee'}
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(editCalc.baseAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Discount</span>
              <span className="font-medium text-green-600 dark:text-green-400">- {formatCurrency(Number(editForm.discount) || 0)}</span>
            </div>
            {feeType !== 'Admission Fee' && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Late Fine</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">+ {formatCurrency(Number(editForm.lateFine) || 0)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-1.5 flex justify-between text-xs font-semibold">
              <span className="text-gray-700 dark:text-gray-300">Total Payable</span>
              <span className="text-gray-900 dark:text-white">{formatCurrency(editCalc.totalAmount)}</span>
            </div>
          </div>

          {feeType === 'Admission Fee' ? (
            <Input label="Discount" name="discount" type="number" value={editForm.discount} onChange={handleEditFormChange} error={editErrors.discount} />
          ) : (
            <div className="grid grid-cols-2 gap-x-3">
              <Input label="Discount" name="discount" type="number" value={editForm.discount} onChange={handleEditFormChange} error={editErrors.discount} />
              <Input label="Late Fine" name="lateFine" type="number" value={editForm.lateFine} onChange={handleEditFormChange} error={editErrors.lateFine} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3">
            <Input label="Paid Amount" name="paidAmount" type="number" value={editForm.paidAmount} onChange={handleEditFormChange} required error={editErrors.paidAmount} />
            <SelectInput label="Payment Method" name="paymentMethod" value={editForm.paymentMethod} onChange={handleEditFormChange} options={PAYMENT_METHODS} required />
          </div>

          <DateInput label="Payment Date" name="paymentDate" value={editForm.paymentDate} onChange={handleEditFormChange} required />

          <Input label="Remarks" name="remarks" type="text" value={editForm.remarks} onChange={handleEditFormChange} placeholder="Optional remarks..." />

          <div className="flex gap-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
            </div>
            <div className="flex-1">
              <Button variant="primary" onClick={handleEditSave} loading={editSaving}>Save Changes</Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">

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
        <button onClick={openCollectModal}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer">
          <PlusIcon className="h-4 w-4" /> Collect Fee
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Collections" value={stats.totalCollections} color="blue" />
        <StatCard icon={CurrencyDollarIcon} label="Collected Today" value={formatCurrency(stats.collectedToday)} color="green" />
        <StatCard icon={BanknotesIcon} label="Outstanding Amount" value={formatCurrency(stats.outstandingAmount)} color="yellow" />
        <StatCard icon={ExclamationTriangleIcon} label="Pending Payments" value={stats.pendingCount} color="red" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <FilterDropdown label="Year" options={['All', ...SESSIONS]} value={yearFilter} onChange={(v) => { setYearFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={classFilter} onChange={(v) => { setClassFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-24">
            <FilterDropdown label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Fee Type" options={FEE_TYPE_FILTERS} value={feeTypeFilter} onChange={(v) => { setFeeTypeFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-56">
            <SearchInput placeholder="Search name, receipt or ID..." value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <CardSection title={`Fee Collections (${pagination.totalItems})`}>
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt No</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Fee Type</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">{feeTypeFilter === 'Admission Fee' ? 'A Fee' : feeTypeFilter === 'Examination Fee' ? 'E Fee' : 'M Fee'}</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Disc.</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Rem.</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Last Pay</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fetchLoading ? (
                <tr>
                  <td colSpan={11} className="px-2 py-10 text-center">
                    <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-2 py-8 text-center text-gray-400 dark:text-gray-500">No fee collections found</td>
                </tr>
              ) : (
                filteredCollections.map((item) => {
                  const student = item.studentId || {};
  return (
                    <tr key={item._id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-1.5 py-2">
                        <div className="flex items-center gap-2">
                          <StudentAvatar student={student} />
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{student.fullName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.receiptNumber}</td>
                      <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.class}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${feeTypeBadge(resolveFeeType(item))}`}>{resolveFeeType(item)}</span>
                      </td>
                      <td className="px-1.5 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(feeTypeFilter === 'Admission Fee' ? item.admissionFee : feeTypeFilter === 'Examination Fee' ? item.examFee : item.monthlyFee)}</td>
                      <td className="px-1.5 py-2 text-[11px] text-green-600 dark:text-green-400 whitespace-nowrap">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                      <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{item.paidAmount > 0 ? formatCurrency(item.paidAmount) : '-'}</td>
                      <td className="px-1.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 whitespace-nowrap">{item.remainingAmount > 0 ? formatCurrency(item.remainingAmount) : '-'}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${statusBadge(item.paymentStatus)}`}>{item.paymentStatus}</span>
                      </td>
                      <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(item.paymentDate)}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleView(item)}
                            className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer" title="View">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </CardSection>

      {renderViewModal()}
      {renderCollectModal()}
      {renderEditModal()}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Fee Collection"
        message={`Are you sure you want to delete the ${deleteItem ? resolveFeeType(deleteItem) : ''} record ${deleteItem?.receiptNumber} for ${deleteItem?.studentId?.fullName || 'this student'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentFees;
