const express = require('express');
const cors = require('cors');
require('dotenv').config();

// SỬA DÒNG NÀY: Import từ models/index thay vì config/database
const { connectDB } = require('./src/config/database');
const { initModels } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const farmRoutes = require('./src/routes/farmRoutes');
const seasonRoutes = require('./src/routes/seasonRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const shipmentRoutes = require('./src/routes/shipmentRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const monitoringRoutes = require('./src/routes/monitoringRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Serve static files (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Hàm khởi tạo hệ thống
const startServer = async () => {
  // Start server ngay lập tức, không chờ database
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  });

  // Kết nối Database trong background (không block server)
  try {
    await connectDB();
    try {
      await initModels();
      console.log('✅ Database models initialized');
      // Tự động seed sản phẩm nếu chưa có (Docker / lần chạy đầu)
      try {
        const { Product, User } = require('./src/models');
        const productCount = await Product.count({ where: { status: 'available' } }).catch(() => 0);
        if (productCount === 0) {
          const { runSeed } = require('./src/utils/seedProducts');
          await runSeed();
          console.log('🌱 Đã tự động tạo sản phẩm mẫu (seed)');
        }
        const driverCount = await User.count({ where: { role: 'driver' } }).catch(() => 0);
        if (driverCount < 8) {
          const { seedDrivers } = require('./src/utils/seedProducts');
          await seedDrivers();
          const total = await User.count({ where: { role: 'driver' } });
          console.log('🚚 Đã tạo đủ 8 tài xế mẫu (tổng:', total, ')');
        }
      } catch (seedErr) {
        console.warn('⚠️  Auto-seed skipped:', seedErr.message);
      }
    } catch (modelError) {
      console.warn('⚠️  Model initialization failed:', modelError.message);
    }
  } catch (error) {
    console.error('❌ Database connection failed (server still running):', error.message);
    console.log('⚠️  Server running in degraded mode - some features may not work');
  }
};

startServer();

// Routes

app.get('/', (req, res) => {
  res.send('🚀 BICAP Backend is Running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// GET /api/drivers - Luôn trả 200 + mảng (tránh 500 cho trang Tài xế & Đội xe)
app.get('/api/drivers', (req, res) => {
  const { User } = require('./src/models');
  User.findAll({
    where: { role: 'driver' },
    attributes: ['id', 'fullName', 'phone', 'email', 'status'],
    order: [['id', 'ASC']],
  })
    .then((drivers) => {
      const list = (drivers || []).map((d) => ({
        id: d.id,
        fullName: d.fullName,
        name: d.fullName,
        phone: d.phone,
        email: d.email,
        vehicle: 'Xe tải',
        plate: '---',
        status: 'Rảnh',
        current_job: null,
      }));
      res.status(200).json(list);
    })
    .catch((err) => {
      console.error('GET /api/drivers:', err);
      res.status(200).json([]);
    });
});

app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/seed', require('./src/routes/seedRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/tasks', require('./src/routes/seasonTaskRoutes'));