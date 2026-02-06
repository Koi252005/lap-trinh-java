// src/controllers/productController.js
const { Product, Farm, FarmingSeason } = require('../models');
const { Op } = require('sequelize'); // Import Op
const blockchainHelper = require('../utils/blockchainHelper');
const qrGenerator = require('../utils/qrGenerator');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// 1. Tạo lô sản phẩm mới (Đăng bán từ vụ mùa)
exports.createProduct = async (req, res) => {
  try {
    const { name, batchCode, quantity, price, farmId, seasonId } = req.body;

    // Check if user ID exists
    if (!req.user?.id) {
      return res.status(500).json({ 
        message: 'Database chưa kết nối hoặc người dùng chưa được đồng bộ. Vui lòng kết nối database và đăng nhập lại.' 
      });
    }

    // Kiểm tra xem Farm có tồn tại không
    let farm;
    try {
      farm = await Farm.findByPk(farmId);
    } catch (dbError) {
      if (dbError.name === 'SequelizeConnectionError' || dbError.name === 'SequelizeHostNotFoundError') {
        return res.status(500).json({ 
          message: 'Database chưa kết nối. Vui lòng kết nối database để tạo sản phẩm.' 
        });
      }
      throw dbError;
    }

    if (!farm) {
      return res.status(404).json({ message: 'Trang trại không tồn tại' });
    }

    // Kiểm tra quyền: Chỉ chủ trại mới được thêm sản phẩm vào trại của mình
    if (farm.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm sản phẩm vào trại này' });
    }

    // Validate Season if provided (Traceability) - cho phép cả vụ đang diễn ra (active) và đã kết thúc (completed)
    if (seasonId) {
      const season = await FarmingSeason.findOne({ where: { id: seasonId, farmId } });
      if (!season) {
        return res.status(400).json({ message: 'Vụ mùa không hợp lệ' });
      }
      if (season.status === 'cancelled') {
        return res.status(400).json({ message: 'Vụ mùa đã bị hủy, không thể đăng bán sản phẩm' });
      }
      // active hoặc completed đều được đăng bán
    }

    const newProductData = {
      name,
      batchCode,
      quantity,
      price: price || 0,
      farmId,
      seasonId, // Link to season
      status: 'available' // Ready to sell
    };

    // Ghi dữ liệu lên Blockchain (Mock) - Non-fatal if fails
    let txHash;
    try {
      txHash = await blockchainHelper.writeToBlockchain(newProductData);
    } catch (blockchainError) {
      console.error('Blockchain error (non-fatal):', blockchainError);
      txHash = null;
    }

    const newProduct = await Product.create({
      ...newProductData,
      txHash: txHash || null // Lưu hash vào DB (null if blockchain failed)
    });

    // Generate QR code URL for the product (always works)
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(newProduct.id);

    res.status(201).json({
      message: 'Đăng bán sản phẩm thành công!',
      product: newProduct,
      qrCodeData: traceabilityURL,
      qrCodeImageUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/products/${newProduct.id}/qr-code`,
      txHash: txHash || 'Blockchain chưa sẵn sàng'
    });

  } catch (error) {
    console.error('Create Product Error:', error);
    
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
      return res.status(500).json({ 
        message: 'Database chưa kết nối. Vui lòng kết nối database để tạo sản phẩm.' 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy danh sách sản phẩm theo Farm (Cho chủ trại quản lý)
exports.getProductsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;

    const products = await Product.findAll({
      where: { farmId },
      include: [{ model: FarmingSeason, as: 'season', attributes: ['name', 'startDate', 'endDate'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Lấy tất cả sản phẩm (Cho Marketplace)
exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    // Build basic where clause
    let whereClause = { status: 'available' };
    let farmWhereClause = {};

    if (search) {
      // Simple search: match product name OR farm name
      // However, referencing nested model in top-level OR is tricky.
      // Easiest is to search Product Name OR filter included Farm name.
      // But standard OR across tables requires special syntax or subqueries.

      // Let's try searching Product Name OR '$farm.name$' if we use subQuery: false
      whereClause[Op.and] = [
        { status: 'available' },
        {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { '$farm.name$': { [Op.like]: `%${search}%` } }
          ]
        }
      ];
      // Clean up the original status which is redundant in Op.and but safe.
      // Actually, let's redefine whereClause cleanly:
      whereClause = {
        status: 'available',
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { '$farm.name$': { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['name', 'address', 'certification'],
          // required: true ensures INNER JOIN so filtering by farm works if strict
        },
        { model: FarmingSeason, as: 'season', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      subQuery: false // Necessary when filtering by associated model fields with limit/offset (though we don't have pagination yet)
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm' });
  }
};

// 4. Get QR Code Image for Product
// @desc    Get QR Code Image for Product
// @route   GET /api/products/:productId/qr-code
// @access  Public (Anyone can scan QR to trace)
exports.getProductQRCode = async (req, res) => {
  try {
    const { productId } = req.params;
    const { format = 'png', size = 300 } = req.query;

    // Validate productId
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: 'Product ID không hợp lệ' });
    }

    // Validate size
    const qrSize = parseInt(size);
    if (isNaN(qrSize) || qrSize < 50 || qrSize > 2000) {
      return res.status(400).json({ message: 'Kích thước QR code phải từ 50 đến 2000 pixels' });
    }

    // 1. Check Product existence (optional - QR can work even if product doesn't exist in DB)
    let product = null;
    try {
      product = await Product.findByPk(productId, {
        include: [
          { model: Farm, as: 'farm', attributes: ['name'] },
          { model: FarmingSeason, as: 'season', attributes: ['id', 'name'] }
        ]
      });
    } catch (dbError) {
      // If database error, still generate QR code (traceability page will handle 404)
      console.warn('Database error when fetching product for QR, generating QR anyway:', dbError.message);
    }

    // 2. Generate traceability URL (always works)
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(productId);

    // 3. Generate QR code based on format
    try {
      if (format === 'svg') {
        const svg = await qrGenerator.generateSVG(traceabilityURL, {
          width: qrSize
        });
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.send(svg);
      } else {
        // Default: PNG
        const buffer = await qrGenerator.generateBuffer(traceabilityURL, {
          width: qrSize
        });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="qr-product-${productId}.png"`);
        return res.send(buffer);
      }
    } catch (qrError) {
      console.error('QR Generation Error:', qrError);
      return res.status(500).json({ 
        message: 'Lỗi tạo mã QR', 
        error: qrError.message 
      });
    }

  } catch (error) {
    console.error('Error in getProductQRCode:', error);
    res.status(500).json({ 
      message: 'Lỗi tạo mã QR', 
      error: error.message 
    });
  }
};

// 5. Get QR Code Data URL (Base64) for Product
// @desc    Get QR Code Data URL for Product
// @route   GET /api/products/:productId/qr-code-data
// @access  Public or Private
exports.getProductQRCodeDataURL = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size = 300 } = req.query;

    // Validate productId
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: 'Product ID không hợp lệ' });
    }

    // Validate size
    const qrSize = parseInt(size);
    if (isNaN(qrSize) || qrSize < 50 || qrSize > 2000) {
      return res.status(400).json({ message: 'Kích thước QR code phải từ 50 đến 2000 pixels' });
    }

    // 1. Check Product existence (optional - QR can work even if product doesn't exist)
    let product = null;
    try {
      product = await Product.findByPk(productId);
    } catch (dbError) {
      // If database error, still generate QR code
      console.warn('Database error when fetching product for QR, generating QR anyway:', dbError.message);
    }

    // 2. Generate traceability URL (always works)
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(productId);

    // 3. Generate QR code as Data URL
    try {
      const dataURL = await qrGenerator.generateDataURL(traceabilityURL, {
        width: qrSize
      });

      res.json({
        productId: productId,
        traceabilityURL: traceabilityURL,
        qrCodeDataURL: dataURL,
        productExists: product !== null
      });
    } catch (qrError) {
      console.error('QR Generation Error:', qrError);
      return res.status(500).json({ 
        message: 'Lỗi tạo mã QR', 
        error: qrError.message 
      });
    }

  } catch (error) {
    console.error('Error in getProductQRCodeDataURL:', error);
    res.status(500).json({ 
      message: 'Lỗi tạo mã QR', 
      error: error.message 
    });
  }
};