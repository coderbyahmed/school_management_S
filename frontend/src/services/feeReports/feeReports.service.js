import api from '../../api/axios';

const SESSIONS = ['2026', '2025', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STATUS_OPTIONS = ['All', 'Paid', 'Partial', 'Pending'];
const PAYMENT_METHODS = ['All', 'Cash', 'Cheque', 'UPI', 'Bank Transfer'];
const REPORT_TYPES = [
  { value: 'all', label: 'All Fee Collections' },
  { value: 'paid', label: 'Paid Students' },
  { value: 'pending', label: 'Pending Students' },
  { value: 'partial', label: 'Partial Payments' },
  { value: 'monthly', label: 'Monthly Collection' },
  { value: 'classWise', label: 'Class Wise' },
  { value: 'outstanding', label: 'Outstanding' },
];

const generateReport = async (params) => {
  const response = await api.get('/fee-reports', { params });
  return response.data.data;
};

const getPrintData = async (params) => {
  const response = await api.get('/fee-reports/print', { params });
  return response.data.data;
};

const downloadPdf = async (params) => {
  const response = await api.get('/fee-reports/pdf', { params, responseType: 'blob' });
  return response.data;
};

const downloadExcel = async (params) => {
  const response = await api.get('/fee-reports/excel', { params, responseType: 'blob' });
  return response.data;
};

const feeReportsService = {
  generateReport,
  getPrintData,
  downloadPdf,
  downloadExcel,
  sessions: SESSIONS,
  months: MONTHS,
  classes: CLASSES,
  statusOptions: STATUS_OPTIONS,
  paymentMethods: PAYMENT_METHODS,
  reportTypes: REPORT_TYPES,
};

export default feeReportsService;
