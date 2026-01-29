// src/controllers/adminController.js
const { User, Farm, Order, Product, Subscription, Payment, Report, Shipment, FarmingSeason } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Dashboard - Thống kê tổng quan
 */
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalFarms,
            totalOrders,
            totalProducts,
            activeSubscriptions,
            totalRevenue,
            pendingReports,
            activeShipments
        ] = await Promise.all([
            User.count(),
            Farm.count(),
            Order.count(),
            Product.count({ where: { status: 'available' } }),
            Subscription.count({ where: { status: 'active' } }),
            Payment.sum('amount', { where: { status: 'success' } }) || 0,
            Report.count({ where: { status: 'pending' } }),
            Shipment.count({ where: { status: { [Op.in]: ['assigned', 'picked_up', 'delivering'] } } })
        ]);

        // Thống kê theo role
        const usersByRole = await User.findAll({
            attributes: [
                'role',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['role'],
            raw: true
        });

        // Thống kê đơn hàng theo trạng thái
        const ordersByStatus = await Order.findAll({
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Doanh thu theo tháng (7 tháng gần nhất)
        // Sử dụng CONVERT cho SQL Server (tương thích với mọi version)
        const monthlyRevenue = await Payment.findAll({
            where: {
                status: 'success',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000)
                }
            },
            attributes: [
                // SQL Server: CONVERT(VARCHAR(7), createdAt, 120) để lấy YYYY-MM
                [Sequelize.literal("CONVERT(VARCHAR(7), createdAt, 120)"), 'month'],
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
            ],
            group: [Sequelize.literal("CONVERT(VARCHAR(7), createdAt, 120)")],
            order: [[Sequelize.literal("CONVERT(VARCHAR(7), createdAt, 120)"), 'ASC']],
            raw: true
        });

        res.json({
            overview: {
                totalUsers,
                totalFarms,
                totalOrders,
                totalProducts,
                activeSubscriptions,
                totalRevenue: parseFloat(totalRevenue) || 0,
                pendingReports,
                activeShipments
            },
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item.role] = parseInt(item.count);
                return acc;
            }, {}),
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item.status] = parseInt(item.count);
                return acc;
            }, {}),
            monthlyRevenue
        });

    } catch (error) {
        console.error('Error getting admin dashboard:', error);
        res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
    }
};

/**
 * Quản lý Users
 */
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (role) whereClause.role = role;
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                { model: Farm, as: 'farms' },
                { model: Order, as: 'orders' },
                { model: Subscription, as: 'subscriptions' }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin user', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status, isActive, fullName, phone, address } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        // Cập nhật các field được phép
        if (role !== undefined) user.role = role;
        if (status !== undefined) user.status = status;
        if (isActive !== undefined) user.isActive = isActive;
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        await user.save();

        res.json({
            message: 'Cập nhật user thành công',
            user
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Lỗi cập nhật user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép xóa user, chỉ block
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        user.status = 'blocked';
        user.isActive = false;
        await user.save();

        res.json({
            message: 'Đã khóa user thành công',
            user
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Lỗi khóa user', error: error.message });
    }
};

/**
 * Quản lý Farms
 */
exports.getFarms = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: farms } = await Farm.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'owner', attributes: ['id', 'fullName', 'email', 'phone'] }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            farms,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting farms:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách farms', error: error.message });
    }
};

exports.getFarmById = async (req, res) => {
    try {
        const { id } = req.params;

        const farm = await Farm.findByPk(id, {
            include: [
                { model: User, as: 'owner' },
                { model: FarmingSeason, as: 'seasons' },
                { model: Product, as: 'products' }
            ]
        });

        if (!farm) {
            return res.status(404).json({ message: 'Farm không tồn tại' });
        }

        res.json({ farm });

    } catch (error) {
        console.error('Error getting farm:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin farm', error: error.message });
    }
};

exports.approveFarm = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body; // true/false

        const farm = await Farm.findByPk(id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm không tồn tại' });
        }

        // Có thể thêm field 'approved' vào Farm model nếu cần
        // Ở đây giả sử có field status
        if (approved) {
            // farm.status = 'approved';
            // farm.approvedAt = new Date();
        } else {
            // farm.status = 'rejected';
        }

        await farm.save();

        res.json({
            message: approved ? 'Đã duyệt farm thành công' : 'Đã từ chối farm',
            farm
        });

    } catch (error) {
        console.error('Error approving farm:', error);
        res.status(500).json({ message: 'Lỗi duyệt farm', error: error.message });
    }
};

/**
 * Quản lý Reports
 */
exports.getReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const { count, rows: reports } = await Report.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'sender', attributes: ['id', 'fullName', 'email', 'role'] }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            reports,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting reports:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách reports', error: error.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const report = await Report.findByPk(id);
        if (!report) {
            return res.status(404).json({ message: 'Report không tồn tại' });
        }

        report.status = status || report.status;
        if (adminNote) {
            report.adminNote = adminNote;
        }

        await report.save();

        res.json({
            message: 'Cập nhật trạng thái report thành công',
            report
        });

    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Lỗi cập nhật report', error: error.message });
    }
};

/**
 * Quản lý Orders
 */
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {};
        if (status) whereClause.status = status;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: Product, as: 'product', include: [{ model: Farm, as: 'farm' }] },
                { model: User, as: 'retailer', attributes: ['id', 'fullName', 'email', 'phone'] }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            orders,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách orders', error: error.message });
    }
};

