/**
 * Logic seed sản phẩm - dùng khi khởi động server (Docker) và khi gọi POST /api/seed
 */
const { Product, Farm, User } = require('../models');

const sampleProducts = [
  { name: 'Rau Xà Lách Tươi', batchCode: 'BATCH-LETTUCE-001', quantity: 50, price: 25000, status: 'available' },
  { name: 'Cà Chua Bi Đỏ', batchCode: 'BATCH-TOMATO-001', quantity: 30, price: 35000, status: 'available' },
  { name: 'Dưa Chuột Sạch', batchCode: 'BATCH-CUCUMBER-001', quantity: 40, price: 20000, status: 'available' },
  { name: 'Ớt Chuông Đỏ', batchCode: 'BATCH-BELLPEPPER-001', quantity: 25, price: 45000, status: 'available' },
  { name: 'Cải Bó Xôi', batchCode: 'BATCH-SPINACH-001', quantity: 35, price: 30000, status: 'available' },
  { name: 'Cà Rốt Tươi', batchCode: 'BATCH-CARROT-001', quantity: 60, price: 22000, status: 'available' },
  { name: 'Rau Muống', batchCode: 'BATCH-WATERSPINACH-001', quantity: 45, price: 15000, status: 'available' },
  { name: 'Bắp Cải Xanh', batchCode: 'BATCH-CABBAGE-001', quantity: 40, price: 18000, status: 'available' },
  { name: 'Dâu Tây', batchCode: 'BATCH-STRAWBERRY-001', quantity: 20, price: 120000, status: 'available' },
  { name: 'Cam Sành', batchCode: 'BATCH-ORANGE-001', quantity: 55, price: 28000, status: 'available' },
];

async function runSeed() {
  let farmUser = await User.findOne({ where: { role: 'farm' } });
  if (!farmUser) farmUser = await User.findOne({ order: [['id', 'ASC']] });
  if (!farmUser) {
    const [u] = await User.findOrCreate({
      where: { email: 'farm@bicap.local' },
      defaults: { fullName: 'Chủ Trại Mẫu', email: 'farm@bicap.local', role: 'farm', status: 'active' }
    });
    farmUser = u;
  }

  let farm = await Farm.findOne({ where: { name: 'Trang Trại Mẫu' } });
  if (!farm) {
    farm = await Farm.create({
      name: 'Trang Trại Mẫu',
      address: 'Huyện Củ Chi, TP.HCM',
      description: 'Trang trại mẫu',
      certification: 'VietGAP',
      location_coords: '10.8231,106.6297',
      ownerId: farmUser.id
    });
  }

  const created = [];
  for (const p of sampleProducts) {
    const [product, isNew] = await Product.findOrCreate({
      where: { batchCode: p.batchCode },
      defaults: {
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        status: p.status,
        farmId: farm.id,
        txHash: `MOCK_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });
    if (isNew) created.push({ id: product.id, name: product.name });
    else if (product.status !== 'available') {
      product.status = 'available';
      await product.save();
    }
  }

  const all = await Product.findAll({ where: { status: 'available' }, attributes: ['id', 'name', 'price', 'quantity'] });
  return { created, totalAvailable: all.length, products: all };
}

module.exports = { runSeed, sampleProducts };
