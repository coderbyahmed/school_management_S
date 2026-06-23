import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
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
  const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Only ${allowedExtensions.join(', ')} files are allowed`), false);
    }
  };

  return multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: maxSize } });
};

export const writeUploadFile = (buffer, subDir, originalname) => {
  const dir = path.join(BASE_UPLOAD_DIR, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const ext = path.extname(originalname).toLowerCase();
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return filename;
};

const adminUpload = createUploader('admin-profile');

export default adminUpload;
