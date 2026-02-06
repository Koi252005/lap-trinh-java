// src/controllers/publicController.js
const { Product, Farm, FarmingSeason, FarmingProcess, Order, User } = require('../models');
const { Op } = require('sequelize');

// Sample farms for when database is not connected
const sampleFarms = [
    {
        id: 1,
        name: 'Trang Trại Rau Sạch Củ Chi',
        address: 'Huyện Củ Chi, TP.HCM',
        certification: 'VietGAP',
        description: 'Chuyên trồng các loại rau xanh sạch, không sử dụng thuốc trừ sâu, đảm bảo an toàn thực phẩm',
        location_coords: '10.8231,106.6297',
        owner: { id: 1, fullName: 'Nguyễn Văn A' },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        name: 'Nông Trại Hữu Cơ Đà Lạt',
        address: 'Thành phố Đà Lạt, Lâm Đồng',
        certification: 'Organic',
        description: 'Nông trại hữu cơ chuyên canh tác rau củ quả theo tiêu chuẩn organic, không hóa chất',
        location_coords: '11.9404,108.4583',
        owner: { id: 2, fullName: 'Trần Thị B' },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        name: 'Vườn Rau Sạch Mộc Châu',
        address: 'Huyện Mộc Châu, Sơn La',
        certification: 'GlobalGAP',
        description: 'Vườn rau sạch trên cao nguyên Mộc Châu, khí hậu mát mẻ, sản phẩm tươi ngon',
        location_coords: '20.8383,104.6333',
        owner: { id: 3, fullName: 'Lê Văn C' },
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        name: 'Trang Trại Rau Xanh Bến Tre',
        address: 'Tỉnh Bến Tre',
        certification: 'VietGAP',
        description: 'Trang trại chuyên canh tác rau xanh theo phương pháp thủy canh, năng suất cao',
        location_coords: '10.2333,106.3833',
        owner: { id: 4, fullName: 'Phạm Thị D' },
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Sample products for when database is not connected
const sampleProducts = [
    // Trang Trại 1 - Rau Sạch Củ Chi
    {
        id: 1,
        name: 'Rau Xà Lách Tươi',
        batchCode: 'BATCH-LETTUCE-001',
        quantity: 50,
        price: 25000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        name: 'Cà Chua Bi Đỏ',
        batchCode: 'BATCH-TOMATO-001',
        quantity: 30,
        price: 35000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        name: 'Dưa Chuột Sạch',
        batchCode: 'BATCH-CUCUMBER-001',
        quantity: 40,
        price: 20000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Trang Trại 2 - Hữu Cơ Đà Lạt
    {
        id: 4,
        name: 'Ớt Chuông Đỏ Hữu Cơ',
        batchCode: 'BATCH-BELLPEPPER-002',
        quantity: 25,
        price: 55000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 5,
        name: 'Cải Bó Xôi Hữu Cơ',
        batchCode: 'BATCH-SPINACH-002',
        quantity: 35,
        price: 40000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 6,
        name: 'Cà Rốt Tươi Hữu Cơ',
        batchCode: 'BATCH-CARROT-002',
        quantity: 60,
        price: 32000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 7,
        name: 'Bắp Cải Tím Đà Lạt',
        batchCode: 'BATCH-CABBAGE-001',
        quantity: 45,
        price: 28000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Trang Trại 3 - Mộc Châu
    {
        id: 8,
        name: 'Cải Thảo Mộc Châu',
        batchCode: 'BATCH-CHINESE-CABBAGE-001',
        quantity: 55,
        price: 24000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 9,
        name: 'Cải Ngọt Tươi',
        batchCode: 'BATCH-MUSTARD-001',
        quantity: 40,
        price: 18000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 10,
        name: 'Rau Muống Sạch',
        batchCode: 'BATCH-WATER-SPINACH-001',
        quantity: 50,
        price: 15000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // Trang Trại 4 - Bến Tre
    {
        id: 11,
        name: 'Rau Dền Đỏ',
        batchCode: 'BATCH-AMARANTH-001',
        quantity: 35,
        price: 20000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 12,
        name: 'Rau Mồng Tơi',
        batchCode: 'BATCH-MALABAR-001',
        quantity: 30,
        price: 16000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 13,
        name: 'Cải Xanh',
        batchCode: 'BATCH-GREEN-CABBAGE-001',
        quantity: 45,
        price: 22000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 14,
        name: 'Rau Cải Ngồng',
        batchCode: 'BATCH-FLOWERING-CABBAGE-001',
        quantity: 25,
        price: 30000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // ========== THÊM SẢN PHẨM MỚI ==========
    // TRÁI CÂY - Trang Trại 1
    {
        id: 15,
        name: 'Cam Sành Tươi',
        batchCode: 'BATCH-ORANGE-001',
        quantity: 80,
        price: 45000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 16,
        name: 'Chuối Tiêu Chín',
        batchCode: 'BATCH-BANANA-001',
        quantity: 100,
        price: 18000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 17,
        name: 'Dưa Hấu Ruột Đỏ',
        batchCode: 'BATCH-WATERMELON-001',
        quantity: 40,
        price: 25000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // TRÁI CÂY - Trang Trại 2 (Đà Lạt)
    {
        id: 18,
        name: 'Dâu Tây Đà Lạt',
        batchCode: 'BATCH-STRAWBERRY-002',
        quantity: 30,
        price: 120000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 19,
        name: 'Bơ Sáp Đà Lạt',
        batchCode: 'BATCH-AVOCADO-002',
        quantity: 50,
        price: 65000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 20,
        name: 'Ổi Đà Lạt',
        batchCode: 'BATCH-GUAVA-002',
        quantity: 60,
        price: 35000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 21,
        name: 'Thanh Long Ruột Đỏ',
        batchCode: 'BATCH-DRAGONFRUIT-002',
        quantity: 45,
        price: 40000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // TRÁI CÂY - Trang Trại 3 (Mộc Châu)
    {
        id: 22,
        name: 'Xoài Cát Hòa Lộc',
        batchCode: 'BATCH-MANGO-003',
        quantity: 70,
        price: 55000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 23,
        name: 'Nhãn Lồng Mộc Châu',
        batchCode: 'BATCH-LONGAN-003',
        quantity: 55,
        price: 42000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 24,
        name: 'Chôm Chôm Nhãn',
        batchCode: 'BATCH-RAMBUTAN-003',
        quantity: 50,
        price: 48000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // TRÁI CÂY - Trang Trại 4 (Bến Tre)
    {
        id: 25,
        name: 'Bưởi Năm Roi',
        batchCode: 'BATCH-POMELO-004',
        quantity: 65,
        price: 38000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 26,
        name: 'Dứa Cayenne',
        batchCode: 'BATCH-PINEAPPLE-004',
        quantity: 40,
        price: 28000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 27,
        name: 'Sầu Riêng Ri6',
        batchCode: 'BATCH-DURIAN-004',
        quantity: 20,
        price: 150000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // CỦ QUẢ - Trang Trại 1
    {
        id: 28,
        name: 'Khoai Tây Tươi',
        batchCode: 'BATCH-POTATO-001',
        quantity: 90,
        price: 22000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 29,
        name: 'Khoai Lang Mật',
        batchCode: 'BATCH-SWEET-POTATO-001',
        quantity: 75,
        price: 20000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 30,
        name: 'Hành Tây Tím',
        batchCode: 'BATCH-ONION-001',
        quantity: 60,
        price: 30000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // CỦ QUẢ - Trang Trại 2
    {
        id: 31,
        name: 'Tỏi Lý Sơn',
        batchCode: 'BATCH-GARLIC-002',
        quantity: 50,
        price: 85000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 32,
        name: 'Gừng Tươi',
        batchCode: 'BATCH-GINGER-002',
        quantity: 40,
        price: 45000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 33,
        name: 'Nghệ Vàng',
        batchCode: 'BATCH-TURMERIC-002',
        quantity: 35,
        price: 50000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 34,
        name: 'Củ Cải Trắng',
        batchCode: 'BATCH-RADISH-002',
        quantity: 55,
        price: 18000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // CỦ QUẢ - Trang Trại 3
    {
        id: 35,
        name: 'Khoai Môn Tím',
        batchCode: 'BATCH-TARO-003',
        quantity: 45,
        price: 25000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 36,
        name: 'Củ Dền Đỏ',
        batchCode: 'BATCH-BEETROOT-003',
        quantity: 40,
        price: 32000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // RAU CỦ THÊM - Trang Trại 1
    {
        id: 37,
        name: 'Bí Đỏ',
        batchCode: 'BATCH-PUMPKIN-001',
        quantity: 30,
        price: 15000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 38,
        name: 'Bí Xanh',
        batchCode: 'BATCH-ZUCCHINI-001',
        quantity: 35,
        price: 20000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 39,
        name: 'Đậu Bắp',
        batchCode: 'BATCH-OKRA-001',
        quantity: 40,
        price: 25000,
        status: 'available',
        farm: sampleFarms[0],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // RAU CỦ THÊM - Trang Trại 2
    {
        id: 40,
        name: 'Cà Tím',
        batchCode: 'BATCH-EGGPLANT-002',
        quantity: 30,
        price: 30000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 41,
        name: 'Đậu Que',
        batchCode: 'BATCH-GREEN-BEANS-002',
        quantity: 45,
        price: 28000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 42,
        name: 'Mướp Hương',
        batchCode: 'BATCH-LUFFA-002',
        quantity: 35,
        price: 22000,
        status: 'available',
        farm: sampleFarms[1],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // RAU CỦ THÊM - Trang Trại 3
    {
        id: 43,
        name: 'Hành Lá',
        batchCode: 'BATCH-SCALLION-003',
        quantity: 50,
        price: 15000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 44,
        name: 'Ngò Rí',
        batchCode: 'BATCH-CILANTRO-003',
        quantity: 40,
        price: 18000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 45,
        name: 'Rau Thơm',
        batchCode: 'BATCH-HERBS-003',
        quantity: 35,
        price: 20000,
        status: 'available',
        farm: sampleFarms[2],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // RAU CỦ THÊM - Trang Trại 4
    {
        id: 46,
        name: 'Rau Cần Nước',
        batchCode: 'BATCH-WATER-CELERY-004',
        quantity: 40,
        price: 22000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 47,
        name: 'Rau Cải Cúc',
        batchCode: 'BATCH-CHRYSANTHEMUM-004',
        quantity: 30,
        price: 25000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 48,
        name: 'Rau Đắng',
        batchCode: 'BATCH-BITTER-GREENS-004',
        quantity: 25,
        price: 28000,
        status: 'available',
        farm: sampleFarms[3],
        season: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

/**
 * Trả về response sản phẩm mẫu (dùng khi DB lỗi hoặc bất kỳ lỗi nào) - không bao giờ throw
 */
function sendSampleProductsResponse(res, req) {
    try {
        const q = req && req.query || {};
        const page = Math.max(1, parseInt(q.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 20));
        const search = typeof q.search === 'string' ? q.search.trim() : '';
        let list = sampleProducts;
        if (search) {
            const term = search.toLowerCase();
            list = sampleProducts.filter(p =>
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.farm && p.farm.name && p.farm.name.toLowerCase().includes(term))
            );
        }
        const total = list.length;
        const start = (page - 1) * limit;
        const products = list.slice(start, start + limit);
        res.status(200).json({
            products,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            warning: 'Đang hiển thị sản phẩm mẫu.'
        });
    } catch (e) {
        res.status(200).json({ products: sampleProducts.slice(0, 20), pagination: { total: sampleProducts.length, page: 1, limit: 20, totalPages: 1 } });
    }
}

/**
 * Lấy danh sách sản phẩm công khai (Marketplace) - không bao giờ trả 500
 */
exports.getPublicProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query || {};
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        let whereClause = { status: 'available' };
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$farm.name$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'price', 'quantity', 'batchCode', 'status', 'farmId', 'createdAt'],
            include: [
                { model: Farm, as: 'farm', attributes: ['id', 'name', 'address', 'certification'], required: false },
                { model: FarmingSeason, as: 'season', attributes: ['id', 'name', 'startDate', 'endDate'], required: false }
            ],
            limit: limitNum,
            offset,
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        return res.status(200).json({
            products,
            pagination: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) }
        });
    } catch (error) {
        console.warn('getPublicProducts error:', error && error.message);
        // KHÔNG trả về sample products - ID không có trong DB sẽ gây lỗi "sản phẩm không tồn tại" khi đặt hàng
        return res.status(200).json({
            products: [],
            pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
            needsSeed: true,
            message: 'Chưa có sản phẩm. Bấm "Tạo sản phẩm mẫu" hoặc kiểm tra kết nối database.'
        });
    }
};

/**
 * Lấy thông tin sản phẩm công khai - dùng findByPk + include required:false để tránh lỗi JOIN
 */
exports.getPublicProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id, 10);
        if (isNaN(productId) || productId < 1) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        const product = await Product.findByPk(productId, {
            include: [
                { model: Farm, as: 'farm', attributes: ['id', 'name', 'address', 'certification', 'description'], required: false },
                { model: FarmingSeason, as: 'season', attributes: ['id', 'name', 'startDate', 'endDate', 'status'], required: false }
            ]
        });

        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        if (product.status !== 'available') return res.status(404).json({ message: 'Sản phẩm không còn bán (trạng thái: ' + product.status + ')' });

        res.json({ product: product.toJSON ? product.toJSON() : product });

    } catch (error) {
        console.warn('getPublicProduct error:', error && error.message);
        res.status(404).json({
            message: 'Sản phẩm không tồn tại. Bấm "Tạo sản phẩm mẫu" trên trang Sàn rồi thử lại.',
            needsSeed: true
        });
    }
};

/**
 * Truy xuất nguồn gốc sản phẩm (Public - từ Season ID)
 */
exports.getTraceability = async (req, res) => {
    try {
        const { id } = req.params;

        const season = await FarmingSeason.findByPk(id, {
            include: [
                {
                    model: Farm,
                    as: 'farm',
                    attributes: ['id', 'name', 'address', 'certification', 'description', 'location_coords']
                },
                {
                    model: FarmingProcess,
                    as: 'processes',
                    order: [['createdAt', 'ASC']]
                }
            ]
        });

        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // Lấy thông tin sản phẩm liên quan (nếu có)
        const products = await Product.findAll({
            where: { seasonId: id },
            attributes: ['id', 'name', 'batchCode', 'quantity', 'price']
        });

        res.json({
            season: {
                id: season.id,
                name: season.name,
                startDate: season.startDate,
                endDate: season.endDate,
                status: season.status,
                txHash: season.txHash,
                farm: season.farm,
                processes: season.processes,
                products: products
            }
        });

    } catch (error) {
        console.error('Error getting traceability:', error);
        res.status(500).json({ message: 'Lỗi truy xuất nguồn gốc', error: error.message });
    }
};

/**
 * Truy xuất nguồn gốc sản phẩm (Public - từ Product ID)
 */
exports.getProductTraceability = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Farm,
                    as: 'farm',
                    attributes: ['id', 'name', 'address', 'certification', 'description', 'location_coords']
                },
                {
                    model: FarmingSeason,
                    as: 'season',
                    include: [
                        {
                            model: FarmingProcess,
                            as: 'processes',
                            order: [['createdAt', 'ASC']]
                        }
                    ]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        res.json({
            product: {
                id: product.id,
                name: product.name,
                batchCode: product.batchCode,
                quantity: product.quantity,
                price: product.price,
                txHash: product.txHash,
                farm: product.farm,
                season: product.season ? {
                    id: product.season.id,
                    name: product.season.name,
                    startDate: product.season.startDate,
                    endDate: product.season.endDate,
                    status: product.season.status,
                    txHash: product.season.txHash,
                    processes: product.season.processes
                } : null
            }
        });

    } catch (error) {
        console.error('Error getting product traceability:', error);
        res.status(500).json({ message: 'Lỗi truy xuất nguồn gốc', error: error.message });
    }
};

/**
 * Lấy danh sách trang trại công khai
 */
exports.getPublicFarms = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: farms } = await Farm.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'fullName']
                }
            ],
            attributes: ['id', 'name', 'address', 'certification', 'description', 'location_coords'],
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
        console.error('Error getting public farms:', error);
        
        // If database error, return sample farms
        if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
            console.warn('Database not connected, returning sample farms');
            let filteredFarms = sampleFarms;
            
            // Apply search filter if provided
            if (req.query.search) {
                const searchTerm = req.query.search.toLowerCase();
                filteredFarms = sampleFarms.filter(f => 
                    f.name.toLowerCase().includes(searchTerm) ||
                    f.address.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply pagination
            const start = offset;
            const end = start + parseInt(req.query.limit || 20);
            const paginatedFarms = filteredFarms.slice(start, end);
            
            return res.json({
                farms: paginatedFarms,
                pagination: {
                    total: filteredFarms.length,
                    page: parseInt(page),
                    limit: parseInt(req.query.limit || 20),
                    totalPages: Math.ceil(filteredFarms.length / parseInt(req.query.limit || 20))
                },
                warning: 'Database chưa kết nối. Đang hiển thị trang trại mẫu.'
            });
        }
        
        res.status(500).json({ message: 'Lỗi lấy danh sách trang trại', error: error.message });
    }
};

/**
 * Lấy thông tin trang trại công khai
 */
exports.getPublicFarm = async (req, res) => {
    try {
        const { id } = req.params;

        const farm = await Farm.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'fullName']
                },
                {
                    model: FarmingSeason,
                    as: 'seasons',
                    where: { status: 'completed' },
                    required: false,
                    attributes: ['id', 'name', 'startDate', 'endDate']
                }
            ],
            attributes: ['id', 'name', 'address', 'certification', 'description', 'location_coords']
        });

        if (!farm) {
            // Try to find in sample farms
            const sampleFarm = sampleFarms.find(f => f.id === parseInt(id));
            if (sampleFarm) {
                return res.json({ 
                    farm: {
                        ...sampleFarm,
                        seasons: []
                    },
                    warning: 'Database chưa kết nối. Đang hiển thị thông tin trang trại mẫu.'
                });
            }
            return res.status(404).json({ message: 'Trang trại không tồn tại' });
        }

        res.json({ farm });

    } catch (error) {
        console.error('Error getting public farm:', error);
        
        // If database error, try sample farms
        if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
            const sampleFarm = sampleFarms.find(f => f.id === parseInt(req.params.id));
            if (sampleFarm) {
                return res.json({ 
                    farm: {
                        ...sampleFarm,
                        seasons: []
                    },
                    warning: 'Database chưa kết nối. Đang hiển thị thông tin trang trại mẫu.'
                });
            }
        }
        
        res.status(500).json({ message: 'Lỗi lấy thông tin trang trại', error: error.message });
    }
};

