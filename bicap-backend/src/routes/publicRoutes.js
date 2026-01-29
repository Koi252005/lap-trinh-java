// src/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Tất cả routes đều public (không cần authentication)

// Marketplace - Sản phẩm
router.get('/products', publicController.getPublicProducts);
router.get('/products/:id', publicController.getPublicProduct);

// Truy xuất nguồn gốc
router.get('/traceability/:id', publicController.getTraceability); // Từ Season ID
router.get('/traceability/product/:id', publicController.getProductTraceability); // Từ Product ID

// Trang trại công khai
router.get('/farms', publicController.getPublicFarms);
router.get('/farms/:id', publicController.getPublicFarm);

module.exports = router;





