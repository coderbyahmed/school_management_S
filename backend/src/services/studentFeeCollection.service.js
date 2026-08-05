import Student from '../models/student.model.js';
import FeeStructure from '../models/feeStructure.model.js';
import StudentFeeCollection from '../models/studentFeeCollection.model.js';
import Counter from '../models/counter.model.js';
import feeSettingsService from './feeSettings.service.js';
import receiptService from './receipt.service.js';
import { ApiError } from '../utils/apiError.js';

const CLASS_ALIASES = {
  'KG 1': 'KG-1',
  'KG 2': 'KG-2',
};

const normalizeClass = (className) => CLASS_ALIASES[className] || className;

const getFeeGates = async () => {
  const settings = await feeSettingsService.getFeeSettings();
  const schoolFee = settings.schoolFee || {};
  const fine = settings.fine || {};

  return {
    enableAdmissionFee: schoolFee.enableAdmissionFee !== false,
    enableExamFee: schoolFee.enableExamFee !== false,
    enableLabFee: schoolFee.enableLabFee !== false,
    enableLibraryFee: schoolFee.enableLibraryFee !== false,
    enableTransportFee: schoolFee.enableTransportFee !== false,
    enableLateFee: fine.enableLateFee !== false,
    autoApplyFine: fine.autoApplyFine !== false,
  };
};

const generateReceiptNumber = async (academicYear) => {
  const settings = await feeSettingsService.getFeeSettings();
  const prefix = settings.receipt?.prefix?.trim() || 'REC';
  const seq = await Counter.increment(`feeReceipt-${academicYear}`);
  return `${prefix}-${academicYear}-${String(seq).padStart(6, '0')}`;
};

const computePaymentStatus = (totalAmount, paidAmount) => {
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  let paymentStatus;
  if (paidAmount <= 0) paymentStatus = 'Pending';
  else if (remainingAmount <= 0) paymentStatus = 'Paid';
  else paymentStatus = 'Partial';

  return { remainingAmount, paymentStatus };
};

const loadFeeStructureFor = async (className, academicYear) => {
  const normalized = normalizeClass(className);

  let structure = await FeeStructure.findOne({
    class: normalized,
    academicYear,
    status: 'Active',
  }).lean();

  if (!structure) {
    structure = await FeeStructure.findOne({
      class: normalized,
      academicYear,
    }).lean();
  }

  return structure;
};

const searchStudents = async (query = '') => {
  const term = String(query || '').trim();
  if (!term) {
    return { students: [] };
  }

  let idTerm = term.toUpperCase();
  if (/^\d+$/.test(idTerm)) {
    idTerm = `STD-${idTerm.padStart(6, '0')}`;
  }

  const filter = {
    $or: [
      { studentId: { $regex: idTerm, $options: 'i' } },
      { admissionNumber: { $regex: idTerm, $options: 'i' } },
      { fullName: { $regex: term, $options: 'i' } },
      { fatherName: { $regex: term, $options: 'i' } },
    ],
  };

  const students = await Student.find(filter)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return { students };
};

const loadStudentFeeDetails = async (studentId) => {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const structure = await loadFeeStructureFor(student.class, student.academicYear);
  if (!structure) {
    throw new ApiError(
      404,
      `No fee structure found for ${student.class} in academic year ${student.academicYear}. Please add one in Fee Structure first.`,
    );
  }

  const gates = await getFeeGates();

  const admissionFee = gates.enableAdmissionFee ? structure.admissionFee || 0 : 0;
  const examFee = gates.enableExamFee ? structure.examFee || 0 : 0;
  const labFee = gates.enableLabFee ? structure.labFee || 0 : 0;
  const libraryFee = gates.enableLibraryFee ? structure.libraryFee || 0 : 0;
  const transportFee = gates.enableTransportFee ? structure.transportFee || 0 : 0;
  const otherCharges = structure.otherCharges || 0;
  const discount = structure.discount || 0;

  const suggestedLateFine =
    gates.enableLateFee && gates.autoApplyFine ? structure.lateFine || 0 : 0;

  const baseAmount = structure.monthlyFee + admissionFee + examFee + labFee + libraryFee + transportFee + otherCharges;
  const totalAmount = Math.max(0, baseAmount + suggestedLateFine - discount);

  return {
    student: {
      _id: student._id,
      studentId: student.studentId,
      fullName: student.fullName,
      studentImage: student.studentImage,
      fatherName: student.fatherName,
      gender: student.gender,
      class: student.class,
      academicYear: student.academicYear,
      admissionNumber: student.admissionNumber,
      status: student.status,
    },
    feeStructure: {
      _id: structure._id,
      class: structure.class,
      academicYear: structure.academicYear,
      monthlyFee: structure.monthlyFee,
      admissionFee,
      examFee,
      labFee,
      libraryFee,
      transportFee,
      otherCharges,
      discount,
      lateFine: suggestedLateFine,
    },
    calculation: {
      baseAmount,
      discount,
      lateFine: suggestedLateFine,
      totalAmount,
    },
  };
};

const collectFee = async (data, userId) => {
  const student = await Student.findById(data.studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const structure = await loadFeeStructureFor(student.class, student.academicYear);
  if (!structure) {
    throw new ApiError(
      404,
      `No fee structure found for ${student.class} in academic year ${student.academicYear}`,
    );
  }

  const gates = await getFeeGates();

  const monthlyFee = structure.monthlyFee;
  const admissionFee = gates.enableAdmissionFee ? structure.admissionFee || 0 : 0;
  const examFee = gates.enableExamFee ? structure.examFee || 0 : 0;
  const labFee = gates.enableLabFee ? structure.labFee || 0 : 0;
  const libraryFee = gates.enableLibraryFee ? structure.libraryFee || 0 : 0;
  const transportFee = gates.enableTransportFee ? structure.transportFee || 0 : 0;
  const otherCharges = structure.otherCharges || 0;
  const discount = Number(data.discount) || 0;
  const lateFine = gates.enableLateFee ? Number(data.lateFine) || 0 : 0;
  const paidAmount = Number(data.paidAmount) || 0;
  const totalAmount =
    monthlyFee + admissionFee + examFee + labFee + libraryFee + transportFee + otherCharges + lateFine - discount;

  if (totalAmount < 0) {
    throw new ApiError(400, 'Discount cannot exceed the total fee amount');
  }

  if (paidAmount > totalAmount) {
    throw new ApiError(400, 'Paid amount cannot exceed the total amount');
  }

  const { remainingAmount, paymentStatus } = computePaymentStatus(totalAmount, paidAmount);

  const recordData = {
    studentId: student._id,
    academicYear: student.academicYear,
    class: structure.class,
    feeStructureId: structure._id,
    monthlyFee,
    admissionFee,
    examFee,
    otherCharges,
    discount,
    lateFine,
    totalAmount,
    paidAmount,
    remainingAmount,
    paymentStatus,
    paymentMethod: data.paymentMethod,
    paymentDate: data.paymentDate,
    remarks: data.remarks || '',
    collectedBy: userId,
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    const receiptNumber = await generateReceiptNumber(student.academicYear);

    try {
      const record = await StudentFeeCollection.create({ ...recordData, receiptNumber });
      try {
        await receiptService.generateReceiptForCollection(record._id, userId);
      } catch (receiptError) {
        console.error('Receipt auto-generation failed (collection still saved):', receiptError);
      }
      return await getFeeCollectionById(record._id);
    } catch (error) {
      if (error.code === 11000 && attempt === 0) {
        continue;
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new ApiError(400, messages.join('. '));
      }
      throw error;
    }
  }

  throw new ApiError(500, 'Failed to generate a unique receipt number');
};

const getFeeCollections = async (filters = {}) => {
  const {
    class: className,
    academicYear,
    paymentStatus,
    search,
    page = 1,
    limit = 10,
  } = filters;

  const filter = {};

  if (className) filter.class = className;
  if (academicYear) filter.academicYear = academicYear;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (search && search.trim()) {
    const term = search.trim();
    const idTerm = /^\d+$/.test(term) ? `STD-${term.padStart(6, '0')}` : term;

    const matchedStudents = await Student.find({
      $or: [
        { fullName: { $regex: term, $options: 'i' } },
        { studentId: { $regex: idTerm, $options: 'i' } },
        { admissionNumber: { $regex: idTerm, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();

    const studentIds = matchedStudents.map((s) => s._id);

    filter.$or = [{ receiptNumber: { $regex: term, $options: 'i' } }];
    if (studentIds.length > 0) {
      filter.$or.push({ studentId: { $in: studentIds } });
    }
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * itemsPerPage;

  const [collections, totalItems, totalCollections, todayAgg, outstandingAgg, pendingCount] =
    await Promise.all([
      StudentFeeCollection.find(filter)
        .populate('studentId', 'fullName studentImage studentId admissionNumber fatherName')
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      StudentFeeCollection.countDocuments(filter),
      StudentFeeCollection.countDocuments(),
      StudentFeeCollection.aggregate([
        {
          $match: {
            paymentDate: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } },
      ]),
      StudentFeeCollection.aggregate([
        { $group: { _id: null, total: { $sum: '$remainingAmount' } } },
      ]),
      StudentFeeCollection.countDocuments({ paymentStatus: { $ne: 'Paid' } }),
    ]);

  return {
    collections,
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      totalItems,
    },
    stats: {
      totalCollections,
      collectedToday: todayAgg[0]?.total || 0,
      outstandingAmount: outstandingAgg[0]?.total || 0,
      pendingCount,
    },
  };
};

const getFeeCollectionById = async (id) => {
  const record = await StudentFeeCollection.findById(id)
    .populate('studentId', 'fullName studentImage studentId admissionNumber fatherName')
    .lean();

  if (!record) {
    throw new ApiError(404, 'Fee collection record not found');
  }

  return record;
};

const updateFeeCollection = async (id, data, userId) => {
  const existing = await StudentFeeCollection.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Fee collection record not found');
  }

  const updateData = {};

  if (data.discount !== undefined) updateData.discount = Number(data.discount) || 0;
  if (data.lateFine !== undefined) {
    const gates = await getFeeGates();
    updateData.lateFine = gates.enableLateFee ? Number(data.lateFine) || 0 : 0;
  }
  if (data.paidAmount !== undefined) updateData.paidAmount = Number(data.paidAmount) || 0;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  const monthlyFee = existing.monthlyFee;
  const admissionFee = existing.admissionFee || 0;
  const examFee = existing.examFee || 0;
  const otherCharges = existing.otherCharges || 0;
  const discount = updateData.discount ?? existing.discount;
  const lateFine = updateData.lateFine ?? existing.lateFine;
  const paidAmount = updateData.paidAmount ?? existing.paidAmount;

  const totalAmount = monthlyFee + admissionFee + examFee + otherCharges + lateFine - discount;

  if (totalAmount < 0) {
    throw new ApiError(400, 'Discount cannot exceed the total fee amount');
  }

  if (paidAmount > totalAmount) {
    throw new ApiError(400, 'Paid amount cannot exceed the total amount');
  }

  const { remainingAmount, paymentStatus } = computePaymentStatus(totalAmount, paidAmount);

  updateData.totalAmount = totalAmount;
  updateData.remainingAmount = remainingAmount;
  updateData.paymentStatus = paymentStatus;
  updateData.collectedBy = userId;

  await StudentFeeCollection.findByIdAndUpdate(id, { $set: updateData }, { runValidators: true });

  return await getFeeCollectionById(id);
};

const deleteFeeCollection = async (id) => {
  const record = await StudentFeeCollection.findById(id);
  if (!record) {
    throw new ApiError(404, 'Fee collection record not found');
  }

  await StudentFeeCollection.deleteOne({ _id: id });

  return record;
};

export default {
  searchStudents,
  loadStudentFeeDetails,
  collectFee,
  getFeeCollections,
  getFeeCollectionById,
  updateFeeCollection,
  deleteFeeCollection,
};
