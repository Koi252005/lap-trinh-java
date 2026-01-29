// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Tạo đơn hàng (Cho Retailer/User đã đăng nhập)
router.post('/', verifyToken, orderController.createOrder);

// Lấy danh sách đơn hàng của Retailer (Cho Retailer đã login)
router.get('/my-orders', verifyToken, requireRole(['retailer']), orderController.getMyOrders);

// Lấy danh sách đơn hàng của trang trại (Cho chủ trại)
router.get('/farm/:farmId', verifyToken, requireRole(['farm', 'admin']), orderController.getOrdersByFarm);

// Cập nhật trạng thái đơn hàng (Cho chủ trại)
router.put('/:id/status', verifyToken, requireRole(['farm', 'admin']), orderController.updateOrderStatus);

// Retailer Actions
router.put('/:id/cancel', verifyToken, requireRole(['retailer']), orderController.cancelOrder);
router.put('/:id/confirm-delivery', verifyToken, requireRole(['retailer']), uploadSingle('deliveryImage'), orderController.confirmDelivery);
router.put('/:id/pay-deposit', verifyToken, requireRole(['retailer']), orderController.payDeposit);
router.put('/:id/pay-remaining', verifyToken, requireRole(['retailer']), orderController.payRemaining);


module.exports = router;
