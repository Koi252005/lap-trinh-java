// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tạo thư mục con theo loại file
        let subfolder = 'general';
        
        if (req.route && req.route.path) {
            if (req.route.path.includes('process')) {
                subfolder = 'processes';
            } else if (req.route.path.includes('product')) {
                subfolder = 'products';
            } else if (req.route.path.includes('delivery')) {
                subfolder = 'deliveries';
            } else if (req.route.path.includes('farm')) {
                subfolder = 'farms';
            }
        }

        const folderPath = path.join(uploadsDir, subfolder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Filter file types
const fileFilter = (req, file, cb) => {
    // Chỉ cho phép ảnh
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WEBP)'), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

/**
 * Middleware upload single file
 */
const uploadSingle = (fieldName = 'image') => {
    return upload.single(fieldName);
};

/**
 * Middleware upload multiple files
 */
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
    return upload.array(fieldName, maxCount);
};

/**
 * Middleware upload fields (nhiều field khác nhau)
 */
const uploadFields = (fields) => {
    return upload.fields(fields);
};

/**
 * Helper: Lấy URL của file đã upload
 */
const getFileUrl = (req, filename) => {
    if (!filename) return null;
    
    // Nếu đã là URL đầy đủ thì trả về luôn
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }
    
    // Tạo URL từ path
    const baseUrl = process.env.API_URL || 'http://localhost:5001';
    const relativePath = filename.replace(uploadsDir, '').replace(/\\/g, '/');
    return `${baseUrl}/uploads${relativePath}`;
};

/**
 * Helper: Xóa file
 */
const deleteFile = (filepath) => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            return true;
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
    return false;
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    getFileUrl,
    deleteFile,
    uploadsDir
};





