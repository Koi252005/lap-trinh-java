// bicap-backend/seed.js
const { sequelize, User, Farm, Product, Order, Shipment } = require('./src/models');

// 🛠️ CẤU HÌNH SỐ LƯỢNG NGƯỜI MUỐN TẠO Ở ĐÂY
const SO_LUONG_TAI_XE = 10; // <--- Bạn muốn 100 người thì sửa số này

async function seed() {
  try {
    console.log(`🔥 Đang khởi tạo dữ liệu cho ${SO_LUONG_TAI_XE} tài xế...`);
    
    // 1. Reset Database sạch sẽ
    await sequelize.sync({ force: true }); 

    // 2. Tạo các vai trò cố định (Admin, Shop, Nông trại)
    const admin = await User.create({ fullName: 'Chủ Trại Ba Vì (Admin)', email: 'admin@test.com', password: '123', phone: '0901111111', role: 'admin', firebaseUid: 'uid_admin', status: 'active' });
    
    const retailer = await User.create({ fullName: 'BigC Thăng Long', email: 'bigc@test.com', password: '123', phone: '0988888888', role: 'retailer', address: '222 Trần Duy Hưng', firebaseUid: 'uid_retailer', status: 'active' });

    const farm = await Farm.create({ name: 'Nông trại Ba Vì', ownerId: admin.id, address: 'Vân Hòa, Ba Vì', location_coords: '21.0,105.0', description: 'VietGAP Standard' });

    const product = await Product.create({ name: 'Dâu Tây Mộc Châu', farmId: farm.id, price: 250000, batchCode: 'BATCH-GEN-AUTO', images: '[]' });

    console.log('✅ Đã tạo xong Admin & Shop.');

    // 3. VÒNG LẶP TẠO N NGƯỜI (Tài xế + Đơn hàng)
    const statusOptions = ['created', 'assigned', 'shipping', 'delivered'];
    const vehicleOptions = ['Xe máy', 'Xe Van 500kg', 'Xe tải 1.5 Tấn', 'Xe Container'];

    for (let i = 1; i <= SO_LUONG_TAI_XE; i++) {
        // A. Tạo Tài xế thứ i
        const driver = await User.create({
            fullName: `Tài xế số ${i}`,
            email: `driver${i}@ship.com`,
            password: '123',
            phone: `090000${i.toString().padStart(4, '0')}`, // Số đt kiểu 0900000001
            role: 'driver',
            vehicleType: vehicleOptions[Math.floor(Math.random() * vehicleOptions.length)], // Random xe
            licensePlate: `29C-${i.toString().padStart(3, '0')}.99`,
            firebaseUid: `uid_driver_${i}_${Date.now()}`,
            status: 'active'
        });

        // B. Random trạng thái đơn hàng
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        // C. Tạo Đơn hàng cho tài xế này
        const order = await Order.create({
            retailerId: retailer.id,
            productId: product.id,
            quantity: Math.floor(Math.random() * 100) + 10, // Random số lượng từ 10-110
            totalPrice: (Math.floor(Math.random() * 10) + 1) * 1000000,
            status: randomStatus === 'created' ? 'confirmed' : (randomStatus === 'delivered' ? 'delivered' : 'shipping')
        });

        // D. Tạo Vận đơn (Shipment)
        await Shipment.create({
            orderId: order.id,
            driverId: driver.id,
            managerId: admin.id,
            pickupLocation: farm.address,
            deliveryLocation: retailer.address,
            status: randomStatus, // Trạng thái ngẫu nhiên
            trackingNumber: `SHIP-AUTO-${i}`,
            pickupQRCode: `QR_DRIVER_${i}`,
            vehicleInfo: driver.vehicleType
        });
    }

    console.log(`🎉 Đã tạo thành công ${SO_LUONG_TAI_XE} tài xế và vận đơn!`);
    console.log('👉 Vào Web F5 để xem danh sách dài dằng dặc nhé!');

  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await sequelize.close();
  }
}

seed();