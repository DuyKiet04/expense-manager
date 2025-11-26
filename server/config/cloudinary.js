// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
console.log("--- KIỂM TRA CLOUDINARY ---");
console.log("Cloud Name:", process.env.CLOUDINARY_NAME);
console.log("API Key:", process.env.CLOUDINARY_KEY);
console.log("---------------------------");
// Lấy cấu hình từ file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Cấu hình nơi lưu trữ
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'expense-manager', // Tên thư mục sẽ tạo trên Cloudinary
    allowedFormats: ['jpeg', 'png', 'jpg'] // Chỉ cho phép file ảnh
  }
});

// Tạo middleware upload
const upload = multer({ storage });

module.exports = upload;