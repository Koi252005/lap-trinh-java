// src/controllers/shipmentController.js
const { Shipment, Order, Farm, User, Product } = require('../models');

const blockchainHelper = require('../utils/blockchainHelper');

// API: GET /api/shipments
exports.getAllShipments = async (req, res) => {
    try {
        console.log("Đang gọi API lấy danh sách vận đơn..."); // Log để debug

        const shipments = await Shipment.findAll({
            include: [
                { 
                    model: User, 
                    as: 'driver', // Phải khớp với alias trong models/index.js
                    attributes: ['id', 'fullName', 'phone'] 
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'status'],
                    include: [
                        { model: Product, as: 'product', attributes: ['name', 'price'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] // Đơn mới nhất lên đầu
        });

        // Format dữ liệu cho Frontend dễ hiển thị
        const data = shipments.map(s => ({
            id: s.id,
            diemDi: s.pickupLocation || "Kho Trung Tâm",
            diemDen: s.deliveryLocation || "Khách hàng",
            taiXe: s.driver ? s.driver.fullName : "Chưa phân công",
            status: s.status, // Giữ nguyên trạng thái từ DB (assigned, picked_up...)
            details: {
                // Tạo mã QR từ ID thật
                qrCode: s.pickupQRCode || `SHIPMENT_${s.id}`,
                vehicle: s.driver?.vehicleType || "Xe tải",
                type: s.order?.product?.name || "Hàng hóa",
                weight: "---", // Nếu DB có cột weight thì thay vào đây
                time: s.updatedAt
            }
        }));

        res.status(200).json(data);

    } catch (error) {
        console.error("Lỗi Controller getAllShipments:", error);
        res.status(500).json({ message: "Lỗi Server khi lấy vận đơn", error: error.message });
    }
};

// 1. Tạo đơn vận chuyển (Chỉ khi Order đã confirmed)
exports.createShipment = async (req, res) => {
    try {
        const { orderId, driverId, vehicleInfo, pickupTime, estimatedDeliveryTime } = req.body;
        const managerId = req.user.id; // Farm Owner creates the request

        // 1. Verify Order
        const order = await Order.findOne({
            where: { id: orderId },
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: Farm, as: 'farm' }]
            }]
        });

        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        // 2. Authorization: Manager must be the Farm Owner
        // Note: Check if managerId matches order.product.farm.ownerId
        // console.log('Check ownership:', order.product?.farm?.ownerId, managerId);

        if (!order.product || !order.product.farm || order.product.farm.ownerId !== managerId) {
            return res.status(403).json({ message: 'Bạn không có quyền tạo vận đơn cho đơn hàng này' });
        }

        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Đơn hàng phải được xác nhận trước khi tạo vận đơn' });
        }

        // 3. Check for existing shipment
        const existingShipment = await Shipment.findOne({ where: { orderId } });
        if (existingShipment) {
            return res.status(400).json({ message: 'Đơn hàng này đã có vận đơn' });
        }

        // 4. Determine Status
        // If driver info is missing, it's a request -> 'pending_pickup'
        let initialStatus = 'pending_pickup';
        if (driverId && vehicleInfo) {
            initialStatus = 'shipping';
        }

        // 5. Create Shipment
        const newShipment = await Shipment.create({
            trackingNumber: `SHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderId,
            managerId,
            driverId: driverId || null,
            vehicleInfo: vehicleInfo || null,
            status: initialStatus,
            pickupTime: pickupTime || null,
            estimatedDeliveryTime: estimatedDeliveryTime || null,
            notes: driverId ? 'Farm Owner created shipment with driver' : 'Farm Owner requested shipping'
        });

        // 6. Update Order Status
        order.status = 'shipping';
        await order.save();

        // 7. Blockchain Log (Mock)
        const txHash = await blockchainHelper.writeToBlockchain({
            type: 'CREATE_SHIPMENT',
            shipmentId: newShipment.id,
            orderId,
            managerId,
            timestamp: new Date().toISOString()
        });

        // 8. Notification (Mock)
        // Notify retailer
        const { createNotificationInternal } = require('./notificationController');
        await createNotificationInternal(
            order.retailerId,
            'Yêu cầu vận chuyển mới',
            `Đơn hàng #${order.id} đã được yêu cầu vận chuyển.`,
            'shipment'
        );

        res.status(201).json({
            message: driverId ? 'Tạo vận đơn thành công' : 'Đã gửi yêu cầu vận chuyển thành công',
            shipment: newShipment,
            txHash
        });

    } catch (error) {
        console.error('Create Shipment Error:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo vận đơn', error: error.message });
    }
};

// 2. Lấy danh sách vận đơn của Farm (Để chủ trại theo dõi)
exports.getShipmentsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;

        // Verify ownership (optional strict check)
        // const farm = ...

        const shipments = await Shipment.findAll({
            include: [
                {
                    model: Order,
                    as: 'order',
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            where: { farmId } // Filter shipments where product belongs to farmId
                        },
                        {
                            model: User,
                            as: 'retailer',
                            attributes: ['fullName', 'phone', 'address']
                        }
                    ]
                },
                { model: User, as: 'driver', attributes: ['fullName', 'phone'] },
                { model: User, as: 'manager', attributes: ['fullName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ shipments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách vận chuyển' });
    }
};

// 3. Cập nhật trạng thái vận đơn (Dành cho Driver hoặc Manager)
exports.updateShipmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, deliveryTime } = req.body; // picked_up, delivering, delivered, failed

        const shipment = await Shipment.findByPk(id, { include: ['order'] });
        if (!shipment) return res.status(404).json({ message: 'Vận đơn không tồn tại' });

        // Logic check quyền (Driver được gán mới đc update, hoặc chủ trại)
        // ... skipped for simplicity ...

        shipment.status = status;
        if (status === 'delivered') {
            shipment.deliveryTime = deliveryTime || new Date();
            // Update Order -> delivered
            if (shipment.order) {
                shipment.order.status = 'delivered';
                await shipment.order.save();
            }
        } else if (status === 'delivering') {
            if (shipment.order) {
                shipment.order.status = 'shipping';
                await shipment.order.save();
            }
        }

        await shipment.save();

        // --- NOTIFICATION START ---
        const { createNotificationInternal } = require('./notificationController');
        const orderForNotify = await Order.findByPk(shipment.orderId);
        if (orderForNotify) {
            await createNotificationInternal(
                orderForNotify.retailerId,
                'Cập nhật vận chuyển',
                `Vận đơn #${shipment.id} đang ở trạng thái: ${status}`,
                'shipment'
            );
        }
        // --- NOTIFICATION END ---

        res.json({ message: 'Cập nhật trạng thái thành công', shipment });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật vận đơn' });
    }
};
