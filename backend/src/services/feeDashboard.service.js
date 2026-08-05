import Student from '../models/student.model.js';
import StudentFeeCollection from '../models/studentFeeCollection.model.js';
import Receipt from '../models/receipt.model.js';

const CLASS_ALIASES = {
  'KG-1': ['KG-1', 'KG 1'],
  'KG-2': ['KG-2', 'KG 2'],
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const studentClassNames = (className) => {
  if (!className) return undefined;
  return CLASS_ALIASES[className] || [className];
};

// ──────────────────────────────────────────────
// Filter Builders
// ──────────────────────────────────────────────
const buildCollectionFilter = (filters) => {
  const filter = {};
  if (filters.academicYear) filter.academicYear = filters.academicYear;
  if (filters.class) filter.class = filters.class;

  if (filters.month) {
    filter.$expr = { $eq: [{ $month: '$paymentDate' }, filters.month] };
  }
  if (filters.startDate || filters.endDate) {
    filter.paymentDate = {};
    if (filters.startDate) filter.paymentDate.$gte = startOfDay(filters.startDate);
    if (filters.endDate) filter.paymentDate.$lte = endOfDay(filters.endDate);
  }

  return filter;
};

const buildStudentFilter = (filters) => {
  const filter = { status: 'Active' };
  if (filters.academicYear) filter.academicYear = filters.academicYear;
  if (filters.class) {
    const names = studentClassNames(filters.class);
    filter.class = names.length > 1 ? { $in: names } : names[0];
  }
  return filter;
};

const buildBaseFilter = (filters) => {
  const filter = {};
  if (filters.academicYear) filter.academicYear = filters.academicYear;
  if (filters.class) filter.class = filters.class;
  return filter;
};

// ──────────────────────────────────────────────
// Dashboard Cards
// ──────────────────────────────────────────────
const loadCards = async (filters) => {
  const collectionFilter = buildCollectionFilter(filters);
  const studentFilter = buildStudentFilter(filters);
  const baseFilter = buildBaseFilter(filters);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthFilter = { ...baseFilter, paymentDate: { $gte: currentMonthStart, $lt: currentMonthEnd } };
  const prevMonthFilter = { ...baseFilter, paymentDate: { $gte: prevMonthStart, $lt: currentMonthStart } };

  const todayFilter = { paymentDate: { $gte: startOfDay(now), $lte: endOfDay(now) } };
  if (filters.academicYear) todayFilter.academicYear = filters.academicYear;
  if (filters.class) todayFilter.class = filters.class;

  const [
    totalStudents,
    studentsWithRecords,
    todayAgg,
    outstandingAgg,
    monthlyAgg,
  ] = await Promise.all([
    Student.countDocuments(studentFilter),
    StudentFeeCollection.aggregate([
      { $match: collectionFilter },
      { $group: { _id: '$studentId' } },
      { $count: 'count' },
    ]),
    StudentFeeCollection.aggregate([
      { $match: todayFilter },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    ]),
    StudentFeeCollection.aggregate([
      { $match: { ...collectionFilter, remainingAmount: { $gt: 0 } } },
      {
        $group: {
          _id: '$paymentStatus',
          totalRemaining: { $sum: '$remainingAmount' },
          students: { $addToSet: '$studentId' },
        },
      },
    ]),
    StudentFeeCollection.aggregate([
      { $match: { $or: [currentMonthFilter, prevMonthFilter] } },
      {
        $group: {
          _id: { $cond: [{ $gte: ['$paymentDate', currentMonthStart] }, 'current', 'previous'] },
          total: { $sum: '$paidAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const withFeeRecords = studentsWithRecords[0]?.count || 0;
  const withoutFeeRecords = Math.max(0, totalStudents - withFeeRecords);

  const todayCollection = todayAgg[0]?.total || 0;
  const todayTransactions = todayAgg[0]?.count || 0;
  const averageTransaction = todayTransactions > 0 ? todayCollection / todayTransactions : 0;

  const outstandingByStatus = {};
  for (const row of outstandingAgg) {
    outstandingByStatus[row._id] = row;
  }
  const totalRemaining = outstandingAgg.reduce((sum, r) => sum + (r.totalRemaining || 0), 0);
  const pendingStudents = outstandingByStatus.Pending?.students?.length || 0;
  const partialStudents = outstandingByStatus.Partial?.students?.length || 0;

  const currentRow = monthlyAgg.find((r) => r._id === 'current');
  const prevRow = monthlyAgg.find((r) => r._id === 'previous');
  const currentMonthCollection = currentRow?.total || 0;
  const previousMonthCollection = prevRow?.total || 0;
  const difference = currentMonthCollection - previousMonthCollection;
  const percentageChange =
    previousMonthCollection > 0
      ? (difference / previousMonthCollection) * 100
      : currentMonthCollection > 0
        ? 100
        : 0;

  return {
    totalStudents: {
      total: totalStudents,
      withFeeRecords,
      withoutFeeRecords,
    },
    today: {
      totalCollection: todayCollection,
      transactions: todayTransactions,
      averageTransaction,
    },
    outstanding: {
      totalRemaining,
      pendingStudents,
      partialStudents,
    },
    monthly: {
      currentMonth: MONTH_NAMES[now.getMonth()],
      currentMonthCollection,
      previousMonth: MONTH_NAMES[now.getMonth() - 1] || MONTH_NAMES[11],
      previousMonthCollection,
      difference,
      percentageChange,
    },
  };
};

// ──────────────────────────────────────────────
// Financial Summary
// ──────────────────────────────────────────────
const loadFinancialSummary = async (filters) => {
  const [agg] = await StudentFeeCollection.aggregate([
    { $match: buildCollectionFilter(filters) },
    {
      $group: {
        _id: null,
        totalFees: { $sum: '$totalAmount' },
        totalCollected: { $sum: '$paidAmount' },
        totalOutstanding: { $sum: '$remainingAmount' },
        totalDiscount: { $sum: '$discount' },
        totalFine: { $sum: '$lateFine' },
      },
    },
  ]);

  const summary = agg || {
    totalFees: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalDiscount: 0,
    totalFine: 0,
  };

  return {
    ...summary,
    totalNetCollection: summary.totalCollected,
  };
};

// ──────────────────────────────────────────────
// Charts
// ──────────────────────────────────────────────
const loadMonthlyTrend = async (filters) => {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const filter = buildBaseFilter(filters);
  filter.paymentDate = { $gte: rangeStart, $lt: rangeEnd };

  const rows = await StudentFeeCollection.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
        collected: { $sum: '$paidAmount' },
        remaining: { $sum: '$remainingAmount' },
        transactions: { $sum: 1 },
      },
    },
  ]);

  const byKey = {};
  for (const row of rows) {
    byKey[`${row._id.year}-${row._id.month}`] = row;
  }

  const trend = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const row = byKey[key];
    trend.push({
      key,
      month: MONTH_SHORT[d.getMonth()],
      year: d.getFullYear(),
      label: `${MONTH_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      collected: row?.collected || 0,
      remaining: row?.remaining || 0,
      transactions: row?.transactions || 0,
    });
  }

  return trend;
};

const loadFeeStatusDistribution = async (filters) => {
  const rows = await StudentFeeCollection.aggregate([
    { $match: buildCollectionFilter(filters) },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        students: { $addToSet: '$studentId' },
      },
    },
  ]);

  const statusMap = { Paid: 0, Partial: 0, Pending: 0 };
  for (const row of rows) {
    if (row._id in statusMap) {
      statusMap[row._id] = row.students?.length || 0;
    }
  }

  return [
    { name: 'Paid', value: statusMap.Paid },
    { name: 'Pending', value: statusMap.Pending },
    { name: 'Partial', value: statusMap.Partial },
  ];
};

const loadClassWise = async (filters) => {
  const rows = await StudentFeeCollection.aggregate([
    { $match: buildCollectionFilter(filters) },
    {
      $group: {
        _id: '$class',
        collected: { $sum: '$paidAmount' },
        remaining: { $sum: '$remainingAmount' },
        students: { $addToSet: '$studentId' },
      },
    },
    {
      $project: {
        _id: 0,
        className: '$_id',
        collected: 1,
        remaining: 1,
        studentCount: { $size: '$students' },
      },
    },
    { $sort: { collected: -1 } },
  ]);

  return rows;
};

const loadPaymentMethods = async (filters) => {
  const rows = await StudentFeeCollection.aggregate([
    { $match: buildCollectionFilter(filters) },
    {
      $group: {
        _id: '$paymentMethod',
        collected: { $sum: '$paidAmount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        collected: 1,
        count: 1,
      },
    },
    { $sort: { collected: -1 } },
  ]);

  return rows;
};

const loadCollectionComparison = async (filters) => {
  const baseFilter = buildBaseFilter(filters);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentYear = String(now.getFullYear());
  const prevYear = String(now.getFullYear() - 1);

  const [monthRows, yearRows] = await Promise.all([
    StudentFeeCollection.aggregate([
      {
        $match: {
          $or: [
            { ...baseFilter, paymentDate: { $gte: currentMonthStart, $lt: currentMonthEnd } },
            { ...baseFilter, paymentDate: { $gte: prevMonthStart, $lt: currentMonthStart } },
          ],
        },
      },
      {
        $group: {
          _id: { $cond: [{ $gte: ['$paymentDate', currentMonthStart] }, 'current', 'previous'] },
          total: { $sum: '$paidAmount' },
        },
      },
    ]),
    StudentFeeCollection.aggregate([
      { $match: { ...baseFilter, academicYear: { $in: [currentYear, prevYear] } } },
      {
        $group: {
          _id: '$academicYear',
          total: { $sum: '$paidAmount' },
        },
      },
    ]),
  ]);

  const monthMap = {};
  for (const row of monthRows) monthMap[row._id] = row.total || 0;

  const yearMap = {};
  for (const row of yearRows) yearMap[row._id] = row.total || 0;

  return {
    currentMonth: monthMap.current || 0,
    previousMonth: monthMap.previous || 0,
    currentAcademicYear: yearMap[currentYear] || 0,
    previousAcademicYear: yearMap[prevYear] || 0,
    currentYear,
    previousYear: prevYear,
  };
};

const loadCharts = async (filters) => {
  const [monthlyTrend, feeStatusDistribution, classWise, paymentMethods, collectionComparison] =
    await Promise.all([
      loadMonthlyTrend(filters),
      loadFeeStatusDistribution(filters),
      loadClassWise(filters),
      loadPaymentMethods(filters),
      loadCollectionComparison(filters),
    ]);

  return {
    monthlyTrend,
    feeStatusDistribution,
    classWise,
    paymentMethods,
    collectionComparison,
  };
};

// ──────────────────────────────────────────────
// Recent Fee Collections
// ──────────────────────────────────────────────
const loadRecentCollections = async (filters) => {
  const rows = await StudentFeeCollection.find(buildCollectionFilter(filters))
    .populate('studentId', 'fullName studentImage studentId admissionNumber')
    .populate('collectedBy', 'fullName')
    .sort({ paymentDate: -1, createdAt: -1 })
    .limit(10)
    .lean();

  return rows.map((c) => {
    const student = c.studentId || {};
    const collectedBy = c.collectedBy || null;
    return {
      _id: c._id,
      receiptNumber: c.receiptNumber || '',
      student: {
        _id: student._id || null,
        studentId: student.studentId || '',
        fullName: student.fullName || '',
        studentImage: student.studentImage || '',
        admissionNumber: student.admissionNumber || '',
      },
      studentName: student.fullName || '',
      studentImage: student.studentImage || '',
      class: c.class || '',
      academicYear: c.academicYear || '',
      paidAmount: c.paidAmount || 0,
      paymentMethod: c.paymentMethod || '',
      paymentDate: c.paymentDate || null,
      status: c.paymentStatus || '',
      collectedBy: collectedBy ? { _id: collectedBy._id, fullName: collectedBy.fullName || '' } : null,
      collectedByName: collectedBy ? collectedBy.fullName || '' : '',
    };
  });
};

// ──────────────────────────────────────────────
// Upcoming Due Students
// ──────────────────────────────────────────────
const deriveDueDate = (collection) => {
  const base = collection.paymentDate || collection.createdAt || new Date();
  const d = new Date(base);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
};

const loadUpcomingDues = async (filters) => {
  const filter = { ...buildCollectionFilter(filters), remainingAmount: { $gt: 0 } };

  const rows = await StudentFeeCollection.find(filter)
    .populate('studentId', 'fullName studentImage studentId admissionNumber fatherName')
    .sort({ paymentDate: -1, createdAt: -1 })
    .limit(100)
    .lean();

  const seen = new Set();
  const dues = [];
  const now = new Date();

  for (const c of rows) {
    const student = c.studentId;
    if (!student) continue;
    const studentKey = String(student._id);
    if (seen.has(studentKey)) continue;
    seen.add(studentKey);

    const dueDate = deriveDueDate(c);
    const remainingDays = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));

    dues.push({
      studentId: student._id,
      studentImage: student.studentImage || '',
      fullName: student.fullName || '',
      studentNumber: student.studentId || '',
      class: c.class || student.class || '',
      dueAmount: c.remainingAmount || 0,
      dueDate,
      remainingDays,
      paymentStatus: c.paymentStatus || '',
    });
  }

  dues.sort((a, b) => a.dueDate - b.dueDate);
  return dues.slice(0, 10);
};

// ──────────────────────────────────────────────
// Recent Activities
// ──────────────────────────────────────────────
const ACTIVITY_THRESHOLD_MS = 2000;

const loadRecentActivities = async (filters) => {
  const collectionFilter = buildCollectionFilter(filters);
  const receiptFilter = buildBaseFilter(filters);

  const [collections, receiptsGenerated, receiptsPrinted] = await Promise.all([
    StudentFeeCollection.find(collectionFilter)
      .populate('studentId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Receipt.find(receiptFilter).sort({ createdAt: -1 }).limit(20).lean(),
    Receipt.find({ ...receiptFilter, lastPrintedAt: { $ne: null } })
      .sort({ lastPrintedAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const activities = [];

  for (const c of collections) {
    const studentName = c.studentId?.fullName || 'Student';
    const studentId = c.studentId?._id || null;

    if (c.paidAmount > 0) {
      activities.push({
        type: 'collection',
        action: 'Fee Collected',
        description: `${c.receiptNumber || 'Fee'} collected for ${studentName}`,
        amount: c.paidAmount,
        receiptNumber: c.receiptNumber || '',
        studentId,
        timestamp: c.createdAt || c.paymentDate || null,
      });
    }
    if (c.discount > 0) {
      activities.push({
        type: 'discount',
        action: 'Discount Applied',
        description: `Discount of Rs. ${c.discount} applied for ${studentName}`,
        amount: c.discount,
        receiptNumber: c.receiptNumber || '',
        studentId,
        timestamp: c.createdAt || null,
      });
    }
    if (c.lateFine > 0) {
      activities.push({
        type: 'fine',
        action: 'Late Fine Applied',
        description: `Late fine of Rs. ${c.lateFine} applied for ${studentName}`,
        amount: c.lateFine,
        receiptNumber: c.receiptNumber || '',
        studentId,
        timestamp: c.createdAt || null,
      });
    }
    if (c.updatedAt && c.createdAt && c.updatedAt.getTime() - c.createdAt.getTime() > ACTIVITY_THRESHOLD_MS) {
      activities.push({
        type: 'update',
        action: 'Fee Updated',
        description: `Fee record updated for ${studentName}`,
        amount: c.paidAmount,
        receiptNumber: c.receiptNumber || '',
        studentId,
        timestamp: c.updatedAt,
      });
    }
  }

  for (const r of receiptsGenerated) {
    activities.push({
      type: 'receipt',
      action: 'Receipt Generated',
      description: `Receipt ${r.receiptNumber || ''} generated`,
      amount: 0,
      receiptNumber: r.receiptNumber || '',
      studentId: r.studentId || null,
      timestamp: r.createdAt || null,
    });
  }

  for (const r of receiptsPrinted) {
    activities.push({
      type: 'receipt',
      action: 'Receipt Printed',
      description: `Receipt ${r.receiptNumber || ''} printed`,
      amount: 0,
      receiptNumber: r.receiptNumber || '',
      studentId: r.studentId || null,
      timestamp: r.lastPrintedAt || null,
    });
  }

  activities.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  return activities.slice(0, 20);
};

// ──────────────────────────────────────────────
// Dashboard Assembly
// ──────────────────────────────────────────────
const loadDashboard = async (filters, user) => {
  const [cards, financialSummary, charts, recentCollections, upcomingDues, recentActivities] =
    await Promise.all([
      loadCards(filters),
      loadFinancialSummary(filters),
      loadCharts(filters),
      loadRecentCollections(filters),
      loadUpcomingDues(filters),
      loadRecentActivities(filters),
    ]);

  return {
    cards,
    financialSummary,
    charts,
    recentCollections,
    upcomingDues,
    recentActivities,
    meta: {
      generatedAt: new Date(),
      generatedBy: user ? user.fullName || String(user._id) : 'System',
      filters,
    },
  };
};

export default {
  loadDashboard,
  loadCards,
  loadFinancialSummary,
  loadCharts,
  loadRecentCollections,
  loadUpcomingDues,
  loadRecentActivities,
};
