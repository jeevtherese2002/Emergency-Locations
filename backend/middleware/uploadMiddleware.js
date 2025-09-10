// middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set destination folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads/profile';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user._id}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
};

export const uploadProfilePic = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
}).single('profilePic');
