import feeService from './fee.service';

const STUDENT_FEES_KEY = 'student_fees_data';

const CLASSES = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const ITEMS_PER_PAGE = 10;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Pranav', 'Dhruv', 'Ishaan', 'Ayaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya', 'Ishita', 'Navya', 'Riya', 'Shreya', 'Kavya', 'Rohan', 'Krishna', 'Shaurya', 'Yash', 'Om', 'Anaya', 'Aarohi', 'Siya', 'Anvi', 'Jiya', 'Kabir', 'Rudra', 'Atharva', 'Aryan', 'Samar', 'Shivansh', 'Tanya', 'Misha', 'Khushi', 'Ira', 'Reyansh', 'Laksh', 'Arush', 'Harsh', 'Nandini', 'Shanaya', 'Jhanvi', 'Saanvi', 'Mannat', 'Gauri'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Joshi', 'Nair', 'Iyer', 'Desai', 'Mehta', 'Shah', 'Pandey', 'Mishra', 'Das', 'Ghosh', 'Roy', 'Sarkar', 'Sen', 'Bose', 'Chakraborty', 'Mukherjee', 'Banerjee', 'Chatterjee'];
const paymentMethods = ['Cash', 'Bank', 'Online'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getClassMonthlyFee(className) {
  const structures = feeService.getFeeStructures({ session: '2025' });
  const match = structures.find((s) => s.className === className);
  return match ? match.monthlyTuition : 5000;
}

function generateStudentFees() {
  const data = [];
  let counter = 1;
  const today = new Date().toISOString().split('T')[0];

  CLASSES.forEach((className) => {
    const monthlyFee = getClassMonthlyFee(className);
    const totalInstallments = 3;
    const installmentAmount = Math.round(monthlyFee / totalInstallments);
    const studentCount = className.startsWith('Class') ? randomInt(2, 5) : randomInt(1, 3);

    for (let i = 0; i < studentCount; i++) {
      const firstName = randomPick(firstNames);
      const lastName = randomPick(lastNames);
      const discount = Math.random() < 0.3 ? randomInt(100, 500) : 0;
      const fine = Math.random() < 0.2 ? randomInt(50, 200) : 0;
      const totalPayable = monthlyFee + fine - discount;

      const statusRand = Math.random();
      let status, paidAmount, paidInstallments, paymentHistory;

      if (statusRand < 0.4) {
        status = 'Paid';
        paidAmount = totalPayable;
        paidInstallments = totalInstallments;
        paymentHistory = [];
        for (let inst = 1; inst <= totalInstallments; inst++) {
          paymentHistory.push({
            receiptNo: `RCP${String(2025000 + counter).slice(-5)}-${inst}`,
            date: `2025-${String(randomInt(1, 4)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
            method: randomPick(paymentMethods),
            amount: installmentAmount + (inst === totalInstallments ? totalPayable - installmentAmount * totalInstallments : 0),
            discount: inst === 1 ? discount : 0,
            fine: inst === 1 ? fine : 0,
            installmentNo: inst,
            notes: `Installment ${inst} of ${totalInstallments}`,
          });
        }
      } else if (statusRand < 0.65) {
        status = 'Partial';
        const half = Math.ceil(totalInstallments / 2);
        paidInstallments = randomInt(1, half);
        paidAmount = paidInstallments * installmentAmount;
        paymentHistory = [];
        for (let inst = 1; inst <= paidInstallments; inst++) {
          paymentHistory.push({
            receiptNo: `RCP${String(2025000 + counter).slice(-5)}-${inst}`,
            date: `2025-${String(randomInt(1, 4)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
            method: randomPick(paymentMethods),
            amount: installmentAmount + (inst === 1 ? Math.round((discount + fine) / paidInstallments) : 0),
            discount: inst === 1 ? Math.round(discount / 2) : 0,
            fine: inst === 1 ? Math.round(fine / 2) : 0,
            installmentNo: inst,
            notes: `Installment ${inst} of ${totalInstallments}`,
          });
        }
      } else if (statusRand < 0.85) {
        status = 'Pending';
        paidAmount = 0;
        paidInstallments = 0;
        paymentHistory = [];
      } else {
        status = 'Overdue';
        paidAmount = 0;
        paidInstallments = 0;
        paymentHistory = [];
      }

      const remainingBalance = totalPayable - paidAmount;
      const dueDate = `2025-${String(randomInt(3, 7)).padStart(2, '0')}-${String(randomInt(10, 28)).padStart(2, '0')}`;

      data.push({
        id: `sf_${counter}`,
        studentName: `${firstName} ${lastName}`,
        admissionNo: `ADM${String(2025000 + counter).slice(-5)}`,
        className,
        monthlyFee,
        totalPayable,
        paidAmount,
        remainingBalance,
        discount,
        fine,
        totalInstallments,
        paidInstallments,
        installmentAmount,
        status,
        dueDate,
        paymentHistory,
        session: '2025',
        createdAt: `2025-${String(randomInt(1, 3)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
        updatedAt: `2025-${String(randomInt(3, 6)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      });
      counter++;
    }
  });

  return data;
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STUDENT_FEES_KEY);
    if (raw) return JSON.parse(raw);
    const data = generateStudentFees();
    localStorage.setItem(STUDENT_FEES_KEY, JSON.stringify(data));
    return data;
  } catch {
    const data = generateStudentFees();
    localStorage.setItem(STUDENT_FEES_KEY, JSON.stringify(data));
    return data;
  }
}

const studentFeeService = {
  ITEMS_PER_PAGE,
  CLASSES,
  SESSIONS,

  getStudentFees(filters = {}, page = 1) {
    let data = loadAll();

    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((s) => s.studentName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q));
    }
    if (filters.session) data = data.filter((s) => s.session === filters.session);
    if (filters.className) data = data.filter((s) => s.className === filters.className);
    if (filters.status) data = data.filter((s) => s.status === filters.status);

    data.sort((a, b) => a.studentName.localeCompare(b.studentName));

    const totalStudents = data.length;
    const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(page, totalPages || 1));
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    const paginated = data.slice(start, start + ITEMS_PER_PAGE);

    return {
      students: paginated,
      pagination: { totalStudents, totalPages, currentPage: safePage },
    };
  },

  getStudentFee(id) {
    const data = loadAll();
    return data.find((s) => s.id === id) || null;
  },

  collectFee(id, payment) {
    const data = loadAll();
    const idx = data.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const student = data[idx];
    const paymentAmount = Number(payment.amount) || 0;
    const discount = Number(payment.discount) || 0;
    const fine = Number(payment.fine) || 0;

    const nextInstallment = (student.paidInstallments || 0) + 1;
    const receiptNo = `RCP${String(Date.now()).slice(-8)}`;

    student.paymentHistory = student.paymentHistory || [];
    student.paymentHistory.push({
      receiptNo,
      date: payment.date || new Date().toISOString().split('T')[0],
      method: payment.method || 'Cash',
      amount: paymentAmount,
      discount,
      fine,
      installmentNo: nextInstallment,
      notes: payment.notes || `Installment ${nextInstallment} of ${student.totalInstallments}`,
    });

    student.paidAmount = (student.paidAmount || 0) + paymentAmount;
    student.paidInstallments = nextInstallment;
    student.discount = discount;
    student.fine = fine;
    student.totalPayable = student.monthlyFee + student.fine - student.discount;
    student.remainingBalance = student.totalPayable - student.paidAmount;

    if (student.remainingBalance <= 0) {
      student.status = 'Paid';
    } else if (student.paidAmount > 0) {
      student.status = 'Partial';
    }

    student.updatedAt = new Date().toISOString().split('T')[0];
    data[idx] = student;
    localStorage.setItem(STUDENT_FEES_KEY, JSON.stringify(data));
    return true;
  },

  updateStudentFee(id, updates) {
    const data = loadAll();
    const idx = data.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    data[idx].totalPayable = data[idx].monthlyFee + (data[idx].fine || 0) - (data[idx].discount || 0);
    data[idx].remainingBalance = data[idx].totalPayable - (data[idx].paidAmount || 0);
    if (data[idx].remainingBalance <= 0) data[idx].status = 'Paid';
    else if (data[idx].paidAmount > 0) data[idx].status = 'Partial';
    else data[idx].status = 'Pending';

    localStorage.setItem(STUDENT_FEES_KEY, JSON.stringify(data));
    return true;
  },

  getStats() {
    const data = loadAll();
    const today = new Date().toISOString().split('T')[0];
    const totalStudents = data.length;
    const paidAmount = data.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
    const outstandingAmount = data.reduce((sum, s) => sum + (s.remainingBalance || 0), 0);
    const dueToday = data.filter((s) => s.dueDate === today && s.status !== 'Paid').length;
    return { totalStudents, paidAmount, outstandingAmount, dueToday };
  },
};

export default studentFeeService;
