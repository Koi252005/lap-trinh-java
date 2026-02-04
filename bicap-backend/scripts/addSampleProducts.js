// Script để thêm sản phẩm mẫu vào chợ nông sản
require('dotenv').config();
const { sequelize } = require('../src/config/database');
const { Product, Farm, User } = require('../src/models');

const sampleProducts = [
  {
    name: 'Rau Xà Lách Tươi',
    batchCode: 'BATCH-LETTUCE-001',
    quantity: 50,
    price: 25000, // 25,000 VND/kg
    status: 'available',
    description: 'Rau xà lách tươi ngon, trồng theo phương pháp hữu cơ, không sử dụng thuốc trừ sâu'
  },
  {
    name: 'Cà Chua Bi Đỏ',
    batchCode: 'BATCH-TOMATO-001',
    quantity: 30,
    price: 35000, // 35,000 VND/kg
    status: 'available',
    description: 'Cà chua bi đỏ tươi, ngọt tự nhiên, giàu vitamin C'
  },
  {
    name: 'Dưa Chuột Sạch',
    batchCode: 'BATCH-CUCUMBER-001',
    quantity: 40,
    price: 20000, // 20,000 VND/kg
    status: 'available',
    description: 'Dưa chuột giòn, mát, trồng trong nhà kính, đảm bảo vệ sinh an toàn thực phẩm'
  },
  {
    name: 'Ớt Chuông Đỏ',
    batchCode: 'BATCH-BELLPEPPER-001',
    quantity: 25,
    price: 45000, // 45,000 VND/kg
    status: 'available',
    description: 'Ớt chuông đỏ tươi, giòn ngọt, giàu vitamin A và C'
  },
  {
    name: 'Cải Bó Xôi',
    batchCode: 'BATCH-SPINACH-001',
    quantity: 35,
    price: 30000, // 30,000 VND/kg
    status: 'available',
    description: 'Cải bó xôi tươi, giàu sắt và chất xơ, tốt cho sức khỏe'
  },
  {
    name: 'Cà Rốt Tươi',
    batchCode: 'BATCH-CARROT-001',
    quantity: 60,
    price: 22000,
    status: 'available',
    description: 'Cà rốt tươi ngon, giàu beta-carotene, tốt cho mắt'
  },
  {
    name: 'Rau Muống',
    batchCode: 'BATCH-WATERSPINACH-001',
    quantity: 45,
    price: 15000,
    status: 'available',
    description: 'Rau muống tươi, giòn ngọt, trồng sạch'
  },
  {
    name: 'Bắp Cải Xanh',
    batchCode: 'BATCH-CABBAGE-001',
    quantity: 40,
    price: 18000,
    status: 'available',
    description: 'Bắp cải xanh tươi, giàu vitamin K'
  },
  {
    name: 'Dâu Tây',
    batchCode: 'BATCH-STRAWBERRY-001',
    quantity: 20,
    price: 120000,
    status: 'available',
    description: 'Dâu tây Đà Lạt, ngọt thơm'
  },
  {
    name: 'Cam Sành',
    batchCode: 'BATCH-ORANGE-001',
    quantity: 55,
    price: 28000,
    status: 'available',
    description: 'Cam sành ngọt, nhiều nước, giàu vitamin C'
  },
  {
    name: 'Khoai Tây',
    batchCode: 'BATCH-POTATO-001',
    quantity: 70,
    price: 18000,
    status: 'available',
    description: 'Khoai tây tươi, không mầm'
  },
  {
    name: 'Cải Thảo',
    batchCode: 'BATCH-BOKCHOY-001',
    quantity: 35,
    price: 20000,
    status: 'available',
    description: 'Cải thảo tươi, lá xanh non'
  },
  {
    name: 'Ớt Hiểm',
    batchCode: 'BATCH-CHILI-001',
    quantity: 28,
    price: 65000,
    status: 'available',
    description: 'Ớt hiểm cay nồng, tươi'
  },
  {
    name: 'Bí Đỏ',
    batchCode: 'BATCH-PUMPKIN-001',
    quantity: 25,
    price: 15000,
    status: 'available',
    description: 'Bí đỏ ngọt, giàu vitamin A'
  },
  {
    name: 'Nấm Bào Ngư',
    batchCode: 'BATCH-MUSHROOM-001',
    quantity: 18,
    price: 85000,
    status: 'available',
    description: 'Nấm bào ngư tươi, sạch'
  }
];

async function addSampleProducts() {
  try {
    // Kết nối database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    // Tìm hoặc tạo farm mẫu
    let sampleFarm = await Farm.findOne({ where: { name: 'Trang Trại Mẫu' } });
    
    if (!sampleFarm) {
      // Tìm user có role farm hoặc tạo farm với ownerId = 1
      const farmUser = await User.findOne({ 
        where: { role: 'farm' },
        limit: 1 
      });

      sampleFarm = await Farm.create({
        name: 'Trang Trại Mẫu',
        address: 'Huyện Củ Chi, TP.HCM',
        description: 'Trang trại mẫu chuyên trồng rau sạch',
        certification: 'VietGAP',
        location_coords: '10.8231,106.6297',
        ownerId: farmUser ? farmUser.id : 1
      });
      console.log('✅ Đã tạo trang trại mẫu');
    }

    // Thêm sản phẩm mẫu
    let addedCount = 0;
    for (const productData of sampleProducts) {
      // Kiểm tra xem sản phẩm đã tồn tại chưa
      const existing = await Product.findOne({ 
        where: { batchCode: productData.batchCode } 
      });

      if (!existing) {
        await Product.create({
          ...productData,
          farmId: sampleFarm.id,
          txHash: `MOCK_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        addedCount++;
        console.log(`✅ Đã thêm: ${productData.name}`);
      } else {
        console.log(`⏭️  Đã tồn tại: ${productData.name}`);
      }
    }

    console.log(`\n✅ Hoàn thành! Đã thêm ${addedCount} sản phẩm mới.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
      console.error('⚠️  Database chưa kết nối. Vui lòng kiểm tra cấu hình database.');
    }
    process.exit(1);
  }
}

addSampleProducts();
