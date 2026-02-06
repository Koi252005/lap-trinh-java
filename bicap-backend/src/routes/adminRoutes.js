// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Tất cả routes đều yêu cầu authentication và role admin
const adminAuth = [verifyToken, requireRole(['admin'])];

// Dashboard
router.get('/dashboard', adminAuth, adminController.getDashboard);

// User Management
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserById);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.put('/users/email/:email', adminAuth, adminController.updateUserByEmail);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Farm Management
router.get('/farms', adminAuth, adminController.getFarms);
router.get('/farms/:id', adminAuth, adminController.getFarmById);
router.put('/farms/:id/approve', adminAuth, adminController.approveFarm);

// Report Management
router.get('/reports', adminAuth, adminController.getReports);
router.put('/reports/:id/status', adminAuth, adminController.updateReportStatus);

// Order Management
router.get('/orders', adminAuth, adminController.getAllOrders);

module.exports = router;





