// src/controllers/orderController.js
const { Order, Product, Farm, User } = require('../models');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// 1. Tạo đơn hàng (Retailer mua từ Marketplace)
exports.createOrder = async (req, res) => {
    try {
        const { productId, quantity, contractTerms } = req.body;
        // Logic fallback nếu req.user chưa có (do middleware verifyToken chỉ trả về userFirebase)
        let retailerId;
        if (req.user) {
            retailerId = req.user.id;
        } else if (req.userFirebase) {
            const user = await User.findOne({ where: { firebaseUid: req.userFirebase.uid } });
            if (!user) return res.status(404).json({ message: 'User not found' });
            retailerId = user.id;
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Kiểm tra sản phẩm
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Số lượng sản phẩm không đủ' });
        }

        const totalPrice = product.price * quantity;

        // Tạo đơn hàng
        const newOrder = await Order.create({
            retailerId,
            productId,
            quantity,
            totalPrice,
            contractTerms, // Điều khoản hợp đồng (nếu có)
            status: 'pending'
        });

        // Tạm thời chưa trừ số lượng sản phẩm ngay, chờ xác nhận đơn hàng
        // Hoặc trừ luôn tùy logic. Ở đây mình trừ luôn cho đơn giản để tránh mua quá.
        product.quantity -= quantity;
        if (product.quantity === 0) product.status = 'distributed'; // Hết hàng
        await product.save();

        // --- NOTIFICATION START ---
        const { createNotificationInternal } = require('./notificationController');
        // Get Farm Owner ID
        const farm = await Farm.findByPk(product.farmId);
        if (farm) {
            await createNotificationInternal(
                farm.ownerId,
                'Đơn hàng mới',
                `Bạn có đơn hàng mới #${newOrder.id} cho sản phẩm ${product.name}`,
                'order'
            );
        }
        // --- NOTIFICATION END ---

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            order: newOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi tạo đơn hàng', error: error.message });
    }
};

// 2. Lấy danh sách đơn hàng của một Trang trại (Để chủ trại duyệt)
exports.getOrdersByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;

        // Kiểm tra quyền sở hữu farm
        const farm = await Farm.findByPk(farmId);
        if (!farm) return res.status(404).json({ message: 'Trại không tồn tại' });
        if (farm.ownerId !== req.user.id) return res.status(403).json({ message: 'Không có quyền truy cập' });

        const orders = await Order.findAll({
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { farmId }, // Chỉ lấy order thuộc farm này
                    attributes: ['name', 'price', 'batchCode']
                },
                {
                    model: User,
                    as: 'retailer',
                    attributes: ['fullName', 'email', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng' });
    }
};

// 3. Cập nhật trạng thái đơn hàng (Duyệt, Hủy, Giao hàng)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // pending, confirmed, shipping, completed, cancelled

        const order = await Order.findByPk(id, {
            include: [{ model: Product, as: 'product' }]
        });

        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

        // Kiểm tra quyền: Chỉ chủ trại (của sản phẩm đó) mới được cập nhật
        const farm = await Farm.findByPk(order.product.farmId);
        if (farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xử lý đơn hàng này' });
        }

        // Logic hoàn trả số lượng nếu hủy
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const product = await Product.findByPk(order.productId);
            product.quantity += order.quantity;
            if (product.status === 'distributed') product.status = 'available';
            await product.save();
        }

        order.status = status;
        await order.save();

        // --- NOTIFICATION START ---
        const { createNotificationInternal } = require('./notificationController');
        await createNotificationInternal(
            order.retailerId,
            'Cập nhật đơn hàng',
            `Đơn hàng #${order.id} của bạn đã chuyển sang trạng thái: ${status}`,
            'order'
        );
        // --- NOTIFICATION END ---

        res.json({ message: 'Cập nhật trạng thái thành công', order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi cập nhật đơn hàng' });
    }
};

// 4. Lấy danh sách đơn hàng của Retailer (Cho Retailer)
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Populated by requireRole

        const orders = await Order.findAll({
            where: { retailerId: userId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'price', 'batchCode', 'farmId'],
                    include: [{ model: Farm, as: 'farm', attributes: ['name', 'ownerId'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng' });
    }
};

// 5. Hủy đơn hàng (Cho Retailer)
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Retailer

        const order = await Order.findByPk(id, {
            include: [{ model: Product, as: 'product' }]
        });

        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        if (order.retailerId !== userId) return res.status(403).json({ message: 'Bạn không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ duyệt' });

        // Hoàn lại số lượng
        const product = await Product.findByPk(order.productId);
        product.quantity += order.quantity;
        if (product.status === 'distributed') product.status = 'available';
        await product.save();

        order.status = 'cancelled';
        await order.save();

        // Notify Farm
        const { createNotificationInternal } = require('./notificationController');
        const farm = await Farm.findByPk(product.farmId);
        if (farm) {
            await createNotificationInternal(
                farm.ownerId,
                'Đơn hàng bị hủy',
                `Đơn hàng #${order.id} đã bị hủy bởi người mua`,
                'order'
            );
        }

        res.json({ message: 'Hủy đơn hàng thành công', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi hủy đơn hàng' });
    }
};

// 6. Xác nhận đã nhận hàng (Cho Retailer)
exports.confirmDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        let deliveryImage = req.body.deliveryImage;
        const userId = req.user.id;
        
        // Lấy image từ uploaded file nếu có
        if (req.file) {
            deliveryImage = getFileUrl(req, req.file.path);
        }

        const order = await Order.findByPk(id, {
            include: [{ model: Product, as: 'product' }]
        });

        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        if (order.retailerId !== userId) return res.status(403).json({ message: 'Bạn không có quyền' });
        if (order.status !== 'shipping') return res.status(400).json({ message: 'Đơn hàng chưa ở trạng thái vận chuyển' });

        // Update status and image
        // Update status and image
        order.status = 'delivered';
        if (deliveryImage) order.deliveryImage = deliveryImage;
        await order.save();

        // Notify Farm
        const { createNotificationInternal } = require('./notificationController');
        const farm = await Farm.findByPk(order.product.farmId);
        if (farm) {
            await createNotificationInternal(
                farm.ownerId,
                'Đơn hàng hoàn tất',
                `Đơn hàng #${order.id} đã được nhận thành công`,
                'order'
            );
        }

        res.json({ message: 'Xác nhận nhận hàng thành công', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi xác nhận đơn hàng' });
    }
};

// 7. Thanh toán tiền cọc (Cho Retailer) - Tích hợp VNPay
exports.payDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findByPk(id, {
            include: [{ model: Product, as: 'product' }]
        });

        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        if (order.retailerId !== userId) return res.status(403).json({ message: 'Bạn không có quyền' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Chỉ có thể đặt cọc cho đơn hàng đang chờ' });

        // Tính số tiền cọc (30%)
        const depositAmount = order.totalPrice * 0.3;

        // Trả về thông tin để frontend gọi payment API
        res.json({ 
            message: 'Vui lòng thanh toán tiền cọc',
            order: {
                id: order.id,
                totalPrice: order.totalPrice,
                depositAmount: depositAmount
            },
            paymentRequired: true,
            paymentEndpoint: `/api/payments`,
            paymentData: {
                paymentType: 'order_deposit',
                orderId: order.id,
                amount: depositAmount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi xử lý thanh toán cọc', error: error.message });
    }
};

// 8. Thanh toán phần còn lại (Cho Retailer) - Hoàn tất đơn hàng
exports.payRemaining = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findByPk(id, {
            include: [{ model: Product, as: 'product' }]
        });

        if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        if (order.retailerId !== userId) return res.status(403).json({ message: 'Bạn không có quyền' });

        // Chỉ thanh toán nốt khi đã giao hàng (delivered)
        if (order.status !== 'delivered') return res.status(400).json({ message: 'Đơn hàng chưa được giao hoặc đã hoàn tất' });

        const remainingAmount = order.totalPrice - (order.depositAmount || 0);

        // Giả sử thanh toán thành công
        order.status = 'completed';
        await order.save();

        // Notify Farm
        const { createNotificationInternal } = require('./notificationController');
        const farm = await Farm.findByPk(order.product.farmId);
        if (farm) {
            await createNotificationInternal(
                farm.ownerId,
                'Thanh toán hoàn tất',
                `Đơn hàng #${order.id} đã thanh toán nốt phần còn lại (${remainingAmount.toLocaleString()}đ). Giao dịch hoàn tất.`,
                'order'
            );
        }

        res.json({ message: 'Thanh toán hoàn tất! Đơn hàng đã đóng.', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi thanh toán phần còn lại' });
    }
};
