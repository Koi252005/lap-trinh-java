// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { optionalUploadSingle } = require('../middleware/uploadMiddleware');

// Tạo sản phẩm (Chỉ chủ trại) - nhận JSON hoặc multipart (ảnh tùy chọn)
router.post('/', verifyToken, requireRole(['farm', 'admin']), optionalUploadSingle('image'), productController.createProduct);

// Xem tất cả sản phẩm (Marketplace - Public)
router.get('/', productController.getAllProducts);

// Xem sản phẩm của một trang trại cụ thể (Công khai hoặc cần login tùy logic, ở đây để cần login cho chắc)
router.get('/farm/:farmId', verifyToken, productController.getProductsByFarm);

// QR Code endpoints (MUST be before /:productId to avoid route conflict)
// Get QR Code Image (Public - for scanning)
router.get('/:productId/qr-code', productController.getProductQRCode);

// Get QR Code Data URL (Public or Private)
router.get('/:productId/qr-code-data', productController.getProductQRCodeDataURL);

module.exports = router;