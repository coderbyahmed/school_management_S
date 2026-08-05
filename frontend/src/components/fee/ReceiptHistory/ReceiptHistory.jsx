import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  PrinterIcon, EyeIcon, DocumentArrowDownIcon, ArrowPathIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import receiptsService from '../../../services/receipts/receipts.service';

const SESSIONS = ['All', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const ITEMS_PER_PAGE = 10;

const formatCurrency = (val) => {
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

const StudentAvatar = ({ student, size = 'w-7 h-7', textSize = 'text-[8px]' }) => {
  if (student?.studentImage) {
    return (
      <img
        src={student.studentImage}
        alt={student.fullName || 'Student'}
        className={`${size} rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600`}
      />
    );
  }
  const name = student?.fullName || '';
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white font-bold ${textSize} flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

const ReceiptHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const [viewReceipt, setViewReceipt] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchReceipts = useCallback(async () => {
    const params = { page: currentPage, limit: ITEMS_PER_PAGE };
    if (yearFilter !== 'All') params.academicYear = yearFilter;
    if (classFilter !== 'All') params.class = classFilter;
    if (search) params.search = search;
    return receiptsService.getAll(params);
  }, [currentPage, yearFilter, classFilter, search]);

  useEffect(() => {
    let active = true;
    fetchReceipts()
      .then((data) => {
        if (!active) return;
        setReceipts(data.receipts || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
      })
      .catch(() => {
        if (!active) return;
        setReceipts([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      })
      .finally(() => {
        if (active) setFetchLoading(false);
      });
    return () => { active = false; };
  }, [fetchReceipts, reload]);

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('All');
    setClassFilter('All');
    setCurrentPage(1);
  };

  const handleView = async (item) => {
    setViewLoading(true);
    setViewReceipt(item);
    try {
      const data = await receiptsService.getById(item._id);
      setViewReceipt(data.receipt);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load receipt');
      setViewReceipt(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleMarkPrinted = async (id, reprint = false) => {
    setActionLoading(id);
    try {
      if (reprint) {
        await receiptsService.markReprinted(id);
        toast.success('Receipt reprinted successfully');
      } else {
        await receiptsService.markPrinted(id);
        toast.success('Receipt printed successfully');
      }
      setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update receipt');
    } finally {
      setActionLoading('');
    }
  };

  const handlePrint = async (id, reprint = false) => {
    setActionLoading(id);
    try {
      if (reprint) {
        await receiptsService.markReprinted(id);
      } else {
        await receiptsService.markPrinted(id);
      }
      setReload((r) => r + 1);
      window.print();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to print receipt');
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadPdf = async (item) => {
    setActionLoading(item._id);
    try {
      const blob = await receiptsService.downloadPdf(item._id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${item.receiptNumber || item._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setReload((r) => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setActionLoading('');
    }
  };

  const renderReceiptModal = () => {
    if (!viewReceipt) return null;
    const student = viewReceipt.student || {};
    const collection = viewReceipt.collection || {};
    const school = viewReceipt.school || {};
    const settings = viewReceipt.settings?.receipt || {};

    const showPhoto = settings.showStudentPhoto !== false;
    const showParent = settings.showParentInfo !== false;
    const showBreakdown = settings.showFeeBreakdown !== false;
    const showPayment = settings.showPaymentMethod !== false;
    const showRemarks = settings.showRemarks !== false;
    const showSignature = settings.showSignature !== false;

    const feeRows = [
      { label: 'Monthly Fee', value: formatCurrency(collection.monthlyFee) },
      { label: 'Admission Fee', value: formatCurrency(collection.admissionFee) },
      { label: 'Exam Fee', value: formatCurrency(collection.examFee) },
      { label: 'Other Charges', value: formatCurrency(collection.otherCharges) },
      { label: 'Discount', value: `- ${formatCurrency(collection.discount)}`, color: 'text-green-600 dark:text-green-400' },
      { label: 'Late Fine', value: `+ ${formatCurrency(collection.lateFine)}`, color: 'text-orange-600 dark:text-orange-400' },
    ];

    return (
      <Modal isOpen title="Receipt Preview" onClose={() => setViewReceipt(null)} maxWidth="max-w-2xl">
        <div id="receipt-content" className="max-h-[75vh] overflow-y-auto">
          {viewLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Loading receipt...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-gray-300 dark:border-gray-600 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  {settings.showSchoolLogo !== false && school.schoolLogo && (
                    <img src={school.schoolLogo} alt="School" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">{school.schoolName || 'School Name'}</h2>
                    {school.address && <p className="text-[10px] text-gray-500 dark:text-gray-400">{school.address}</p>}
                    {school.contactNumber && <p className="text-[10px] text-gray-500 dark:text-gray-400">Phone: {school.contactNumber}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">FEE RECEIPT</p>
                  <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-1">No: {viewReceipt.receiptNumber}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Date: {formatDate(collection.paymentDate)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Student Information</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.fullName || '-'}</p>
                  {showParent && <p className="text-xs text-gray-600 dark:text-gray-300">Father: {student.fatherName || '-'}</p>}
                  <p className="text-xs text-gray-600 dark:text-gray-300">ID: {student.studentId || '-'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Class: {student.class || '-'} · {student.academicYear || '-'}</p>
                  {student.gender && <p className="text-xs text-gray-600 dark:text-gray-300">Gender: {student.gender}</p>}
                </div>
                {showPhoto && student.studentImage && (
                  <img src={student.studentImage} alt="Student" className="w-16 h-16 rounded object-cover border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                )}
              </div>

              {showBreakdown ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/30">
                      <th className="px-2 py-1.5 text-left text-[9px] uppercase text-gray-500 dark:text-gray-400 font-semibold">Description</th>
                      <th className="px-2 py-1.5 text-right text-[9px] uppercase text-gray-500 dark:text-gray-400 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRows.map((row) => (
                      <tr key={row.label} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{row.label}</td>
                        <td className={`px-2 py-1.5 text-right font-medium ${row.color || 'text-gray-900 dark:text-white'}`}>{row.value}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300 dark:border-gray-600">
                      <td className="px-2 py-1.5 font-bold text-gray-900 dark:text-white">Total Amount</td>
                      <td className="px-2 py-1.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(collection.totalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 font-bold text-green-700 dark:text-green-400">Paid Amount</td>
                      <td className="px-2 py-1.5 text-right font-bold text-green-700 dark:text-green-400">{formatCurrency(collection.paidAmount)}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 font-bold text-red-700 dark:text-red-400">Remaining</td>
                      <td className="px-2 py-1.5 text-right font-bold text-red-700 dark:text-red-400">{formatCurrency(collection.remainingAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5 space-y-1.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Total: {formatCurrency(collection.totalAmount)}</p>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400">Paid: {formatCurrency(collection.paidAmount)}</p>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">Remaining: {formatCurrency(collection.remainingAmount)}</p>
                </div>
              )}

              {showPayment && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Payment Information</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Method: {collection.paymentMethod || '-'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Collected By: {collection.collectedBy?.fullName || '-'}</p>
                </div>
              )}

              {showRemarks && collection.remarks && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Remarks</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{collection.remarks}</p>
                </div>
              )}

              {showSignature && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Authorized Signature</p>
                  {school.principalSignature ? (
                    <img src={school.principalSignature} alt="Signature" className="h-12 mx-auto mt-2 object-contain" />
                  ) : (
                    <div className="mt-6 border-t border-gray-300 dark:border-gray-600 w-36 mx-auto" />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <div className="flex-1">
              <Button variant="secondary" onClick={() => setViewReceipt(null)}>Close</Button>
            </div>
            <Button variant="secondary" onClick={() => handleDownloadPdf(viewReceipt)} loading={actionLoading === viewReceipt?._id}>
              <DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1 inline" /> PDF
            </Button>
            <Button variant="primary" onClick={() => handlePrint(viewReceipt._id, false)} loading={actionLoading === viewReceipt?._id}>
              <PrinterIcon className="h-3.5 w-3.5 mr-1 inline" /> Print
            </Button>
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
        <span className="text-blue-600 dark:text-blue-400 font-medium">Receipt History</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View, print and reprint fee receipts</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <FilterDropdown label="Year" options={SESSIONS} value={yearFilter} onChange={(v) => { setYearFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={classFilter} onChange={(v) => { setClassFilter(v); setCurrentPage(1); }} />
          </div>
          <div className="w-full sm:w-56">
            <SearchInput placeholder="Search receipt no, name or ID..." value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <CardSection title={`Receipts (${pagination.totalItems})`}>
        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Receipt No</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Student</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Paid</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Method</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Payment Date</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Collected By</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Prints</th>
                <th className="px-1.5 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-300 text-[10px] uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fetchLoading ? (
                <tr>
                  <td colSpan={9} className="px-2 py-10 text-center">
                    <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-2 py-8 text-center text-gray-400 dark:text-gray-500">No receipts found</td>
                </tr>
              ) : (
                receipts.map((item) => {
                  const student = item.student || {};
                  return (
                    <tr key={item._id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-1.5 py-2 text-[10px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.receiptNumber}</td>
                      <td className="px-1.5 py-2">
                        <div className="flex items-center gap-2">
                          <StudentAvatar student={student} />
                          <span className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[110px]">{student.fullName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.class}</td>
                      <td className="px-1.5 py-2 text-xs font-medium text-green-700 dark:text-green-400 whitespace-nowrap">{formatCurrency(item.paidAmount)}</td>
                      <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.paymentMethod || '-'}</td>
                      <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(item.paymentDate)}</td>
                      <td className="px-1.5 py-2 text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.collectedBy?.fullName || '-'}</td>
                      <td className="px-1.5 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{item.printCount}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleView(item)}
                            className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer" title="View">
                            <EyeIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleView(item)}
                            className="p-1 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors cursor-pointer" title="Print">
                            <PrinterIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleMarkPrinted(item._id, true)}
                            disabled={actionLoading === item._id}
                            className="p-1 rounded text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer disabled:opacity-50" title="Reprint">
                            <ArrowPathIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDownloadPdf(item)}
                            disabled={actionLoading === item._id}
                            className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50" title="Download PDF">
                            <DocumentArrowDownIcon className="h-3.5 w-3.5" />
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

      {renderReceiptModal()}
    </div>
  );
};

export default ReceiptHistory;
