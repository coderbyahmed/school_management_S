import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon, XMarkIcon,
  ArrowPathIcon, BanknotesIcon, AcademicCapIcon, CheckBadgeIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import FilterDropdown from '../../common/FilterDropdown';
import Modal from '../../common/Modal';
import ConfirmationModal from '../../common/ConfirmationModal';
import Button from '../../common/Button';
import feeService from '../../../services/fee.service';

const statusStyles = {
  Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
};

const initialForm = {
  session: '2026',
  className: '',
  monthlyTuition: '',
  admissionFee: '',
  examFee: '',
  otherCharges: '',
  discount: '',
  lateFinePerDay: '',
  status: 'Active',
  notes: '',
};

const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [sessionFilter, setSessionFilter] = useState('2025');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadData = () => {
    const filters = {};
    if (sessionFilter) filters.session = sessionFilter;
    if (classFilter) filters.className = classFilter;
    if (statusFilter) filters.status = statusFilter;
    setStructures(feeService.getFeeStructures(filters));
  };

  useEffect(() => { loadData(); }, [sessionFilter, classFilter, statusFilter]);

  const stats = useMemo(() => feeService.getStats(), []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      session: item.session,
      className: item.className,
      monthlyTuition: item.monthlyTuition,
      admissionFee: item.admissionFee,
      examFee: item.examFee,
      otherCharges: item.otherCharges,
      discount: item.discount,
      lateFinePerDay: item.lateFinePerDay,
      status: item.status,
      notes: item.notes,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...initialForm });
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.className || !form.monthlyTuition || !form.admissionFee) {
      toast.error('Please fill required fields (Class, Monthly Fee, Admission Fee)');
      return;
    }
    const total = (Number(form.monthlyTuition) || 0) + (Number(form.examFee) || 0) + (Number(form.otherCharges) || 0);

    if (editingId) {
      feeService.updateFeeStructure(editingId, { ...form, totalMonthly: total });
      toast.success('Fee structure updated successfully');
    } else {
      feeService.addFeeStructure({ ...form, totalMonthly: total, discount: form.discount || 0 });
      toast.success('Fee structure added successfully');
    }
    closeForm();
    loadData();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    feeService.deleteFeeStructure(deleteId);
    setDeleteId(null);
    toast.success('Fee structure deleted');
    loadData();
  };

  const formatCurrency = (val) => {
    const n = Number(val);
    if (isNaN(n)) return 'Rs. 0';
    if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return 'Rs. ' + (n / 1000).toFixed(0) + 'K';
    return 'Rs. ' + n.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structure</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage class-wise fee structures and payment configuration</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-32">
            <FilterDropdown label="" options={feeService.SESSIONS} value={sessionFilter} onChange={setSessionFilter} />
          </div>
          <button onClick={openAddForm}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> Add Fee Structure
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={BanknotesIcon} label="Total Fee Structures" value={stats.total} color="blue" />
        <StatCard icon={CheckBadgeIcon} label="Active Structures" value={stats.active} color="green" />
        <StatCard icon={AcademicCapIcon} label="Classes Assigned" value={stats.classesAssigned} color="purple" />
        <StatCard icon={CurrencyDollarIcon} label="Average Monthly Fee" value={formatCurrency(stats.averageMonthly)} color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-44">
            <FilterDropdown label="Class" options={['All Classes', ...feeService.CLASSES]} value={classFilter || 'All Classes'} onChange={(v) => setClassFilter(v === 'All Classes' ? '' : v)} />
          </div>
          <div className="w-36">
            <FilterDropdown label="Status" options={['All Status', 'Active', 'Inactive']} value={statusFilter || 'All Status'} onChange={(v) => setStatusFilter(v === 'All Status' ? '' : v)} />
          </div>
          <button onClick={() => { setClassFilter(''); setStatusFilter(''); setSessionFilter('2025'); }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <ArrowPathIcon className="h-4 w-4" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              {['Class', 'Monthly Fee', 'Admission Fee', 'Exam Fee', 'Other Charges', 'Discount', 'Late Fine', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {structures.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No fee structures found</td>
              </tr>
            ) : (
              structures.map((item) => (
                <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.className}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.monthlyTuition)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.admissionFee)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.examFee)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.otherCharges)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.discount)}</td>
                  <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.lateFinePerDay)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewItem(item)} className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditForm(item)} className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer" title="Edit">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {structures.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
            {structures.length} fee structure{structures.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editingId ? 'Edit Fee Structure' : 'Add Fee Structure'} maxWidth="max-w-xl">
        <div className="flex flex-col max-h-[75vh]">
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Session <span className="text-red-500">*</span></label>
                  <select value={form.session} onChange={(e) => updateField('session', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    {feeService.SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class <span className="text-red-500">*</span></label>
                  <select value={form.className} onChange={(e) => updateField('className', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    <option value="">Select Class</option>
                    {feeService.CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Fee <span className="text-red-500">*</span></label>
                  <input type="number" value={form.monthlyTuition} onChange={(e) => updateField('monthlyTuition', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 5000" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Fee <span className="text-red-500">*</span></label>
                  <input type="number" value={form.admissionFee} onChange={(e) => updateField('admissionFee', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 5000" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Fee</label>
                  <input type="number" value={form.examFee} onChange={(e) => updateField('examFee', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 2000" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Other Charges</label>
                  <input type="number" value={form.otherCharges} onChange={(e) => updateField('otherCharges', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 1000" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
                  <input type="number" value={form.discount} onChange={(e) => updateField('discount', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 0" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Late Fine Per Day</label>
                  <input type="number" value={form.lateFinePerDay} onChange={(e) => updateField('lateFinePerDay', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="e.g. 50" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Optional notes..." />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Button variant="primary" onClick={handleSave}>{editingId ? 'Update Structure' : 'Save Structure'}</Button>
            <Button variant="secondary" onClick={closeForm}>Cancel</Button>
            <Button variant="outline" onClick={() => setForm({ ...initialForm })}>Reset</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {viewItem && (
        <Modal isOpen={true} onClose={() => setViewItem(null)} title="Fee Structure Details" maxWidth="max-w-md">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{viewItem.className}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[viewItem.status]}`}>
                  {viewItem.status}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Fee Breakdown</p>
              <Row label="Monthly Fee" value={formatCurrency(viewItem.monthlyTuition)} />
              <Row label="Admission Fee" value={formatCurrency(viewItem.admissionFee)} />
              <Row label="Exam Fee" value={formatCurrency(viewItem.examFee)} />
              <Row label="Other Charges" value={formatCurrency(viewItem.otherCharges)} />
              <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5 mt-1.5">
                <Row label="Total Monthly Fee" value={<span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(viewItem.totalMonthly)}</span>} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Row label="Discount" value={formatCurrency(viewItem.discount)} />
              <Row label="Late Fine/Day" value={formatCurrency(viewItem.lateFinePerDay)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Row label="Academic Session" value={viewItem.session} />
              <Row label="Created Date" value={viewItem.createdAt} />
              <Row label="Last Updated" value={viewItem.updatedAt} />
            </div>
            {viewItem.notes && (
              <div className="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Notes</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">{viewItem.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Fee Structure"
        message="Are you sure you want to delete this fee structure? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

export default FeeStructure;
