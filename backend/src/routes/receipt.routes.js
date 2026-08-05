import express from 'express';
import {
  getReceipts,
  generateReceipt,
  getReceiptById,
  printReceipt,
  reprintReceipt,
  getReceiptPdf,
} from '../controllers/receipt.controller.js';
import {
  validateReceiptId,
  validateReceiptHistoryQuery,
  validateGenerateReceipt,
} from '../validations/receipt.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  validateReceiptHistoryQuery,
  getReceipts,
);

router.post(
  '/generate',
  protect,
  authorize('admin'),
  validateGenerateReceipt,
  generateReceipt,
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  validateReceiptId,
  getReceiptById,
);

router.get(
  '/:id/print',
  protect,
  authorize('admin'),
  validateReceiptId,
  printReceipt,
);

router.get(
  '/:id/reprint',
  protect,
  authorize('admin'),
  validateReceiptId,
  reprintReceipt,
);

router.get(
  '/:id/pdf',
  protect,
  authorize('admin'),
  validateReceiptId,
  getReceiptPdf,
);

export default router;
