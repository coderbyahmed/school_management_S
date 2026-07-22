const DASHBOARD_KEY = 'fee_dashboard_data';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sessions = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const studentNames = [
  'Aarav Sharma', 'Vivaan Verma', 'Aditya Patel', 'Vihaan Singh', 'Arjun Kumar',
  'Sai Gupta', 'Pranav Reddy', 'Ananya Joshi', 'Diya Nair', 'Myra Iyer',
  'Rohan Desai', 'Ishaan Mehta', 'Ayaan Shah', 'Sara Pandey', 'Aanya Mishra',
  'Kabir Das', 'Rudra Ghosh', 'Navya Roy', 'Riya Sarkar', 'Shreya Sen',
  'Tanya Bose', 'Kavya Chakraborty', 'Anaya Mukherjee', 'Siya Banerjee',
  'Jiya Chatterjee', 'Reyansh Sharma', 'Laksh Verma', 'Arush Patel',
  'Harsh Singh', 'Nandini Kumar', 'Shanaya Gupta', 'Jhanvi Reddy',
];

const classNames = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'UPI'];

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

function generateRecentPayments() {
  const data = [];
  for (let i = 0; i < 25; i++) {
    const month = randomInt(1, 6);
    const day = randomInt(1, 28);
    const r = Math.random();
    const status = r < 0.5 ? 'Paid' : r < 0.7 ? 'Pending' : r < 0.85 ? 'Partial' : 'Overdue';
    data.push({
      id: `pay_${i + 1}`,
      date: `2025-${pad(month)}-${pad(day)}`,
      studentName: randomPick(studentNames),
      admissionNo: `ADM${String(2025100 + i).slice(-5)}`,
      className: randomPick(classNames),
      amount: randomInt(2000, 15000),
      status,
      receipt: `RCP-${String(2025000 + i).slice(-5)}`,
      paymentMethod: randomPick(paymentMethods),
    });
  }
  data.sort((a, b) => b.date.localeCompare(a.date));
  return data;
}

function generateUpcomingDueStudents() {
  const data = [];
  for (let i = 0; i < 8; i++) {
    const dueDay = randomInt(5, 28);
    const dueMonth = randomInt(6, 8);
    data.push({
      id: `due_${i + 1}`,
      studentName: randomPick(studentNames),
      admissionNo: `ADM${String(2025100 + i + 30).slice(-5)}`,
      className: randomPick(classNames),
      dueAmount: randomInt(5000, 25000),
      dueDate: `2025-${pad(dueMonth)}-${pad(dueDay)}`,
    });
  }
  return data;
}

function generateTimeline() {
  const actions = [
    { action: 'Fee Collected', desc: 'Full payment received', icon: 'collection' },
    { action: 'Receipt Generated', desc: 'Receipt issued successfully', icon: 'receipt' },
    { action: 'Discount Approved', desc: 'Fee discount has been approved', icon: 'discount' },
    { action: 'Late Fine Applied', desc: 'Late payment fine has been applied', icon: 'fine' },
    { action: 'Fee Structure Updated', desc: 'Class 5 fee structure revised', icon: 'update' },
    { action: 'Student Enrolled', desc: 'New student fee record created', icon: 'enroll' },
  ];
  const data = [];
  for (let i = 0; i < 8; i++) {
    const act = actions[i % actions.length];
    const day = randomInt(1, 28);
    const month = randomInt(4, 6);
    const hours = randomInt(9, 17);
    const mins = randomInt(0, 59);
    data.push({
      id: `tl_${i + 1}`,
      date: `2025-${pad(month)}-${pad(day)}`,
      time: `${pad(hours)}:${pad(mins)}`,
      action: act.action,
      desc: act.desc,
      icon: act.icon,
      studentName: randomPick(studentNames),
      amount: act.action === 'Fee Collected' ? randomInt(2000, 15000) : null,
    });
  }
  data.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  return data;
}

function generateAllData() {
  const now = new Date();
  const todayStr = todayString();
  const currentMonthIndex = now.getMonth();
  const currentMonth = months[currentMonthIndex];

  const monthlyCollection = [
    { month: 'Jan', collected: 820000, pending: 180000, trend: 750000 },
    { month: 'Feb', collected: 890000, pending: 160000, trend: 800000 },
    { month: 'Mar', collected: 850000, pending: 200000, trend: 780000 },
    { month: 'Apr', collected: 920000, pending: 150000, trend: 840000 },
    { month: 'May', collected: 980000, pending: 120000, trend: 890000 },
    { month: 'Jun', collected: 950000, pending: 140000, trend: 870000 },
  ];

  const totalCollected = monthlyCollection.reduce((s, m) => s + m.collected, 0);
  const totalPending = monthlyCollection.reduce((s, m) => s + m.pending, 0);

  return {
    totalStudents: 546,
    totalFeeCollection: totalCollected,
    pendingFee: totalPending,
    todayCollection: randomInt(25000, 85000),
    monthlyCollectionTarget: 950000,
    monthlyCollectionCurrent: 950000,
    outstandingBalance: randomInt(80000, 200000),
    growthRates: {
      totalStudents: '+5.2%',
      totalFeeCollection: '+12.8%',
      pendingFee: '-3.1%',
      todayCollection: '+8.6%',
      monthlyCollectionTarget: '+2.3%',
      outstandingBalance: '-8.4%',
    },
    growthUp: {
      totalStudents: true,
      totalFeeCollection: true,
      pendingFee: false,
      todayCollection: true,
      monthlyCollectionTarget: true,
      outstandingBalance: false,
    },
    monthlyCollection,
    feeDistribution: [
      { name: 'Collected', value: 68, color: '#22c55e' },
      { name: 'Pending', value: 20, color: '#eab308' },
      { name: 'Discount', value: 12, color: '#3b82f6' },
    ],
    recentPayments: generateRecentPayments(),
    upcomingDueStudents: generateUpcomingDueStudents(),
    recentActivities: generateTimeline(),
    todayStr,
    currentMonth,
  };
}

const feeDashboardService = {
  months,
  sessions,

  getDashboardData() {
    try {
      const raw = localStorage.getItem(DASHBOARD_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const data = generateAllData();
    try {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } catch {}
    return data;
  },

  refreshDashboard() {
    try {
      localStorage.removeItem(DASHBOARD_KEY);
    } catch {}
    const data = generateAllData();
    try {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } catch {}
    return data;
  },
};

export default feeDashboardService;
