import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;

export const createUploader = (
  subDir,
  allowedExtensions = ALLOWED_EXTENSIONS,
  maxSize = DEFAULT_MAX_SIZE,
) => {
  const uploadDir = path.join(BASE_UPLOAD_DIR, subDir);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: maxSize } });
};

const adminUpload = createUploader('admin-profile');

export default adminUpload;
