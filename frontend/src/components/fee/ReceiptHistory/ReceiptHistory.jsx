import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PrinterIcon, EyeIcon, DocumentArrowDownIcon, FunnelIcon,
  PlusIcon, MagnifyingGlassIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection/CardSection';
import SearchInput from '../../common/SearchInput/SearchInput';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import SelectInput from '../../common/SelectInput/SelectInput';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SESSIONS = ['All', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const DUMMY_SPECS = [
  { year: 2026, monthNum: 1, month: 'January' },
  { year: 2026, monthNum: 2, month: 'February' },
  { year: 2026, monthNum: 3, month: 'March' },
  { year: 2026, monthNum: 4, month: 'April' },
  { year: 2026, monthNum: 5, month: 'May' },
  { year: 2026, monthNum: 6, month: 'June' },
  { year: 2026, monthNum: 7, month: 'July' },
  { year: 2025, monthNum: 9, month: 'September' },
  { year: 2025, monthNum: 10, month: 'October' },
  { year: 2025, monthNum: 11, month: 'November' },
];

const buildReceipts = (baseFee) => DUMMY_SPECS.map((m, i) => {
  const monthlyFee = baseFee;
  const admissionFee = 0;
  const examFee = m.month === 'June' || m.month === 'September' ? 500 : 0;
  const otherCharges = 0;
  const discount = m.month === 'January' ? 200 : 0;
  const lateFine = i > 0 && i % 3 === 0 ? 100 : 0;
  const totalAmount = monthlyFee + admissionFee + examFee + otherCharges + lateFine - discount;
  const methods = ['Cash', 'Bank Transfer', 'Cheque', 'Cash', 'Cash'];
  return {
    year: m.year,
    monthNum: m.monthNum,
    month: m.month,
    receiptNumber: `RCP-${m.year}-${String(1000 + i + 1).padStart(4, '0')}`,
    paymentDate: `${m.year}-${String(m.monthNum).padStart(2, '0')}-05`,
    monthlyFee,
    admissionFee,
    examFee,
    otherCharges,
    discount,
    lateFine,
    totalAmount,
    paidAmount: totalAmount,
    remainingAmount: 0,
    paymentMethod: methods[i % methods.length],
    collectedBy: 'Rashid Ahmed',
  };
});

const finalizeStudent = (student) => {
  const sorted = [...student.receipts].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
  const last = sorted[sorted.length - 1];
  return {
    ...student,
    lastPaymentDate: last.paymentDate,
    lastPaidMonth: last.month,
    lastReceiptNumber: last.receiptNumber,
    totalReceipts: sorted.length,
    receipts: sorted,
  };
};

const DUMMY_STUDENTS = [
  {
    id: 'STU-2025-0081', studentId: 'STU-2025-0081', fullName: 'Ayesha Khan',
    class: 'Class 5', gender: 'Female', fatherName: 'Imran Khan', academicYear: '2026',
    receipts: buildReceipts(5000),
  },
  {
    id: 'STU-2025-0034', studentId: 'STU-2025-0034', fullName: 'Mohammad Bilal',
    class: 'Class 8', gender: 'Male', fatherName: 'Saeed Ahmed', academicYear: '2026',
    receipts: buildReceipts(6000),
  },
  {
    id: 'STU-2024-0112', studentId: 'STU-2024-0112', fullName: 'Fatima Zahra',
    class: 'Class 3', gender: 'Female', fatherName: 'Adnan Raza', academicYear: '2026',
    receipts: buildReceipts(4000),
  },
  {
    id: 'STU-2026-0007', studentId: 'STU-2026-0007', fullName: 'Ali Hassan',
    class: 'KG-1', gender: 'Male', fatherName: 'Khalid Hassan', academicYear: '2026',
    receipts: buildReceipts(4000),
  },
  {
    id: 'STU-2025-0015', studentId: 'STU-2025-0015', fullName: 'Zainab Malik',
    class: 'Montessori', gender: 'Female', fatherName: 'Tariq Malik', academicYear: '2026',
    receipts: buildReceipts(3500),
  },
  {
    id: 'STU-2025-0066', studentId: 'STU-2025-0066', fullName: 'Ahmed Raza',
    class: 'Class 10', gender: 'Male', fatherName: 'Faisal Raza', academicYear: '2026',
    receipts: buildReceipts(6000),
  },
].map(finalizeStudent);

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
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  const [generateOpen, setGenerateOpen] = useState(false);
  const [genStudent, setGenStudent] = useState('');
  const [genMonth, setGenMonth] = useState('');

  const [viewStudent, setViewStudent] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const [histYear, setHistYear] = useState('All');
  const [histMonth, setHistMonth] = useState('All');
  const [histSearch, setHistSearch] = useState('');

  const handleResetFilters = () => {
    setSearch('');
    setYearFilter('All');
    setClassFilter('All');
  };

  const handleGenerateReceipt = () => {
    setGenerateOpen(false);
    setGenStudent('');
    setGenMonth('');
    toast.success('Receipt generation will be connected after backend integration.');
  };

  const renderGenerateModal = () => (
    <Modal isOpen={generateOpen} title="Generate Receipt" onClose={() => setGenerateOpen(false)} maxWidth="max-w-md">
      <div className="space-y-1">
        <Input
          label="Student"
          name="genStudent"
          placeholder="Search by Student ID or Name"
          value={genStudent}
          onChange={(e) => setGenStudent(e.target.value)}
          icon={MagnifyingGlassIcon}
        />
        <SelectInput
          label="Month"
          name="genMonth"
          value={genMonth}
          onChange={(e) => setGenMonth(e.target.value)}
          options={MONTHS}
          placeholder="Select Month"
        />
        <div className="flex gap-2 pt-2">
          <div className="flex-1">
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>Cancel</Button>
          </div>
          <div className="flex-1">
            <Button variant="primary" onClick={handleGenerateReceipt}>
              <PlusIcon className="h-3.5 w-3.5 mr-1 inline" /> Generate Receipt
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderViewHistoryModal = () => {
    if (!viewStudent) return null;
    const groups = {};
    viewStudent.receipts.forEach((r) => {
      if (!groups[r.year]) groups[r.year] = [];
      groups[r.year].push(r);
    });
    const yearGroups = Object.entries(groups).reverse();
    return (
      <Modal isOpen title={`Receipt History - ${viewStudent.fullName}`} onClose={() => setViewStudent(null)} maxWidth="max-w-2xl">
        <div className="max-h-[80vh] overflow-y-auto space-y-4 pr-1">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <FilterDropdown label="Academic Year" options={['All', '2025', '2026']} value={histYear} onChange={(v) => setHistYear(v)} />
            </div>
            <div className="w-36">
              <FilterDropdown label="Month" options={['All', ...MONTHS]} value={histMonth} onChange={(v) => setHistMonth(v)} />
            </div>
            <div className="w-full sm:w-48">
              <SearchInput placeholder="Search receipt No..." value={histSearch} onChange={setHistSearch} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <StudentAvatar student={viewStudent} size="w-14 h-14" textSize="text-sm" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{viewStudent.fullName}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{viewStudent.studentId} · {viewStudent.class}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">Last Payment</p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatDate(viewStudent.lastPaymentDate)}</p>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{viewStudent.totalReceipts} Receipts</p>
              </div>
            </div>
          </div>

          {yearGroups.map(([year, list]) => (
            <div key={year}>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>{year}</span>
                <span className="text-gray-400 dark:text-gray-500 font-medium normal-case">({list.length} receipts)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {list.map((receipt) => (
                  <button
                    key={receipt.receiptNumber}
                    onClick={() => setPreviewReceipt(receipt)}
                    className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer"
                    title="View receipt"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">{receipt.receiptNumber}</span>
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">{receipt.month}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(receipt.paymentDate)}</span>
                      <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">{formatCurrency(receipt.paidAmount)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  const renderPreviewModal = () => {
    if (!previewReceipt) return null;
    const student = viewStudent || {};
    const feeRows = [
      { label: 'Monthly Fee', value: formatCurrency(previewReceipt.monthlyFee) },
      { label: 'Admission Fee', value: formatCurrency(previewReceipt.admissionFee) },
      { label: 'Exam Fee', value: formatCurrency(previewReceipt.examFee) },
      { label: 'Other Charges', value: formatCurrency(previewReceipt.otherCharges) },
      { label: 'Discount', value: `- ${formatCurrency(previewReceipt.discount)}`, color: 'text-green-600 dark:text-green-400' },
      { label: 'Late Fine', value: `+ ${formatCurrency(previewReceipt.lateFine)}`, color: 'text-orange-600 dark:text-orange-400' },
    ];
    return (
      <Modal isOpen title="Receipt Preview" onClose={() => setPreviewReceipt(null)} maxWidth="max-w-2xl">
        <div id="receipt-content" className="max-h-[75vh] overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-gray-300 dark:border-gray-600 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">School Name</h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">School Address</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Phone: 123 456 7890</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">FEE RECEIPT</p>
                <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 mt-1">No: {previewReceipt.receiptNumber}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Date: {formatDate(previewReceipt.paymentDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Student Information</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.fullName || '-'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Father: {student.fatherName || '-'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">ID: {student.studentId || '-'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Class: {student.class || '-'} · {previewReceipt.year || '-'}</p>
                {student.gender && <p className="text-xs text-gray-600 dark:text-gray-300">Gender: {student.gender}</p>}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">Payment Details</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Month: {previewReceipt.month}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Method: {previewReceipt.paymentMethod || '-'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Collected By: {previewReceipt.collectedBy || '-'}</p>
              </div>
            </div>

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
                  <td className="px-2 py-1.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(previewReceipt.totalAmount)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-1.5 font-bold text-green-700 dark:text-green-400">Paid Amount</td>
                  <td className="px-2 py-1.5 text-right font-bold text-green-700 dark:text-green-400">{formatCurrency(previewReceipt.paidAmount)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-1.5 font-bold text-red-700 dark:text-red-400">Remaining</td>
                  <td className="px-2 py-1.5 text-right font-bold text-red-700 dark:text-red-400">{formatCurrency(previewReceipt.remainingAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-center">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Authorized Signature</p>
              <div className="mt-6 border-t border-gray-300 dark:border-gray-600 w-36 mx-auto" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <div className="sm:flex-1">
              <Button variant="secondary" onClick={() => setPreviewReceipt(null)}>Close</Button>
            </div>
            <Button variant="secondary"><DocumentArrowDownIcon className="h-3.5 w-3.5 mr-1 inline" /> Download PDF</Button>
            <Button variant="primary"><PrinterIcon className="h-3.5 w-3.5 mr-1 inline" /> Print</Button>
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
            <FilterDropdown label="Year" options={SESSIONS} value={yearFilter} onChange={(v) => setYearFilter(v)} />
          </div>
          <div className="w-32">
            <FilterDropdown label="Class" options={CLASSES} value={classFilter} onChange={(v) => setClassFilter(v)} />
          </div>
          <div className="w-full sm:w-56">
            <SearchInput placeholder="Search receipt no, name or ID..." value={search} onChange={setSearch} />
          </div>
          <button onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
            <FunnelIcon className="h-4 w-4" /> Reset
          </button>
          <div className="ml-auto">
            <Button variant="primary" onClick={() => setGenerateOpen(true)} className="!w-auto">
              <PlusIcon className="h-4 w-4 mr-1 inline" /> Generate Receipt
            </Button>
          </div>
        </div>
      </div>

      <CardSection title={`Students (${DUMMY_STUDENTS.length})`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DUMMY_STUDENTS.map((student) => (
            <div key={student.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <StudentAvatar student={student} size="w-11 h-11" textSize="text-xs" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{student.fullName}</h3>
                  <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">{student.studentId}</p>
                </div>
              </div>
              <div className="p-4 space-y-2.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Class</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{student.class}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Payment</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatDate(student.lastPaymentDate)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Month</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{student.lastPaidMonth}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Receipt</span>
                  <span className="text-[11px] font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">{student.lastReceiptNumber}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Receipts</span>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{student.totalReceipts}</span>
                </div>
              </div>
              <div className="p-4 pt-0">
                <Button variant="primary" onClick={() => setViewStudent(student)}>
                  <EyeIcon className="h-3.5 w-3.5 mr-1 inline" /> View History
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardSection>

      {renderGenerateModal()}
      {renderViewHistoryModal()}
      {renderPreviewModal()}
    </div>
  );
};

export default ReceiptHistory;