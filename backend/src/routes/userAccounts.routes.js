import express from 'express';
import {
  getAllAccounts,
  getAccountByLoginId,
  resetPassword,
  getPasswordManagementData,
} from '../controllers/userAccounts.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/accounts', getAllAccounts);
router.get('/accounts/:loginId', getAccountByLoginId);
router.post('/accounts/reset-password', resetPassword);
router.get('/password-management', getPasswordManagementData);

export default router;
