// src/routes/shipmentRoutes.js
const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
// --- QUAN TRỌNG NHẤT: Dòng này mở cổng cho /api/shipments ---
router.get('/', shipmentController.getAllShipments);

// Tạo vận đơn (Chủ trại)
router.post('/', verifyToken, requireRole(['farm', 'admin', 'shipping_manager']), shipmentController.createShipment);

// Lấy danh sách vận đơn theo Farm (Chủ trại)
router.get('/farm/:farmId', verifyToken, requireRole(['farm', 'admin']), shipmentController.getShipmentsByFarm);

// Cập nhật trạng thái (Tài xế, Chủ trại)
router.put('/:id/status', verifyToken, shipmentController.updateShipmentStatus);

module.exports = router;
