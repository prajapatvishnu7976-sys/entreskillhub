const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const initializeCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === 'your-cloud-name') {
    console.warn('⚠️  Cloudinary credentials missing or invalid. Image uploads disabled.');
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log('☁️  Cloudinary configured successfully');
  return cloudinary;
};

// Storage configurations
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreskillhub/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `profile-${uniqueSuffix}`;
    },
  },
});

const resourceImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreskillhub/resources',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 630, crop: 'fill' }],
    public_id: (req, file) => `resource-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreskillhub/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
    public_id: (req, file) => `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

const businessImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'entreskillhub/business-ideas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fill' }],
    public_id: (req, file) => `business-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

// File filters
const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images allowed.`), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only PDF/DOC allowed.`), false);
  }
};

// Multer instances
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const uploadResourceImage = multer({
  storage: resourceImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

const uploadBusinessImage = multer({
  storage: businessImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const uploadMultipleImages = multer({
  storage: resourceImageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// Utility functions
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    console.log(`🗑️  Cloudinary file deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Cloudinary delete error: ${error.message}`);
    return null;
  }
};

const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    if (!publicIds || publicIds.length === 0) return null;
    return await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
  } catch (error) {
    console.error(`❌ Cloudinary bulk delete error: ${error.message}`);
    return null;
  }
};

const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, { quality: 'auto', fetch_format: 'auto', width: 800, crop: 'fill', ...options });
};

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const relevantParts = parts.slice(uploadIndex + 2);
    return relevantParts.join('/').replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const checkCloudinaryConfig = async () => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name') {
      console.warn('⚠️  Cloudinary not configured - skipping verification');
      return false;
    }
    const result = await cloudinary.api.ping();
    console.log('☁️  Cloudinary connection verified:', result.status);
    return result.status === 'ok';
  } catch (error) {
    console.error('❌ Cloudinary config error:', error.message);
    return false;
  }
};

module.exports = {
  cloudinary,
  initializeCloudinary,
  uploadProfileImage,
  uploadResourceImage,
  uploadDocument,
  uploadBusinessImage,
  uploadMultipleImages,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedUrl,
  extractPublicId,
  checkCloudinaryConfig,
  profileImageStorage,
  resourceImageStorage,
  documentStorage,
  businessImageStorage,
  imageFileFilter,
  documentFileFilter,
};