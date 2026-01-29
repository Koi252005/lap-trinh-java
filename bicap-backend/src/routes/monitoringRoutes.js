// src/routes/monitoringRoutes.js
const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/current/:farmId', verifyToken, monitoringController.getCurrentEnvironment);
router.get('/history/:farmId', verifyToken, monitoringController.getHistory);

module.exports = router;
