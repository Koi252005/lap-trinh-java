// src/routes/farmRoutes.js
const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Chỉ cho phép "farm" (Chủ trại) hoặc "admin" tạo trang trại
router.post('/', verifyToken, requireRole(['farm', 'admin']), farmController.createFarm);

// Get farm stats (Placed BEFORE /:id to prevent conflict if we had one, though here /my-farms is also specific)
router.get('/stats', verifyToken, requireRole(['farm', 'admin']), farmController.getFarmStats);

// Ai cũng có thể xem danh sách trang trại của chính mình (miễn là đã login)
router.get('/my-farms', verifyToken, requireRole(['farm', 'admin']), farmController.getMyFarms);


// Cập nhật thông tin trang trại
router.put('/:id', verifyToken, requireRole(['farm', 'admin']), farmController.updateFarm);

module.exports = router;