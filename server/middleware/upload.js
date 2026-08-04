// ============================================
// EntreSkillHub - File Upload Middleware
// Multer configuration for file uploads
// ============================================

const multer = require('multer');
const path = require('path');
const ApiResponse = require('../utils/apiResponse');
const {
  uploadProfileImage,
  uploadResourceImage,
  uploadDocument,
  uploadBusinessImage,
  uploadMultipleImages,
} = require('../config/cloudinary');

// ============================================
// Memory Storage (for temporary uploads)
// ============================================
const memoryStorage = multer.memoryStorage();

// ============================================
// General File Filter
// ============================================
const generalFileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
    }
  };
};

// ============================================
// Memory-based upload (temporary storage)
// ============================================
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: generalFileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ]),
});

// ============================================
// Wrapper Middleware Functions
// ============================================

// Single file upload wrapper with error handling
const handleUpload = (uploadFunction, fieldName) => {
  return (req, res, next) => {
    const upload = uploadFunction.single(fieldName);

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return ApiResponse.badRequest(res, `Upload error: ${err.message}`, { code: err.code });
        }
        return ApiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

// Multiple files upload wrapper
const handleMultipleUpload = (uploadFunction, fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const upload = uploadFunction.array(fieldName, maxCount);

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return ApiResponse.badRequest(res, `Upload error: ${err.message}`, { code: err.code });
        }
        return ApiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

// Multi-field upload wrapper (different fields with different files)
const handleFieldsUpload = (uploadFunction, fields) => {
  return (req, res, next) => {
    const upload = uploadFunction.fields(fields);

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return ApiResponse.badRequest(res, `Upload error: ${err.message}`, { code: err.code });
        }
        return ApiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

// ============================================
// Ready-to-use Upload Middlewares
// ============================================

// Profile image upload
exports.uploadProfileImageMiddleware = handleUpload(uploadProfileImage, 'profileImage');

// Resource thumbnail upload
exports.uploadResourceImageMiddleware = handleUpload(uploadResourceImage, 'thumbnail');

// Document upload
exports.uploadDocumentMiddleware = handleUpload(uploadDocument, 'document');

// Business idea image upload
exports.uploadBusinessImageMiddleware = handleUpload(uploadBusinessImage, 'coverImage');

// Multiple images upload (gallery)
exports.uploadGalleryMiddleware = handleMultipleUpload(uploadMultipleImages, 'gallery', 5);

// Session attachments
exports.uploadSessionFileMiddleware = handleUpload(uploadDocument, 'attachment');

// Mentor verification documents
exports.uploadMentorDocsMiddleware = handleFieldsUpload(uploadDocument, [
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'educationCertificate', maxCount: 3 },
  { name: 'experienceLetter', maxCount: 3 },
]);

// Business idea full upload (cover + gallery)
exports.uploadBusinessFullMiddleware = handleFieldsUpload(uploadBusinessImage, [
  { name: 'coverImage', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
]);

// ============================================
// File Size Formatter
// ============================================
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================
// Validate File Presence
// ============================================
exports.requireFile = (fieldName = 'file') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return ApiResponse.badRequest(res, `${fieldName} is required.`);
    }
    next();
  };
};

// ============================================
// Optional file middleware (doesn't fail if no file)
// ============================================
exports.optionalUpload = (uploadFunction, fieldName) => {
  return (req, res, next) => {
    const upload = uploadFunction.single(fieldName);

    upload(req, res, (err) => {
      if (err && !(err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE')) {
        if (err instanceof multer.MulterError) {
          return ApiResponse.badRequest(res, `Upload error: ${err.message}`);
        }
        return ApiResponse.badRequest(res, err.message);
      }
      next();
    });
  };
};

// ============================================
// Export handlers for custom usage
// ============================================
exports.handleUpload = handleUpload;
exports.handleMultipleUpload = handleMultipleUpload;
exports.handleFieldsUpload = handleFieldsUpload;
exports.memoryUpload = memoryUpload;