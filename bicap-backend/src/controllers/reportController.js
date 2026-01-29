// src/controllers/reportController.js
const { Report, User, Order, Product, Farm } = require('../models');
const { createNotificationInternal } = require('./notificationController');

// 1. Tạo báo cáo (Retailer/Driver gửi báo cáo sự cố)
exports.createReport = async (req, res) => {
    try {
        const { title, content, type, orderId } = req.body;

        let senderId;
        if (req.user) {
            senderId = req.user.id;
        } else if (req.userFirebase) {
            const user = await User.findOne({ where: { firebaseUid: req.userFirebase.uid } });
            if (!user) return res.status(404).json({ message: 'User not found' });
            senderId = user.id;
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const report = await Report.create({
            senderId,
            title,
            content: orderId ? `[Đơn hàng #${orderId}] ${content}` : content,
            type
        });

        // --- NOTIFICATION LOGIC ---
        // Nếu có orderId, tìm Farm Owner để thông báo
        if (orderId) {
            const order = await Order.findOne({
                where: { id: orderId },
                include: [{
                    model: Product,
                    as: 'product',
                    include: [{ model: Farm, as: 'farm' }]
                }]
            });

            if (order && order.product && order.product.farm && order.product.farm.ownerId) {
                await createNotificationInternal(
                    order.product.farm.ownerId,
                    'Báo cáo mới từ Đối tác',
                    `Bạn nhận được một báo cáo mới về Đơn hàng #${orderId}: ${title}`,
                    'report'
                );
            }
        }
        // --- END NOTIFICATION LOGIC ---

        res.status(201).json({ message: 'Gửi báo cáo thành công', report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi gửi báo cáo' });
    }
};

// 2. Lấy danh sách báo cáo (Admin/Farm xem - ở đây logic đơn giản lấy toàn bộ hoặc theo filter)
// 2. Lấy danh sách báo cáo
exports.getAllReports = async (req, res) => {
    try {
        let options = {
            include: [{ model: User, as: 'sender', attributes: ['fullName', 'email', 'role'] }],
            order: [['createdAt', 'DESC']]
        };

        // If not admin or farm (manager), only show own reports
        // Or strictly if role is retailer/driver, filter by senderId
        const userRole = req.user.role;
        if (!['admin', 'farm'].includes(userRole)) {
            options.where = { senderId: req.user.id };
        }

        const reports = await Report.findAll(options);
        res.json({ reports });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách báo cáo' });
    }
};
