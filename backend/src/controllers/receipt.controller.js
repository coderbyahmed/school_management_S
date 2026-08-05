import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl } from '../utils/imageUrl.js';
import receiptService from '../services/receipt.service.js';

const mapReceiptUrls = (req, receipt) => {
  if (receipt.student?.studentImage) {
    receipt.student.studentImage = toFullUrl(req, receipt.student.studentImage);
  }
  if (receipt.school?.schoolLogo) {
    receipt.school.schoolLogo = toFullUrl(req, receipt.school.schoolLogo);
  }
  if (receipt.school?.principalSignature) {
    receipt.school.principalSignature = toFullUrl(req, receipt.school.principalSignature);
  }
  return receipt;
};

const getReceipts = asyncHandler(async (req, res) => {
  const result = await receiptService.getReceiptHistory(req.query);

  const receipts = result.receipts.map((r) => {
    if (r.student?.studentImage) {
      r.student.studentImage = toFullUrl(req, r.student.studentImage);
    }
    return r;
  });

  return res.status(200).json({
    success: true,
    message: 'Receipts fetched successfully',
    data: {
      receipts,
      pagination: result.pagination,
    },
  });
});

const generateReceipt = asyncHandler(async (req, res) => {
  const { receipt, created } = await receiptService.generateReceipt(
    req.body.feeCollectionId,
    req.user?._id,
  );

  mapReceiptUrls(req, receipt);

  return res.status(created ? 201 : 200).json({
    success: true,
    message: created ? 'Receipt generated successfully' : 'Receipt already exists for this fee collection',
    data: { receipt, created },
  });
});

const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getReceiptById(req.params.id);

  mapReceiptUrls(req, receipt);

  return res.status(200).json({
    success: true,
    message: 'Receipt fetched successfully',
    data: { receipt },
  });
});

const printReceipt = asyncHandler(async (req, res) => {
  const receipt = await receiptService.printReceipt(req.params.id);

  mapReceiptUrls(req, receipt);

  return res.status(200).json({
    success: true,
    message: 'Receipt marked as printed',
    data: { receipt },
  });
});

const reprintReceipt = asyncHandler(async (req, res) => {
  const receipt = await receiptService.reprintReceipt(req.params.id);

  mapReceiptUrls(req, receipt);

  return res.status(200).json({
    success: true,
    message: 'Receipt marked as reprinted',
    data: { receipt },
  });
});

const getReceiptPdf = asyncHandler(async (req, res) => {
  const buffer = await receiptService.generateReceiptPdf(req.params.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${req.params.id}.pdf"`);
  return res.status(200).send(buffer);
});

export {
  getReceipts,
  generateReceipt,
  getReceiptById,
  printReceipt,
  reprintReceipt,
  getReceiptPdf,
};
