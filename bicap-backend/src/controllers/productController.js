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

    // Kiểm tra xem Farm có tồn tại không
    const farm = await Farm.findByPk(farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Trang trại không tồn tại' });
    }

    // Kiểm tra quyền: Chỉ chủ trại mới được thêm sản phẩm vào trại của mình
    if (farm.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm sản phẩm vào trại này' });
    }

    // Validate Season if provided (Traceability)
    if (seasonId) {
      const season = await FarmingSeason.findOne({ where: { id: seasonId, farmId } });
      if (!season) {
        return res.status(400).json({ message: 'Vụ mùa không hợp lệ' });
      }
      if (season.status !== 'completed') {
        return res.status(400).json({ message: 'Vụ mùa chưa kết thúc, chưa thể đăng bán sản phẩm' });
      }
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

    // Ghi dữ liệu lên Blockchain (Mock)
    const txHash = await blockchainHelper.writeToBlockchain(newProductData);

    const newProduct = await Product.create({
      ...newProductData,
      txHash // Lưu hash vào DB
    });

    // Generate QR code URL for the product
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(newProduct.id);

    res.status(201).json({
      message: 'Đăng bán sản phẩm thành công!',
      product: newProduct,
      qrCodeData: traceabilityURL,
      qrCodeImageUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/products/${newProduct.id}/qr-code`
    });

  } catch (error) {
    console.error(error);
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

    // 1. Check Product existence
    const product = await Product.findByPk(productId, {
      include: [
        { model: Farm, as: 'farm', attributes: ['name'] },
        { model: FarmingSeason, as: 'season', attributes: ['id', 'name'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // 2. Generate traceability URL
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(productId);

    // 3. Generate QR code based on format
    if (format === 'svg') {
      const svg = await qrGenerator.generateSVG(traceabilityURL, {
        width: parseInt(size)
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    } else {
      // Default: PNG
      const buffer = await qrGenerator.generateBuffer(traceabilityURL, {
        width: parseInt(size)
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-product-${productId}.png"`);
      return res.send(buffer);
    }

  } catch (error) {
    console.error('Error generating QR code:', error);
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

    // 1. Check Product existence
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // 2. Generate traceability URL
    const traceabilityURL = qrGenerator.generateProductTraceabilityURL(productId);

    // 3. Generate QR code as Data URL
    const dataURL = await qrGenerator.generateDataURL(traceabilityURL, {
      width: parseInt(size)
    });

    res.json({
      productId: productId,
      traceabilityURL: traceabilityURL,
      qrCodeDataURL: dataURL
    });

  } catch (error) {
    console.error('Error generating QR code Data URL:', error);
    res.status(500).json({ 
      message: 'Lỗi tạo mã QR', 
      error: error.message 
    });
  }
};