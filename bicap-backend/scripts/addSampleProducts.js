/**
 * Script tạo sản phẩm mẫu trong DB
 * Chạy: npm run seed  (dùng DB từ .env)
 * Hoặc: npm run seed:local  (dùng localhost, khi .env có DB_SERVER=sql_server)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Nếu có tham số --local thì dùng localhost
if (process.argv.includes('--local')) {
  process.env.DB_SERVER = 'localhost';
  process.env.DB_HOST = 'localhost';
  console.log('📍 Dùng DB_SERVER=localhost');
}

const { sequelize } = require('../src/config/database');
const { Product, Farm, User, initModels } = require('../src/models');

// Product model KHÔNG có field description - chỉ dùng các field sau
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
  { name: 'Khoai Tây', batchCode: 'BATCH-POTATO-001', quantity: 70, price: 18000, status: 'available' },
  { name: 'Cải Thảo', batchCode: 'BATCH-BOKCHOY-001', quantity: 35, price: 20000, status: 'available' },
  { name: 'Ớt Hiểm', batchCode: 'BATCH-CHILI-001', quantity: 28, price: 65000, status: 'available' },
  { name: 'Bí Đỏ', batchCode: 'BATCH-PUMPKIN-001', quantity: 25, price: 15000, status: 'available' },
  { name: 'Nấm Bào Ngư', batchCode: 'BATCH-MUSHROOM-001', quantity: 18, price: 85000, status: 'available' },
];

async function addSampleProducts() {
  try {
    console.log('🔄 Đang kết nối database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Đồng bộ bảng (tạo nếu chưa có)
    console.log('🔄 Đang đồng bộ schema...');
    await sequelize.sync({ alter: false });
    try {
      await initModels();
    } catch (e) {
      console.warn('⚠️  initModels:', e.message);
    }
    console.log('✅ Schema sẵn sàng!');

    // 1. Tìm hoặc tạo User
    let farmUser = await User.findOne({ where: { role: 'farm' } });
    if (!farmUser) farmUser = await User.findOne({ order: [['id', 'ASC']] });
    if (!farmUser) {
      farmUser = await User.findOrCreate({
        where: { email: 'farm@bicap.local' },
        defaults: {
          fullName: 'Chủ Trại Mẫu',
          email: 'farm@bicap.local',
          role: 'farm',
          status: 'active',
        }
      }).then(([u]) => u);
      console.log('✅ Đã tạo user farm mẫu (farm@bicap.local, id=' + farmUser.id + ')');
    } else {
      console.log('✅ Dùng user hiện có: id=' + farmUser.id + ', role=' + farmUser.role);
    }

    // 2. Tìm hoặc tạo Farm
    let sampleFarm = await Farm.findOne({ where: { name: 'Trang Trại Mẫu' } });
    if (!sampleFarm) {
      sampleFarm = await Farm.create({
        name: 'Trang Trại Mẫu',
        address: 'Huyện Củ Chi, TP.HCM',
        description: 'Trang trại mẫu chuyên trồng rau sạch',
        certification: 'VietGAP',
        location_coords: '10.8231,106.6297',
        ownerId: farmUser.id
      });
      console.log('✅ Đã tạo trang trại mẫu (id=' + sampleFarm.id + ')');
    } else {
      console.log('✅ Dùng trang trại hiện có: id=' + sampleFarm.id);
    }

    // 3. Thêm sản phẩm
    const createdIds = [];
    let addedCount = 0;
    for (const productData of sampleProducts) {
      const [product, created] = await Product.findOrCreate({
        where: { batchCode: productData.batchCode },
        defaults: {
          name: productData.name,
          quantity: productData.quantity,
          price: productData.price,
          status: productData.status,
          farmId: sampleFarm.id,
          txHash: `MOCK_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
      if (created) {
        addedCount++;
        createdIds.push(product.id);
        console.log(`  ✅ Thêm: ${product.name} (id=${product.id})`);
      } else {
        // Cập nhật status nếu đã distributed
        if (product.status !== 'available') {
          product.status = 'available';
          await product.save();
          console.log(`  🔄 Cập nhật status: ${product.name} (id=${product.id})`);
        } else {
          console.log(`  ⏭️  Đã có: ${product.name} (id=${product.id})`);
        }
      }
    }

    // 4. Liệt kê sản phẩm available
    const allProducts = await Product.findAll({
      where: { status: 'available', farmId: sampleFarm.id },
      attributes: ['id', 'name', 'price', 'quantity', 'status']
    });
    console.log('\n📦 Sản phẩm có thể đặt hàng (' + allProducts.length + '):');
    allProducts.forEach(p => console.log(`   id=${p.id} | ${p.name} | ${p.price}đ/kg | còn ${p.quantity}kg`));

    console.log('\n✅ Hoàn thành! Đã thêm ' + addedCount + ' sản phẩm mới.');
    console.log('💡 Vào sàn retailer, chọn sản phẩm và đặt hàng.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.original) console.error('   Chi tiết:', error.original.message);
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
      console.error('\n⚠️  Database chưa kết nối. Kiểm tra:');
      console.error('   - SQL Server đang chạy');
      console.error('   - .env: DB_SERVER=localhost (hoặc tên host), DB_NAME, DB_USER, DB_PASSWORD');
    }
    process.exit(1);
  }
}

addSampleProducts();
