// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, notificationController.getMyNotifications);
router.put('/:id/read', verifyToken, notificationController.markRead);

router.post('/send', verifyToken, notificationController.sendNotificationToUser);

module.exports = router;
