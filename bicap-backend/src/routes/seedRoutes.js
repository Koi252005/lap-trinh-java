const express = require('express');
const router = express.Router();
const { runSeed } = require('../utils/seedProducts');
const { Product } = require('../models');

// GET /api/seed - trạng thái: có bao nhiêu sản phẩm (để frontend biết có cần hiện nút seed)
router.get('/', async (req, res) => {
  try {
    const count = await Product.count({ where: { status: 'available' } }).catch(() => 0);
    res.json({ productCount: count, needsSeed: count === 0 });
  } catch (e) {
    res.json({ productCount: 0, needsSeed: true });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await runSeed();
    res.json({
      message: 'Seed thành công',
      created: result.created.length,
      totalAvailable: result.totalAvailable,
      products: result.products.map(p => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity }))
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Lỗi seed', error: err.message });
  }
});

module.exports = router;
