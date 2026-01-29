// src/routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Middleware cho tất cả routes: yêu cầu authentication và role driver/shipping/admin
const driverAuth = [verifyToken, requireRole(['driver', 'shipping', 'admin'])];

// Lấy thống kê của Driver
router.get('/stats', driverAuth, driverController.getDriverStats);

// Lấy danh sách vận đơn của tôi
router.get('/shipments', driverAuth, driverController.getMyShipments);

// Lấy chi tiết một vận đơn
router.get('/shipments/:id', driverAuth, driverController.getShipmentById);

// Cập nhật vị trí GPS
router.put('/location', driverAuth, driverController.updateLocation);

// Xác nhận nhận hàng (quét QR) - Note: shipmentId trong body, không phải params
router.post('/shipments/pickup', driverAuth, driverController.confirmPickup);

// Xác nhận giao hàng (quét QR) - Note: shipmentId trong body, không phải params
router.post('/shipments/delivery', driverAuth, driverController.confirmDelivery);

// Cập nhật trạng thái vận chuyển
router.put('/shipments/:id/status', driverAuth, driverController.updateShipmentStatus);

module.exports = router;

