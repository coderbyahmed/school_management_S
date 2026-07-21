const FEE_STRUCTURES_KEY = 'fee_structures_data';

const CLASSES = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SECTIONS = ['A', 'B', 'C'];
const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

function generateFeeStructures() {
  const data = [];
  const baseFees = {
    Montessori: { tuition: 2500, admission: 4000, exam: 800, other: 400, lateFine: 50 },
    Nursery: { tuition: 3000, admission: 5000, exam: 1000, other: 500, lateFine: 50 },
    'KG-1': { tuition: 3500, admission: 5500, exam: 1200, other: 500, lateFine: 50 },
    'KG-2': { tuition: 3800, admission: 5800, exam: 1300, other: 550, lateFine: 50 },
    'Class 1': { tuition: 4000, admission: 6000, exam: 1500, other: 600, lateFine: 50 },
    'Class 2': { tuition: 4000, admission: 6000, exam: 1500, other: 600, lateFine: 50 },
    'Class 3': { tuition: 4500, admission: 6500, exam: 1500, other: 600, lateFine: 100 },
    'Class 4': { tuition: 4500, admission: 6500, exam: 1500, other: 600, lateFine: 100 },
    'Class 5': { tuition: 5000, admission: 7000, exam: 2000, other: 800, lateFine: 100 },
    'Class 6': { tuition: 5500, admission: 7500, exam: 2000, other: 800, lateFine: 100 },
    'Class 7': { tuition: 6000, admission: 8000, exam: 2500, other: 1000, lateFine: 150 },
    'Class 8': { tuition: 6500, admission: 8500, exam: 2500, other: 1000, lateFine: 150 },
    'Class 9': { tuition: 7500, admission: 10000, exam: 3000, other: 1200, lateFine: 200 },
    'Class 10': { tuition: 8500, admission: 12000, exam: 3000, other: 1200, lateFine: 200 },
  };

  CLASSES.forEach((className, idx) => {
    const sections = idx < 2 ? ['A'] : SECTIONS;
    sections.forEach((section, sIdx) => {
      const fees = baseFees[className];
      const total = fees.tuition + fees.exam + fees.other;
      data.push({
        id: `fs_${idx}_${sIdx}`,
        session: '2025',
        className,
        section,
        monthlyTuition: fees.tuition,
        admissionFee: fees.admission,
        examFee: fees.exam,
        otherCharges: fees.other,
        discount: 0,
        lateFinePerDay: fees.lateFine,
        totalMonthly: total,
        status: 'Active',
        notes: '',
        createdAt: '2026-03-15',
        updatedAt: '2026-06-20',
      });
    });
  });

  return data;
}

const feeService = {
  getFeeStructures(filters = {}) {
    let data;
    try {
      const raw = localStorage.getItem(FEE_STRUCTURES_KEY);
      if (raw) {
        data = JSON.parse(raw);
        if (data.length > 0 && data[0].computerFee !== undefined) {
          data = generateFeeStructures();
          localStorage.setItem(FEE_STRUCTURES_KEY, JSON.stringify(data));
        }
      } else { data = generateFeeStructures(); localStorage.setItem(FEE_STRUCTURES_KEY, JSON.stringify(data)); }
    } catch { data = generateFeeStructures(); }
    if (filters.session) data = data.filter((f) => f.session === filters.session);
    if (filters.className) data = data.filter((f) => f.className === filters.className);
    if (filters.status) data = data.filter((f) => f.status === filters.status);
    return data;
  },

  getFeeStructure(id) {
    return this.getFeeStructures().find((f) => f.id === id) || null;
  },

  addFeeStructure(fee) {
    const data = this.getFeeStructures();
    data.unshift({ ...fee, id: `fs_${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] });
    localStorage.setItem(FEE_STRUCTURES_KEY, JSON.stringify(data));
    return true;
  },

  updateFeeStructure(id, updates) {
    const data = this.getFeeStructures();
    const idx = data.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    localStorage.setItem(FEE_STRUCTURES_KEY, JSON.stringify(data));
    return true;
  },

  deleteFeeStructure(id) {
    const data = this.getFeeStructures().filter((f) => f.id !== id);
    localStorage.setItem(FEE_STRUCTURES_KEY, JSON.stringify(data));
  },

  getStats() {
    const data = this.getFeeStructures();
    const active = data.filter((f) => f.status === 'Active');
    const classes = new Set(data.map((f) => f.className));
    const avgMonthly = data.length > 0 ? Math.round(data.reduce((s, f) => s + f.totalMonthly, 0) / data.length) : 0;
    return {
      total: data.length,
      active: active.length,
      classesAssigned: classes.size,
      averageMonthly: avgMonthly,
    };
  },

  SESSIONS,
  CLASSES,
  SECTIONS,
};

export default feeService;
