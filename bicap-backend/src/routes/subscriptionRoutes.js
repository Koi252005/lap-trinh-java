// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public: Xem danh sách gói (hoặc authenticated cũng được)
router.get('/packages', subscriptionController.getPackages);

// Private: Xem gói của mình
router.get('/my-subscription', verifyToken, requireRole(['farm']), subscriptionController.getMySubscription);

// Private: Mua gói
router.post('/subscribe', verifyToken, requireRole(['farm']), subscriptionController.subscribe);

module.exports = router;
