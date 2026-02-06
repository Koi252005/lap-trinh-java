const { Sequelize } = require('sequelize');
require('dotenv').config();

// Host: DB_SERVER (Docker: sql_server) hoặc DB_HOST hoặc localhost (chạy local)
const dbHost = process.env.DB_SERVER || process.env.DB_HOST || 'localhost';
// Docker-compose dùng DB_PASS, thường thì dùng DB_PASSWORD
const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'BICAP',
  process.env.DB_USER || 'sa',
  dbPassword,
  {
    host: dbHost,
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