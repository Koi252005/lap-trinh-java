// Script để cấp quyền admin cho user
require('dotenv').config();
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

async function makeAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'khoiphan252005@gmail.com';
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      console.log('💡 Hãy đảm bảo user đã đăng ký và sync từ Firebase.');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`✅ Đã cấp quyền admin cho: ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Tên: ${user.fullName || 'N/A'}`);
    console.log(`   Role: ${user.role}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

makeAdmin();
