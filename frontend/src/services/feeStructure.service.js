const STORAGE_KEY = 'fee_structures';

const CLASSES = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

function generateDummyData() {
  const now = new Date().toISOString().split('T')[0];
  return CLASSES.map((cls, i) => {
    const baseFee = 2000 + i * 500;
    return {
      id: `fs_${i + 1}`,
      class: cls,
      academicYear: '2025',
      monthlyFee: baseFee,
      admissionFee: baseFee * 3,
      examFee: Math.round(baseFee * 0.5),
      otherCharges: Math.round(baseFee * 0.3),
      discount: i < 3 ? Math.round(baseFee * 0.25) : i < 6 ? Math.round(baseFee * 0.15) : 0,
      lateFine: Math.round(baseFee * 0.1),
      status: i < 5 ? 'Active' : i < 11 ? 'Active' : 'Inactive',
      notes: i < 3 ? 'Includes lab and library fees' : '',
      lastUpdated: now,
    };
  });
}

const feeStructureService = {
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

  create(data) {
    const items = this.getAll();
    const newItem = {
      ...data,
      id: 'fs_' + Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    items.push(newItem);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    return newItem;
  },

  update(id, data) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...data,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    return items[idx];
  },

  delete(id) {
    let items = this.getAll();
    items = items.filter((item) => item.id !== id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    return true;
  },
};

export default feeStructureService;
