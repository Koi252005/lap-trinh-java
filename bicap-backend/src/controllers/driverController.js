// src/controllers/driverController.js
const { Shipment, Order, Product, Farm, User } = require('../models');
const { Op } = require('sequelize');
const { createNotificationInternal } = require('./notificationController');

/**
 * Lấy danh sách vận đơn được gán cho Driver
 */
exports.getMyShipments = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { status } = req.query;

        const whereClause = { driverId };
        if (status) {
            whereClause.status = status;
        }

        const shipments = await Shipment.findAll({
            where: whereClause,
            include: [
                {
                    model: Order,
                    as: 'order',
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            include: [
                                {
                                    model: Farm,
                                    as: 'farm',
                                    attributes: ['id', 'name', 'address', 'location_coords']
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'retailer',
                            attributes: ['id', 'fullName', 'phone', 'address']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'fullName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ shipments });

    } catch (error) {
        console.error('Error getting driver shipments:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách vận đơn', error: error.message });
    }
};

/**
 * Lấy chi tiết một vận đơn
 */
exports.getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const driverId = req.user.id;

        const shipment = await Shipment.findOne({
            where: { id, driverId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    required: true,
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            include: [
                                {
                                    model: Farm,
                                    as: 'farm',
                                    attributes: ['id', 'name', 'address', 'location_coords', 'phone']
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'retailer',
                            attributes: ['id', 'fullName', 'phone', 'address']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'fullName', 'phone']
                }
            ]
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Vận đơn không tồn tại hoặc bạn không có quyền truy cập' });
        }

        res.json({ shipment });

    } catch (error) {
        console.error('Error getting shipment:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin vận đơn', error: error.message });
    }
};

/**
 * Cập nhật vị trí GPS hiện tại của Driver
 */
exports.updateLocation = async (req, res) => {
    try {
        const { shipmentId, latitude, longitude } = req.body;
        const driverId = req.user.id;

        if (!shipmentId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: 'Thiếu thông tin: shipmentId, latitude, longitude' });
        }

        const shipment = await Shipment.findOne({
            where: { id: shipmentId, driverId }
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Vận đơn không tồn tại hoặc bạn không có quyền' });
        }

        // Cập nhật vị trí hiện tại
        shipment.currentLocation = `${latitude},${longitude}`;
        await shipment.save();

        res.json({
            message: 'Cập nhật vị trí thành công',
            location: {
                latitude,
                longitude,
                shipmentId: shipment.id
            }
        });

    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Lỗi cập nhật vị trí', error: error.message });
    }
};

/**
 * Xác nhận nhận hàng (Pickup) - Quét QR code
 */
exports.confirmPickup = async (req, res) => {
    try {
        const { shipmentId, qrCode, latitude, longitude } = req.body;
        const driverId = req.user.id;

        if (!shipmentId || !qrCode) {
            return res.status(400).json({ message: 'Thiếu thông tin: shipmentId, qrCode' });
        }

        const shipment = await Shipment.findOne({
            where: { id: shipmentId, driverId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Vận đơn không tồn tại hoặc bạn không có quyền' });
        }

        // Validate QR code (có thể là orderId hoặc shipmentId)
        // Trong thực tế, QR code sẽ chứa thông tin đơn hàng hoặc vận đơn
        const expectedQR1 = `ORDER_${shipment.orderId}`;
        const expectedQR2 = `SHIPMENT_${shipmentId}`;
        if (qrCode !== expectedQR1 && qrCode !== expectedQR2 && qrCode !== shipment.orderId.toString() && qrCode !== shipmentId.toString()) {
            return res.status(400).json({ message: 'QR code không hợp lệ hoặc không khớp với vận đơn' });
        }

        // Kiểm tra trạng thái hiện tại
        if (!['created', 'assigned'].includes(shipment.status)) {
            return res.status(400).json({ message: `Không thể nhận hàng ở trạng thái: ${shipment.status}` });
        }

        // Cập nhật trạng thái
        shipment.status = 'picked_up';
        shipment.pickupTime = new Date();
        shipment.pickupQRCode = qrCode;
        
        if (latitude && longitude) {
            shipment.pickupLocation = `${latitude},${longitude}`;
            shipment.currentLocation = `${latitude},${longitude}`;
        }

        await shipment.save();

        // Cập nhật trạng thái đơn hàng
        const order = await Order.findByPk(shipment.orderId);
        if (order && order.status === 'confirmed') {
            order.status = 'shipping';
            await order.save();
        }

        // Gửi thông báo
        await createNotificationInternal(
            shipment.order.retailerId,
            'Đã nhận hàng',
            `Vận đơn #${shipment.id} đã được tài xế nhận hàng. Đơn hàng đang được vận chuyển.`,
            'shipment'
        );

        res.json({
            message: 'Xác nhận nhận hàng thành công',
            shipment
        });

    } catch (error) {
        console.error('Error confirming pickup:', error);
        res.status(500).json({ message: 'Lỗi xác nhận nhận hàng', error: error.message });
    }
};

/**
 * Xác nhận giao hàng (Delivery) - Quét QR code
 */
exports.confirmDelivery = async (req, res) => {
    try {
        const { shipmentId, qrCode, latitude, longitude, deliveryImage } = req.body;
        const driverId = req.user.id;

        if (!shipmentId || !qrCode) {
            return res.status(400).json({ message: 'Thiếu thông tin: shipmentId, qrCode' });
        }

        const shipment = await Shipment.findOne({
            where: { id: shipmentId, driverId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Vận đơn không tồn tại hoặc bạn không có quyền' });
        }

        // Validate QR code
        const expectedQR1 = `ORDER_${shipment.orderId}`;
        const expectedQR2 = `SHIPMENT_${shipmentId}`;
        if (qrCode !== expectedQR1 && qrCode !== expectedQR2 && qrCode !== shipment.orderId.toString() && qrCode !== shipmentId.toString()) {
            return res.status(400).json({ message: 'QR code không hợp lệ hoặc không khớp với vận đơn' });
        }

        // Kiểm tra trạng thái hiện tại
        if (!['picked_up', 'delivering'].includes(shipment.status)) {
            return res.status(400).json({ message: `Không thể giao hàng ở trạng thái: ${shipment.status}` });
        }

        // Cập nhật trạng thái
        shipment.status = 'delivered';
        shipment.deliveryTime = new Date();
        shipment.deliveryQRCode = qrCode;
        
        if (latitude && longitude) {
            shipment.deliveryLocation = `${latitude},${longitude}`;
            shipment.currentLocation = `${latitude},${longitude}`;
        }

        await shipment.save();

        // Cập nhật trạng thái đơn hàng
        const order = await Order.findByPk(shipment.orderId);
        if (order) {
            order.status = 'completed';
            if (deliveryImage) {
                order.deliveryImage = deliveryImage;
            }
            await order.save();
        }

        // Gửi thông báo
        await createNotificationInternal(
            shipment.order.retailerId,
            'Đã giao hàng',
            `Vận đơn #${shipment.id} đã được giao thành công. Đơn hàng #${shipment.orderId} đã hoàn tất.`,
            'shipment'
        );

        // Gửi thông báo cho Farm Owner
        const farm = await Farm.findByPk(shipment.order.product.farmId);
        if (farm) {
            await createNotificationInternal(
                farm.ownerId,
                'Giao hàng thành công',
                `Đơn hàng #${shipment.orderId} đã được giao thành công.`,
                'order'
            );
        }

        res.json({
            message: 'Xác nhận giao hàng thành công',
            shipment
        });

    } catch (error) {
        console.error('Error confirming delivery:', error);
        res.status(500).json({ message: 'Lỗi xác nhận giao hàng', error: error.message });
    }
};

/**
 * Cập nhật trạng thái vận chuyển
 */
exports.updateShipmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, latitude, longitude } = req.body;
        const driverId = req.user.id;

        const validStatuses = ['assigned', 'picked_up', 'delivering', 'delivered', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}` });
        }

        const shipment = await Shipment.findOne({
            where: { id, driverId },
            include: [{ model: Order, as: 'order' }]
        });

        if (!shipment) {
            return res.status(404).json({ message: 'Vận đơn không tồn tại hoặc bạn không có quyền' });
        }

        // Cập nhật trạng thái
        shipment.status = status;

        // Cập nhật thời gian và vị trí tùy theo trạng thái
        if (status === 'picked_up' && !shipment.pickupTime) {
            shipment.pickupTime = new Date();
        }
        if (status === 'delivered' && !shipment.deliveryTime) {
            shipment.deliveryTime = new Date();
        }
        if (latitude && longitude) {
            shipment.currentLocation = `${latitude},${longitude}`;
        }

        await shipment.save();

        // Cập nhật trạng thái đơn hàng tương ứng
        const order = await Order.findByPk(shipment.orderId);
        if (order) {
            if (status === 'delivering') {
                order.status = 'shipping';
            } else if (status === 'delivered') {
                order.status = 'completed';
            }
            await order.save();
        }

        // Gửi thông báo
        await createNotificationInternal(
            shipment.order.retailerId,
            'Cập nhật vận chuyển',
            `Vận đơn #${shipment.id} đã chuyển sang trạng thái: ${status}`,
            'shipment'
        );

        res.json({
            message: 'Cập nhật trạng thái thành công',
            shipment
        });

    } catch (error) {
        console.error('Error updating shipment status:', error);
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
    }
};

/**
 * Lấy thống kê của Driver
 */
exports.getDriverStats = async (req, res) => {
    try {
        const driverId = req.user.id;

        const [totalShipments, activeShipments, completedShipments, todayShipments] = await Promise.all([
            Shipment.count({ where: { driverId } }),
            Shipment.count({ where: { driverId, status: { [Op.in]: ['assigned', 'picked_up', 'delivering'] } } }),
            Shipment.count({ where: { driverId, status: 'delivered' } }),
            Shipment.count({
                where: {
                    driverId,
                    createdAt: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                }
            })
        ]);

        res.json({
            totalShipments,
            activeShipments,
            completedShipments,
            todayShipments
        });

    } catch (error) {
        console.error('Error getting driver stats:', error);
        res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
    }
};

// API: Lấy danh sách tất cả tài xế - không cần auth. Luôn trả 200 + mảng (trả [] nếu lỗi).
exports.getAllDrivers = async (req, res) => {
    let list = [];
    try {
        const drivers = await User.findAll({
            where: { role: 'driver' },
            attributes: ['id', 'fullName', 'phone', 'email', 'status'],
            order: [['id', 'ASC']],
        });
        const driverIds = drivers.map(d => d.id);
        let activeShipmentByDriver = {};
        if (driverIds.length > 0) {
            try {
                const activeShipments = await Shipment.findAll({
                    where: {
                        driverId: { [Op.in]: driverIds },
                        status: { [Op.in]: ['assigned', 'picked_up', 'delivering'] },
                    },
                    attributes: ['id', 'driverId'],
                    raw: true,
                });
                activeShipments.forEach(s => { activeShipmentByDriver[s.driverId] = s.id; });
            } catch (e) {
                console.warn('getAllDrivers: Shipment lookup failed', e.message);
            }
        }
        list = drivers.map(d => {
            const current_job = activeShipmentByDriver[d.id] || null;
            return {
                id: d.id,
                fullName: d.fullName,
                name: d.fullName,
                phone: d.phone,
                email: d.email,
                vehicle: 'Xe tải',
                plate: '---',
                status: current_job ? 'Bận' : 'Rảnh',
                current_job,
            };
        });
    } catch (error) {
        console.error("Lỗi getDrivers:", error);
    }
    res.status(200).json(list);
};