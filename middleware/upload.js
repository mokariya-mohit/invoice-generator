const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Cloudinary storage setup for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'invoices', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed formats for invoice images
  },
});

const upload = multer({ storage });

module.exports = upload;
