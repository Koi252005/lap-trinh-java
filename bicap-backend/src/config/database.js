const { Sequelize } = require('sequelize');
require('dotenv').config();

// Khởi tạo kết nối Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Tên DB: BICAP
  process.env.DB_USER,      // User: sa
  process.env.DB_PASSWORD,  // ✅ ĐÃ SỬA: Dùng đúng tên DB_PASSWORD trong .env
  {
    host: process.env.DB_SERVER || 'localhost', // ✅ ĐÃ SỬA: Dùng đúng tên DB_SERVER trong .env
    port: 1433,
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG! (SQL Server)');
  } catch (error) {
    console.error('❌ KẾT NỐI DATABASE THẤT BẠI:', error);
    console.error('Chi tiết lỗi:', error.original || error);
  }
};

module.exports = { sequelize, connectDB };