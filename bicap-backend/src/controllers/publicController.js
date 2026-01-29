// src/controllers/publicController.js
const { Product, Farm, FarmingSeason, FarmingProcess, Order, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy danh sách sản phẩm công khai (Marketplace)
 */
exports.getPublicProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = { status: 'available' };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$farm.name$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Farm,
                    as: 'farm',
                    attributes: ['id', 'name', 'address', 'certification'],
                    where: search ? undefined : {}
                },
                {
                    model: FarmingSeason,
                    as: 'season',
                    attributes: ['id', 'name', 'startDate', 'endDate']
                }
            ],
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        res.json({
            products,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error getting public products:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm', error: error.message });
    }
};

/**
 * Lấy thông tin sản phẩm công khai
 */
exports.getPublicProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            where: { status: 'available' },
            include: [
                {
                    model: Farm,
                    as: 'farm',
                    attributes: ['id', 'name', 'address', 'certification', 'description']
                },
                {
                    model: FarmingSeason,
                    as: 'season',
                    attributes: ['id', 'name', 'startDate', 'endDate', 'status']
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại hoặc không còn bán' });
        }

        res.json({ product });

    } catch (error) {
        console.error('Error getting public product:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin sản phẩm', error: error.message });
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
            return res.status(404).json({ message: 'Trang trại không tồn tại' });
        }

        res.json({ farm });

    } catch (error) {
        console.error('Error getting public farm:', error);
        res.status(500).json({ message: 'Lỗi lấy thông tin trang trại', error: error.message });
    }
};

