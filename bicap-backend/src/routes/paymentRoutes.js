// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Tạo payment request (Private - User đã đăng nhập)
router.post('/', verifyToken, paymentController.createPayment);

// VNPay Return URL (Public - VNPay sẽ redirect về đây)
router.get('/vnpay-return', paymentController.vnpayReturn);

// VNPay IPN (Public - VNPay sẽ gọi tự động)
router.post('/vnpay-ipn', paymentController.vnpayIpn);

// Lấy thông tin payment theo TxnRef (Private)
router.get('/txn-ref/:txnRef', verifyToken, paymentController.getPaymentByTxnRef);

// Lấy danh sách payments của tôi (Private)
router.get('/my-payments', verifyToken, paymentController.getMyPayments);

module.exports = router;





