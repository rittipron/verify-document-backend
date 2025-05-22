const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ตั้งค่า storage สำหรับการอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');  // โฟลเดอร์สำหรับเก็บไฟล์
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่โดยใช้ UUID + ชื่อไฟล์เดิม
    const fileName = `${uuidv4()}-${file.originalname}`;
    cb(null, fileName);
  }
});

// กำหนดขนาดไฟล์สูงสุด และชนิดของไฟล์ที่สามารถอัปโหลดได้
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];  // ตัวอย่างไฟล์ที่อนุญาต
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG, and PDF are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // ขนาดไฟล์สูงสุด 10MB
  fileFilter: fileFilter
});

module.exports = upload;
