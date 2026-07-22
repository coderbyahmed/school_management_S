import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon, CheckCircleIcon, ReceiptPercentIcon, CurrencyDollarIcon,
  PlusIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import CardSection from '../../common/CardSection';
import SearchInput from '../../common/SearchInput';
import FilterDropdown from '../../common/FilterDropdown';
import ActionButtons from '../../common/ActionButtons';
import Modal from '../../common/Modal';
import ConfirmationModal from '../../common/ConfirmationModal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import SelectInput from '../../common/SelectInput';
import feeStructureService from '../../../services/feeStructure.service';

const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive'];

const formatCurrency = (val) => {
  const n = Number(val);
  if (isNaN(n)) return 'Rs. 0';
  if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return 'Rs. ' + (n / 1000).toFixed(0) + 'K';
  return 'Rs. ' + n.toLocaleString();
};

const emptyForm = {
  academicYear: '2025',
  class: '',
  monthlyFee: '',
  admissionFee: '',
  examFee: '',
  otherCharges: '',
  discount: '',
  lateFine: '',
  status: 'Active',
  notes: '',
};

const FeeStructure = () => {
  const [activeTab, setActiveTab] = useState('All Fee Structures');
  const [structures, setStructures] = useState([]);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    try {
      const data = feeStructureService.getAll();
      setStructures(data || []);
    } catch {
      setStructures([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = structures.filter((item) => {
    const matchSearch = !search || item.class.toLowerCase().includes(search.toLowerCase()) || item.academicYear.includes(search);
    const matchYear = yearFilter === 'All' || item.academicYear === yearFilter;
    const matchClass = classFilter === 'All' || item.class === classFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchYear && matchClass && matchStatus;
  });

  const totalStructures = structures.length;
  const activeStructures = structures.filter((s) => s.status === 'Active').length;
  const discountedStructures = structures.filter((s) => Number(s.discount) > 0).length;
  const monthlyEstimate = structures.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('All');
    setClassFilter('All');
    setStatusFilter('All');
  };

  const handleView = (item) => setViewItem(item);

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      academicYear: item.academicYear || '2025',
      class: item.class || '',
      monthlyFee: String(item.monthlyFee || ''),
      admissionFee: String(item.admissionFee || ''),
      examFee: String(item.examFee || ''),
      otherCharges: String(item.otherCharges || ''),
      discount: String(item.discount || ''),
      lateFine: String(item.lateFine || ''),
      status: item.status || 'Active',
      notes: item.notes || '',
    });
    setFormErrors({});
    setActiveTab('Add Fee Structure');
  };

  const handleDelete = (item) => setDeleteItem(item);

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      feeStructureService.delete(deleteItem.id);
      toast.success('Fee structure deleted successfully');
      setDeleteItem(null);
      loadData();
    } catch {
      toast.error('Failed to delete fee structure');
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.class) errors.class = 'Class is required';
    if (!form.academicYear) errors.academicYear = 'Academic year is required';
    if (!form.monthlyFee || isNaN(form.monthlyFee) || Number(form.monthlyFee) < 0) errors.monthlyFee = 'Valid monthly fee is required';
    if (form.admissionFee && (isNaN(form.admissionFee) || Number(form.admissionFee) < 0)) errors.admissionFee = 'Must be a positive number';
    if (form.examFee && (isNaN(form.examFee) || Number(form.examFee) < 0)) errors.examFee = 'Must be a positive number';
    if (form.otherCharges && (isNaN(form.otherCharges) || Number(form.otherCharges) < 0)) errors.otherCharges = 'Must be a positive number';
    if (form.discount && (isNaN(form.discount) || Number(form.discount) < 0)) errors.discount = 'Must be a positive number';
    if (form.lateFine && (isNaN(form.lateFine) || Number(form.lateFine) < 0)) errors.lateFine = 'Must be a positive number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        class: form.class,
        academicYear: form.academicYear,
        monthlyFee: Number(form.monthlyFee),
        admissionFee: Number(form.admissionFee || 0),
        examFee: Number(form.examFee || 0),
        otherCharges: Number(form.otherCharges || 0),
        discount: Number(form.discount || 0),
        lateFine: Number(form.lateFine || 0),
        status: form.status,
        notes: form.notes,
      };

      if (editItem) {
        feeStructureService.update(editItem.id, payload);
        toast.success('Fee structure updated successfully');
      } else {
        feeStructureService.create(payload);
        toast.success('Fee structure created successfully');
      }

      setForm({ ...emptyForm });
      setFormErrors({});
      setEditItem(null);
      loadData();
      setActiveTab('All Fee Structures');
    } catch {
      toast.error('Failed to save fee structure');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setEditItem(null);
  };

  const handleCancel = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setEditItem(null);
    setActiveTab('All Fee Structures');
  };

  const renderViewModal = () => {
    if (!viewItem) return null;
    return (
      <Modal isOpen={true} onClose={() => setViewItem(null)} title="Fee Structure Details" maxWidth="max-w-md">
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.class}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Year</p>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5">{viewItem.academicYear}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Fee</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatCurrency(viewItem.monthlyFee)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admission Fee</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{formatCurrency(viewItem.admissionFee)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam Fee</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{formatCurrency(viewItem.examFee)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Other Charges</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{formatCurrency(viewItem.otherCharges)}</p>
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
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border mt-0.5 ${
                viewItem.status === 'Active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
              }`}>{viewItem.status}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</p>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">{viewItem.lastUpdated}</p>
            </div>
          </div>
          {viewItem.notes && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5">
              <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{viewItem.notes}</p>
            </div>
          )}
          <div>
            <Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>
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
        <span className="text-blue-600 dark:text-blue-400 font-medium">Fee Structure</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structure</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage fee structures for all classes</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {['All Fee Structures', 'Add Fee Structure'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'All Fee Structures' && editItem) {
                  setEditItem(null);
                  setForm({ ...emptyForm });
                  setFormErrors({});
                }
                setActiveTab(tab);
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'All Fee Structures' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={DocumentTextIcon} label="Total Structures" value={totalStructures} color="blue" />
            <StatCard icon={CheckCircleIcon} label="Active Structures" value={activeStructures} color="green" />
            <StatCard icon={ReceiptPercentIcon} label="Discounted Structures" value={discountedStructures} color="yellow" />
            <StatCard icon={CurrencyDollarIcon} label="Monthly Collection Est." value={formatCurrency(monthlyEstimate)} color="blue" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-56">
                <SearchInput placeholder="Search class or year..." value={search} onChange={setSearch} />
              </div>
              <div className="w-32">
                <FilterDropdown label="Year" options={['All', ...SESSIONS]} value={yearFilter} onChange={setYearFilter} />
              </div>
              <div className="w-36">
                <FilterDropdown label="Class" options={['All', ...CLASSES]} value={classFilter} onChange={setClassFilter} />
              </div>
              <div className="w-28">
                <FilterDropdown label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              </div>
              <button onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
                <FunnelIcon className="h-4 w-4" /> Reset
              </button>
              <button onClick={() => { handleResetForm(); setActiveTab('Add Fee Structure'); }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer">
                <PlusIcon className="h-4 w-4" /> Add Fee Structure
              </button>
            </div>
          </div>

          <CardSection title={`Fee Structures (${filtered.length})`}>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Year</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Monthly</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Admission</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Exam</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Other</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Discount</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Fine</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Updated</th>
                    <th className="px-1.5 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-1.5 py-6 text-center text-gray-400 dark:text-gray-500">No fee structures found</td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-1.5 py-2 text-[11px] font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.class}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.academicYear}</td>
                        <td className="px-1.5 py-2 text-[11px] font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{formatCurrency(item.monthlyFee)}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.admissionFee)}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.examFee)}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.otherCharges)}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.discount)}</td>
                        <td className="px-1.5 py-2 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatCurrency(item.lateFine)}</td>
                        <td className="px-1.5 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium border ${
                            item.status === 'Active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.lastUpdated}</td>
                        <td className="px-1.5 py-2 whitespace-nowrap">
                          <ActionButtons onView={() => handleView(item)} onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardSection>
        </div>
      )}

      {activeTab === 'Add Fee Structure' && (
        <CardSection title={editItem ? 'Edit Fee Structure' : 'Add Fee Structure'}>
          <div className="max-w-2xl max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <SelectInput
                label="Academic Year"
                name="academicYear"
                value={form.academicYear}
                onChange={handleFormChange}
                options={SESSIONS}
                required
              />
              <SelectInput
                label="Class"
                name="class"
                value={form.class}
                onChange={handleFormChange}
                options={CLASSES}
                required
              />
            </div>
            {formErrors.class && <p className="text-xs text-red-500 -mt-3 mb-4">{formErrors.class}</p>}
            {formErrors.academicYear && <p className="text-xs text-red-500 -mt-3 mb-4">{formErrors.academicYear}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <Input label="Monthly Fee" name="monthlyFee" type="number" value={form.monthlyFee} onChange={handleFormChange} required error={formErrors.monthlyFee} placeholder="e.g. 5000" />
              <Input label="Admission Fee" name="admissionFee" type="number" value={form.admissionFee} onChange={handleFormChange} error={formErrors.admissionFee} placeholder="e.g. 15000" />
              <Input label="Exam Fee" name="examFee" type="number" value={form.examFee} onChange={handleFormChange} error={formErrors.examFee} placeholder="e.g. 2500" />
              <Input label="Other Charges" name="otherCharges" type="number" value={form.otherCharges} onChange={handleFormChange} error={formErrors.otherCharges} placeholder="e.g. 1000" />
              <Input label="Discount" name="discount" type="number" value={form.discount} onChange={handleFormChange} error={formErrors.discount} placeholder="e.g. 500" />
              <Input label="Late Fine" name="lateFine" type="number" value={form.lateFine} onChange={handleFormChange} error={formErrors.lateFine} placeholder="e.g. 200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <SelectInput
                label="Status"
                name="status"
                value={form.status}
                onChange={handleFormChange}
                options={['Active', 'Inactive']}
              />
              <Input label="Notes" name="notes" type="text" value={form.notes} onChange={handleFormChange} placeholder="Optional notes..." />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="w-28">
                <Button variant="primary" onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Save'}</Button>
              </div>
              <div className="w-28">
                <Button variant="secondary" onClick={handleResetForm}>Reset</Button>
              </div>
              <div className="w-28">
                <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
              </div>
            </div>
          </div>
        </CardSection>
      )}

      {renderViewModal()}

      <ConfirmationModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete the fee structure for ${deleteItem?.class} (${deleteItem?.academicYear})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default FeeStructure;
