const STORAGE_KEY = 'student_fees';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const studentNames = [
  'Aarav Sharma', 'Vivaan Verma', 'Aditya Patel', 'Vihaan Singh', 'Arjun Kumar',
  'Sai Gupta', 'Pranav Reddy', 'Ananya Joshi', 'Diya Nair', 'Myra Iyer',
  'Rohan Desai', 'Ishaan Mehta', 'Ayaan Shah', 'Sara Pandey', 'Aanya Mishra',
  'Kabir Das', 'Rudra Ghosh', 'Navya Roy', 'Riya Sarkar', 'Shreya Sen',
];

const classNames = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'UPI'];
const statuses = ['Paid', 'Partial', 'Due'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generatePaymentHistory(studentIdx) {
  const history = [];
  const year = 2025;
  for (let m = 0; m < 6; m++) {
    const baseFee = 3000 + studentIdx * 500;
    const discount = Math.random() < 0.3 ? randomInt(200, 800) : 0;
    const lateFine = Math.random() < 0.2 ? randomInt(50, 200) : 0;
    const paid = Math.random() < 0.7 ? baseFee - discount + lateFine : Math.random() < 0.5 ? Math.round((baseFee - discount + lateFine) * 0.6) : 0;
    const day = randomInt(1, 28);
    const month = m + 1;
    const status = paid >= baseFee - discount + lateFine ? 'Paid' : paid > 0 ? 'Partial' : 'Due';
    history.push({
      id: `ph_${studentIdx}_${m}`,
      month: MONTHS[m],
      paidAmount: paid,
      discount,
      lateFine,
      date: `${year}-${pad(month)}-${pad(day)}`,
      status,
      receiptNo: `RCP-${String(2025000 + studentIdx * 10 + m).slice(-5)}`,
      paymentMethod: paid > 0 ? randomPick(paymentMethods) : '-',
    });
  }
  history.sort((a, b) => b.date.localeCompare(a.date));
  return history;
}

function generateDummyData() {
  const data = [];
  for (let i = 0; i < 18; i++) {
    const name = studentNames[i % studentNames.length];
    const cls = classNames[i % classNames.length];
    const monthlyFee = 3000 + i * 400;
    const discount = Math.random() < 0.3 ? randomInt(200, 800) : 0;
    const lateFine = Math.random() < 0.2 ? randomInt(50, 200) : 100;
    const history = generatePaymentHistory(i);
    const paid = history.filter(h => h.status === 'Paid' || h.status === 'Partial').reduce((s, h) => s + h.paidAmount, 0);
    const totalDue = history.reduce((s, h) => s + (monthlyFee - discount + lateFine), 0);
    const remaining = totalDue - paid;
    const lastPaid = history.find(h => h.status === 'Paid' || h.status === 'Partial');
    const status = remaining <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due';
    data.push({
      id: `stu_${i + 1}`,
      name,
      admissionNo: `ADM${String(2025100 + i).slice(-5)}`,
      class: cls,
      guardianName: `Mr./Mrs. ${name.split(' ').pop()}`,
      monthlyFee,
      discount,
      lateFine,
      paid,
      remaining,
      status,
      lastPaymentDate: lastPaid ? lastPaid.date : '-',
      lastPaymentMethod: lastPaid && lastPaid.paidAmount > 0 ? lastPaid.paymentMethod : '-',
      academicYear: '2025',
      paymentHistory: history,
    });
  }
  return data;
}

const studentFeesService = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const data = generateDummyData();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    return data;
  },

  getById(id) {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  },

  collectFee(id, paymentData) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const student = items[idx];
    const receiptNo = `RCP-${String(2026000 + Math.floor(Math.random() * 9000)).slice(-5)}`;

    const newEntry = {
      id: `ph_${Date.now()}`,
      month: paymentData.month,
      paidAmount: Number(paymentData.amount),
      discount: Number(paymentData.discount || 0),
      lateFine: Number(paymentData.lateFine || 0),
      date: paymentData.date || todayString(),
      status: 'Paid',
      receiptNo,
      paymentMethod: paymentData.paymentMethod || 'Cash',
      remarks: paymentData.remarks || '',
    };

    student.paymentHistory.unshift(newEntry);
    student.paid += newEntry.paidAmount;
    student.remaining = Math.max(0, student.remaining - newEntry.paidAmount);
    student.lastPaymentDate = newEntry.date;
    student.lastPaymentMethod = newEntry.paymentMethod;
    student.status = student.remaining <= 0 ? 'Paid' : 'Partial';

    items[idx] = student;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    return { student, receiptNo };
  },

  update(id, data) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    const updateData = {};
    if (data.monthlyFee !== undefined) updateData.monthlyFee = Number(data.monthlyFee);
    if (data.discount !== undefined) updateData.discount = Number(data.discount);
    if (data.lateFine !== undefined) updateData.lateFine = Number(data.lateFine);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.class !== undefined) updateData.class = data.class;
    const updated = { ...items[idx], ...updateData };
    items[idx] = updated;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    return updated;
  },

  getPaymentHistory(id) {
    const student = this.getById(id);
    return student ? student.paymentHistory : [];
  },

  getStats() {
    const items = this.getAll();
    const totalStudents = items.length;
    const collectedToday = items.filter(s => s.lastPaymentDate === todayString()).reduce((s, item) => s + item.paid, 0);
    const outstandingAmount = items.reduce((s, item) => s + item.remaining, 0);
    const pendingStudents = items.filter(s => s.status === 'Due' || s.status === 'Partial').length;
    return { totalStudents, collectedToday, outstandingAmount, pendingStudents };
  },
};

export default studentFeesService;
