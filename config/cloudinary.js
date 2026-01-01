const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// If { CloudinaryStorage } is undefined, try the direct require
const StorageConstructor = CloudinaryStorage || require('multer-storage-cloudinary').CloudinaryStorage;

const storage = new StorageConstructor({
    cloudinary: cloudinary,
    params: {
        folder: 'wedding_packages',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

module.exports = upload;