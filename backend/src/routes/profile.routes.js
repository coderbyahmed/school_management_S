import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
