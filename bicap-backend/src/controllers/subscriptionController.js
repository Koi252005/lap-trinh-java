// src/controllers/subscriptionController.js
const { Subscription, User } = require('../models');

// Định nghĩa các gói dịch vụ (Hardcoded for now)
const PACKAGES = {
    'basic': {
        name: 'Gói Cơ Bản',
        price: 0,
        durationMonths: 1,
        features: ['Quản lý 1 trang trại', 'Xem tin tức']
    },
    'pro': {
        name: 'Gói Chuyên Nghiệp',
        price: 500000,
        durationMonths: 6,
        features: ['Quản lý 5 trang trại', 'Blockchain Integration', 'Xuất mã QR', 'Ưu tiên hỗ trợ']
    },
    'enterprise': {
        name: 'Gói Doanh Nghiệp',
        price: 1000000,
        durationMonths: 12,
        features: ['Không giới hạn trang trại', 'Blockchain', 'QR', 'API Access', 'Hỗ trợ 24/7']
    }
};

// 1. Lấy danh sách gói dịch vụ
exports.getPackages = (req, res) => {
    // Convert object to array for frontend
    const packageList = Object.keys(PACKAGES).map(key => ({
        id: key,
        ...PACKAGES[key]
    }));
    res.json(packageList);
};

// 2. Lấy thông tin gói cước hiện tại của tôi
exports.getMySubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        // Lấy gói active gần nhất (hoặc endDate > now)
        const sub = await Subscription.findOne({
            where: {
                userId,
                status: 'active'
            },
            order: [['endDate', 'DESC']]
        });

        if (!sub) {
            return res.json({ message: 'Bạn chưa đăng ký gói dịch vụ nào.', subscription: null });
        }

        // Kiểm tra hết hạn
        if (new Date(sub.endDate) < new Date()) {
            sub.status = 'expired';
            await sub.save();
            return res.json({ message: 'Gói dịch vụ đã hết hạn.', subscription: sub });
        }

        res.json({ subscription: sub, packageDetails: PACKAGES[sub.packageType] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 3. Đăng ký / Mua gói (Tích hợp VNPay)
exports.subscribe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId } = req.body;

        // Validate package
        if (!PACKAGES[packageId]) {
            return res.status(400).json({ message: 'Gói dịch vụ không hợp lệ' });
        }

        const selectedPackage = PACKAGES[packageId];

        // Tính ngày hết hạn
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + selectedPackage.durationMonths);

        // Nếu gói miễn phí (basic), kích hoạt ngay
        if (selectedPackage.price === 0) {
            const newSub = await Subscription.create({
                userId,
                packageType: packageId,
                startDate,
                endDate,
                amount: selectedPackage.price,
                status: 'active'
            });

            return res.status(201).json({
                message: 'Đăng ký gói miễn phí thành công!',
                subscription: newSub
            });
        }

        // Nếu gói có phí, tạo subscription với status 'pending' và tạo payment request
        const newSub = await Subscription.create({
            userId,
            packageType: packageId,
            startDate,
            endDate,
            amount: selectedPackage.price,
            status: 'pending' // Sẽ được kích hoạt sau khi thanh toán thành công
        });

        // Tạo payment request thông qua payment controller
        // Frontend sẽ gọi API /api/payments với subscriptionId
        res.status(201).json({
            message: 'Đã tạo đăng ký gói. Vui lòng thanh toán để kích hoạt.',
            subscription: newSub,
            paymentRequired: true,
            paymentEndpoint: `/api/payments`,
            paymentData: {
                paymentType: 'subscription',
                subscriptionId: newSub.id,
                amount: selectedPackage.price
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đăng ký gói dịch vụ', error: error.message });
    }
};
