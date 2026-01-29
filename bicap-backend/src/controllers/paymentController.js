// src/controllers/paymentController.js
const { Payment, Order, Subscription, User, Product, Farm } = require('../models');
const vnpayHelper = require('../utils/vnpayHelper');
const { createNotificationInternal } = require('./notificationController');

/**
 * Tạo payment request và redirect URL
 */
exports.createPayment = async (req, res) => {
    try {
        const { paymentType, orderId, subscriptionId, amount, description } = req.body;
        const userId = req.user.id;
        const ipAddr = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

        // Validate payment type
        if (!['subscription', 'order_deposit', 'order_full'].includes(paymentType)) {
            return res.status(400).json({ message: 'Loại thanh toán không hợp lệ' });
        }

        let paymentRecord;
        let orderInfo = '';
        let orderType = 'other';
        let relatedId = null;

        // Xử lý theo loại thanh toán
        if (paymentType === 'subscription') {
            if (!subscriptionId) {
                return res.status(400).json({ message: 'Thiếu subscriptionId' });
            }

            const subscription = await Subscription.findByPk(subscriptionId);
            if (!subscription) {
                return res.status(404).json({ message: 'Gói dịch vụ không tồn tại' });
            }

            if (subscription.userId !== userId) {
                return res.status(403).json({ message: 'Bạn không có quyền thanh toán gói này' });
            }

            relatedId = subscriptionId;
            orderInfo = `Thanh toan goi dich vu ${subscription.packageType}`;
            orderType = 'subscription';

            // Tạo payment record
            paymentRecord = await Payment.create({
                userId,
                subscriptionId,
                paymentType: 'subscription',
                amount: subscription.amount,
                currency: 'VND',
                vnp_TxnRef: vnpayHelper.generateTxnRef('SUB', subscriptionId),
                status: 'pending',
                description: orderInfo,
                ipAddress: ipAddr
            });

        } else if (paymentType === 'order_deposit' || paymentType === 'order_full') {
            if (!orderId) {
                return res.status(400).json({ message: 'Thiếu orderId' });
            }

            const order = await Order.findByPk(orderId, {
                include: [{ model: Product, as: 'product' }]
            });

            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            }

            if (order.retailerId !== userId) {
                return res.status(403).json({ message: 'Bạn không có quyền thanh toán đơn hàng này' });
            }

            relatedId = orderId;
            orderType = 'order';

            // Tính số tiền cần thanh toán
            let paymentAmount;
            if (paymentType === 'order_deposit') {
                paymentAmount = order.totalPrice * 0.3; // 30% cọc
                orderInfo = `Dat coc don hang #${orderId}`;
            } else {
                paymentAmount = order.totalPrice - (order.depositAmount || 0); // Toàn bộ hoặc phần còn lại
                orderInfo = `Thanh toan don hang #${orderId}`;
            }

            // Validate amount nếu có truyền vào
            if (amount && Math.abs(amount - paymentAmount) > 0.01) {
                return res.status(400).json({ message: 'Số tiền thanh toán không khớp' });
            }

            // Tạo payment record
            paymentRecord = await Payment.create({
                userId,
                orderId,
                paymentType,
                amount: paymentAmount,
                currency: 'VND',
                vnp_TxnRef: vnpayHelper.generateTxnRef('ORD', orderId),
                status: 'pending',
                description: orderInfo || description,
                ipAddress: ipAddr
            });
        } else {
            return res.status(400).json({ message: 'Loại thanh toán không hợp lệ' });
        }

        // Tạo payment URL từ VNPay
        const paymentData = vnpayHelper.createPaymentUrl({
            amount: paymentRecord.amount,
            orderId: relatedId,
            orderInfo: paymentRecord.description,
            orderType,
            locale: 'vn',
            txnRef: paymentRecord.vnp_TxnRef,
            ipAddr: ipAddr
        });

        // Cập nhật payment record với payment URL
        paymentRecord.paymentUrl = paymentData.paymentUrl;
        paymentRecord.vnp_SecureHash = paymentData.secureHash;
        await paymentRecord.save();

        res.json({
            message: 'Tạo yêu cầu thanh toán thành công',
            payment: {
                id: paymentRecord.id,
                txnRef: paymentRecord.vnp_TxnRef,
                amount: paymentRecord.amount,
                paymentUrl: paymentData.paymentUrl
            }
        });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ 
            message: 'Lỗi tạo yêu cầu thanh toán', 
            error: error.message 
        });
    }
};

/**
 * Xử lý callback từ VNPay (Return URL)
 */
exports.vnpayReturn = async (req, res) => {
    try {
        // Verify callback
        const verification = vnpayHelper.verifyCallback(req.query);

        if (!verification.isValid) {
            return res.status(400).json({ 
                message: 'Chữ ký không hợp lệ', 
                error: verification.error 
            });
        }

        const { data } = verification;
        const { txnRef, responseCode, transactionNo, transactionStatus, amount } = data;

        // Tìm payment record
        const payment = await Payment.findOne({ where: { vnp_TxnRef: txnRef } });

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        // Kiểm tra response code
        const responseCheck = vnpayHelper.checkResponseCode(responseCode);
        const isSuccess = responseCheck.success && transactionStatus === '00';

        // Cập nhật payment record
        payment.vnp_ResponseCode = responseCode;
        payment.vnp_TransactionNo = transactionNo;
        payment.vnp_TransactionStatus = transactionStatus;
        payment.vnp_SecureHash = data.secureHash;
        payment.status = isSuccess ? 'success' : 'failed';
        
        if (isSuccess) {
            payment.paidAt = new Date();
        }

        await payment.save();

        // Xử lý logic nghiệp vụ sau khi thanh toán thành công
        if (isSuccess) {
            await handlePaymentSuccess(payment);
        }

        // Redirect về frontend với kết quả
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/payment/result?status=${isSuccess ? 'success' : 'failed'}&txnRef=${txnRef}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Error processing VNPay return:', error);
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/payment/result?status=error`);
    }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * IPN được gọi tự động bởi VNPay để xác nhận giao dịch
 */
exports.vnpayIpn = async (req, res) => {
    try {
        // Verify callback
        const verification = vnpayHelper.verifyCallback(req.query);

        if (!verification.isValid) {
            return res.status(400).json({ 
                RspCode: '97',
                Message: 'Checksum failed' 
            });
        }

        const { data } = verification;
        const { txnRef, responseCode, transactionNo, transactionStatus } = data;

        // Tìm payment record
        const payment = await Payment.findOne({ where: { vnp_TxnRef: txnRef } });

        if (!payment) {
            return res.status(404).json({ 
                RspCode: '01',
                Message: 'Order not found' 
            });
        }

        // Nếu đã xử lý rồi thì không xử lý lại
        if (payment.status === 'success') {
            return res.json({ 
                RspCode: '00',
                Message: 'Success' 
            });
        }

        // Kiểm tra response code
        const responseCheck = vnpayHelper.checkResponseCode(responseCode);
        const isSuccess = responseCheck.success && transactionStatus === '00';

        // Cập nhật payment record
        payment.vnp_ResponseCode = responseCode;
        payment.vnp_TransactionNo = transactionNo;
        payment.vnp_TransactionStatus = transactionStatus;
        payment.status = isSuccess ? 'success' : 'failed';
        
        if (isSuccess) {
            payment.paidAt = new Date();
        }

        await payment.save();

        // Xử lý logic nghiệp vụ sau khi thanh toán thành công
        if (isSuccess) {
            await handlePaymentSuccess(payment);
        }

        res.json({ 
            RspCode: '00',
            Message: 'Success' 
        });

    } catch (error) {
        console.error('Error processing VNPay IPN:', error);
        res.status(500).json({ 
            RspCode: '99',
            Message: 'Unknown error' 
        });
    }
};

/**
 * Lấy thông tin payment theo TxnRef
 */
exports.getPaymentByTxnRef = async (req, res) => {
    try {
        const { txnRef } = req.params;

        const payment = await Payment.findOne({
            where: { vnp_TxnRef: txnRef },
            include: [
                { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
                { model: Order, as: 'order', required: false },
                { model: Subscription, as: 'subscription', required: false }
            ]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        res.json({ payment });

    } catch (error) {
        console.error('Error getting payment:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin giao dịch', error: error.message });
    }
};

/**
 * Lấy danh sách payments của user
 */
exports.getMyPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, paymentType } = req.query;

        const whereClause = { userId };
        if (status) {
            whereClause.status = status;
        }
        if (paymentType) {
            whereClause.paymentType = paymentType;
        }

        const payments = await Payment.findAll({
            where: whereClause,
            include: [
                { model: Order, as: 'order', required: false },
                { model: Subscription, as: 'subscription', required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ payments });

    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách giao dịch', error: error.message });
    }
};

/**
 * Helper function: Xử lý logic sau khi thanh toán thành công
 */
async function handlePaymentSuccess(payment) {
    try {
        if (payment.paymentType === 'subscription') {
            // Kích hoạt subscription
            const subscription = await Subscription.findByPk(payment.subscriptionId);
            if (subscription) {
                subscription.status = 'active';
                await subscription.save();

                // Gửi thông báo
                await createNotificationInternal(
                    payment.userId,
                    'Thanh toán thành công',
                    `Gói dịch vụ ${subscription.packageType} đã được kích hoạt thành công!`,
                    'subscription'
                );
            }

        } else if (payment.paymentType === 'order_deposit') {
            // Cập nhật đơn hàng: đã đặt cọc
            const order = await Order.findByPk(payment.orderId);
            if (order) {
                order.depositAmount = payment.amount;
                order.status = 'deposited';
                await order.save();

                // Gửi thông báo cho Farm Owner
                const product = await Product.findByPk(order.productId);
                if (product) {
                    const farm = await Farm.findByPk(product.farmId);
                    if (farm) {
                        await createNotificationInternal(
                            farm.ownerId,
                            'Đã thanh toán cọc',
                            `Đơn hàng #${order.id} đã được thanh toán tiền cọc (${payment.amount.toLocaleString()}đ)`,
                            'order'
                        );
                    }
                }
            }

        } else if (payment.paymentType === 'order_full') {
            // Cập nhật đơn hàng: đã thanh toán đầy đủ
            const order = await Order.findByPk(payment.orderId);
            if (order) {
                // Có thể cập nhật status thành 'confirmed' hoặc 'shipping'
                if (order.status === 'deposited') {
                    order.status = 'confirmed';
                }
                await order.save();

                // Gửi thông báo
                const product = await Product.findByPk(order.productId);
                if (product) {
                    const farm = await Farm.findByPk(product.farmId);
                    if (farm) {
                        await createNotificationInternal(
                            farm.ownerId,
                            'Thanh toán đầy đủ',
                            `Đơn hàng #${order.id} đã được thanh toán đầy đủ`,
                            'order'
                        );
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error handling payment success:', error);
        // Không throw error để không ảnh hưởng đến response
    }
}

