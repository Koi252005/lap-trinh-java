// src/controllers/notificationController.js
const { Notification, User } = require('../models');

// 1. Lấy danh sách thông báo của tôi
exports.getMyNotifications = async (req, res) => {
    try {
        // Fix for missing req.user (since verifyToken only gives userFirebase)
        let userId;

        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.userFirebase) {
            const user = await User.findOne({ where: { firebaseUid: req.userFirebase.uid } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            userId = user.id;
        } else {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ notifications });
    } catch (error) {
        console.error("Error in getMyNotifications:", error);
        res.status(500).json({ message: 'Lỗi lấy thông báo', error: error.message });
    }
};

// 2. Đánh dấu đã đọc
exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;

        // Fix for missing req.user
        let userId;
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.userFirebase) {
            const user = await User.findOne({ where: { firebaseUid: req.userFirebase.uid } });
            if (!user) return res.status(404).json({ message: 'User not found' });
            userId = user.id;
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tồn tại' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
    }
};

// 3. Helper function to create notification (Internal use)
exports.createNotificationInternal = async (userId, title, message, type) => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type, // 'order', 'shipment', 'system'
            isRead: false
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// Gửi thông báo từ Retailer/User đến Farm (Contact)
exports.sendNotificationToUser = async (req, res) => {
    try {
        const { receiverId, title, message } = req.body;

        // Fix for missing req.user
        let senderName = 'Khách';
        if (req.user && req.user.fullName) {
            senderName = req.user.fullName;
        } else if (req.userFirebase) {
            const user = await User.findOne({ where: { firebaseUid: req.userFirebase.uid } });
            if (user) senderName = user.fullName;
        }

        // Simple validation
        if (!receiverId || !title || !message) {
            return res.status(400).json({ message: 'Thiếu thông tin' });
        }

        const notification = await Notification.create({
            userId: receiverId, // Receiver
            title: `[Tin nhắn] ${title}`,
            message: `${message} (Từ: ${senderName})`,
            type: 'message'
        });

        res.status(201).json({ message: 'Gửi tin nhắn thành công', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi gửi tin nhắn' });
    }
};
