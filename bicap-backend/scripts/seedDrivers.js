/**
 * Script tạo 7 tài xế mẫu trong DB.
 * Chạy từ thư mục bicap-backend: node scripts/seedDrivers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { connectDB } = require('../src/config/database');
const { initModels } = require('../src/models');
const { seedDrivers } = require('../src/utils/seedProducts');

async function main() {
  try {
    console.log('🔄 Đang kết nối database...');
    await connectDB();
    await initModels();
    console.log('🔄 Đang tạo tài xế mẫu...');
    const created = await seedDrivers();
    const { User } = require('../src/models');
    const total = await User.count({ where: { role: 'driver' } });
    console.log('✅ Thành công! Đã tạo thêm:', created.length, '| Tổng tài xế:', total, '(cần 8 cho demo)');
    if (created.length) console.log('   Tên:', created.join(', '));
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
