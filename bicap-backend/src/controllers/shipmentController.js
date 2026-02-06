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
                    as: 'driver',
                    attributes: ['id', 'fullName', 'phone'] 
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'status', 'pickupAddress', 'deliveryAddress'],
                    include: [
                        { model: Product, as: 'product', attributes: ['name', 'price'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const data = shipments.map(s => {
            const order = s.order;
            const pickupAddr = (s.pickupLocation && s.pickupLocation.trim() && s.pickupLocation !== 'Chưa cập nhật') 
                ? s.pickupLocation 
                : (order?.pickupAddress?.trim() ? order.pickupAddress : 'Chưa cập nhật');
            const deliveryAddr = (s.deliveryLocation && s.deliveryLocation.trim() && s.deliveryLocation !== 'Chưa cập nhật') 
                ? s.deliveryLocation 
                : (order?.deliveryAddress?.trim() ? order.deliveryAddress : 'Chưa cập nhật');
            return {
                id: s.id,
                diemDi: pickupAddr,
                diemDen: deliveryAddr,
                taiXe: s.driver ? s.driver.fullName : "Chưa phân công",
                status: s.status,
                vehicleInfo: s.vehicleInfo,
                details: {
                    qrCode: s.pickupQRCode || `SHIPMENT_${s.id}`,
                    vehicle: s.vehicleInfo || s.driver?.vehicleType || "Xe tải",
                    type: s.order?.product?.name || "Hàng hóa",
                    weight: "---",
                    time: s.updatedAt
                }
            };
        });

        res.status(200).json(data);

    } catch (error) {
        console.error("Lỗi Controller getAllShipments:", error);
        res.status(500).json({ message: "Lỗi Server khi lấy vận đơn", error: error.message });
    }
};

// 1. Tạo đơn vận chuyển (Chỉ khi Order đã confirmed)
exports.createShipment = async (req, res) => {
    try {
        const { orderId, driverId, vehicleInfo, pickupTime, estimatedDeliveryTime, pickupLocation, deliveryLocation } = req.body;
        const managerId = req.user.id;
        const isShippingRole = ['shipping', 'shipping_manager', 'admin'].includes(req.user.role);

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

        // 2. Authorization: Farm owner HOẶC Shipping/Admin được tạo vận đơn
        if (!isShippingRole) {
            if (!order.product || !order.product.farm || order.product.farm.ownerId !== managerId) {
                return res.status(403).json({ message: 'Bạn không có quyền tạo vận đơn cho đơn hàng này' });
            }
        }

        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Đơn hàng phải được xác nhận trước khi tạo vận đơn' });
        }

        // 3. Check for existing shipment
        const existingShipment = await Shipment.findOne({ where: { orderId } });
        if (existingShipment) {
            return res.status(400).json({ message: 'Đơn hàng này đã có vận đơn' });
        }

        // 4. Điểm lấy hàng & điểm đến: từ body hoặc từ đơn hàng (ưu tiên địa chỉ cụ thể)
        const pickupAddr = (pickupLocation && pickupLocation.trim()) || (order.pickupAddress && order.pickupAddress.trim()) || (order.product?.farm?.address ? `Trang trại: ${order.product.farm.address}` : null) || 'Chưa cập nhật';
        const deliveryAddr = (deliveryLocation && deliveryLocation.trim()) || (order.deliveryAddress && order.deliveryAddress.trim()) || 'Chưa cập nhật';

        // 5. Status: có tài xế thì luôn assigned (đi giao), mặc định vehicleInfo nếu chưa có
        const finalVehicleInfo = (vehicleInfo && vehicleInfo.trim()) || (driverId ? 'Xe tải' : null);
        let initialStatus = 'created';
        if (driverId) initialStatus = 'assigned';

        // 6. Create Shipment (chỉ các field có trong model)
        const newShipment = await Shipment.create({
            orderId,
            managerId,
            driverId: driverId || null,
            vehicleInfo: finalVehicleInfo,
            status: initialStatus,
            pickupTime: pickupTime || null,
            pickupLocation: pickupAddr,
            deliveryLocation: deliveryAddr
        });

        // 6. Update Order Status
        order.status = 'shipping';
        await order.save();

        // 7. Blockchain Log (Mock) - Non-fatal if fails
        let txHash;
        try {
            txHash = await blockchainHelper.writeToBlockchain({
                type: 'CREATE_SHIPMENT',
                shipmentId: newShipment.id,
                orderId,
                managerId,
                timestamp: new Date().toISOString()
            });
        } catch (blockchainError) {
            console.error('Blockchain error (non-fatal):', blockchainError);
            txHash = null; // Continue even if blockchain fails
        }

        // 8. Notification (Mock)
        // Notify retailer
        try {
            const { createNotificationInternal } = require('./notificationController');
            await createNotificationInternal(
                order.retailerId,
                'Yêu cầu vận chuyển mới',
                `Đơn hàng #${order.id} đã được yêu cầu vận chuyển.`,
                'shipment'
            );
        } catch (notifError) {
            console.warn('Failed to send notification:', notifError.message);
            // Non-fatal: continue
        }

        res.status(201).json({
            message: driverId ? 'Tạo vận đơn thành công' : 'Đã gửi yêu cầu vận chuyển thành công',
            shipment: newShipment,
            txHash: txHash || 'Blockchain chưa sẵn sàng'
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
