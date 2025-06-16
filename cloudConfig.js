const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'travel-archive_DEV',
    allowedFormats: ['png', 'jpg', 'jpeg'],
  },
});


module.exports = { cloudinary, storage };