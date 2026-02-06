// src/controllers/seasonController.js
const { FarmingSeason, FarmingProcess, Farm } = require('../models');
const blockchainHelper = require('../utils/blockchainHelper');
const qrGenerator = require('../utils/qrGenerator');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// In-memory store for seasons when database is not connected
// Key: firebaseUid, Value: Array of seasons
const memorySeasonsStore = new Map();

// @desc    Start a new Farming Season
// @route   POST /api/seasons
// @access  Private (Farm Owner)
exports.createSeason = async (req, res) => {
    try {
        const { name, startDate, endDate, farmId } = req.body;
        const firebaseUid = req.user?.firebaseUid;

        // Check if user ID exists (database might not be connected)
        if (!req.user?.id) {
            // Database not connected - try to create season in memory
            if (!firebaseUid) {
                return res.status(500).json({ 
                    message: 'Database chưa kết nối và không có thông tin người dùng. Vui lòng kết nối database và đăng nhập lại.' 
                });
            }

            // Try to get farm from memory store
            const { memoryFarmsStore } = require('./farmController');
            let farm = null;
            if (memoryFarmsStore.has(firebaseUid)) {
                const farms = memoryFarmsStore.get(firebaseUid);
                farm = farms.find(f => f.id == farmId || f.id === parseInt(farmId));
            }

            if (!farm) {
                return res.status(404).json({ 
                    message: 'Nông trại không tồn tại. Vui lòng tạo trang trại trước khi tạo mùa vụ.' 
                });
            }

            // Create mock season in memory
            const mockSeason = {
                id: Date.now(),
                name,
                startDate,
                endDate,
                farmId: farm.id,
                status: 'active',
                txHash: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save to memory store
            if (!memorySeasonsStore.has(firebaseUid)) {
                memorySeasonsStore.set(firebaseUid, []);
            }
            memorySeasonsStore.get(firebaseUid).push(mockSeason);

            // Generate blockchain hash
            let txHash;
            try {
                txHash = await blockchainHelper.writeToBlockchain({
                    type: 'START_SEASON',
                    seasonId: mockSeason.id,
                    farmId: farm.id,
                    startDate: startDate
                });
                mockSeason.txHash = txHash;
            } catch (blockchainError) {
                console.error('Blockchain error (non-fatal):', blockchainError);
            }

            console.warn('Database not connected, saving season to memory store');
            return res.status(200).json({
                message: 'Tạo mùa vụ thành công (Database chưa kết nối - chỉ lưu tạm)',
                season: mockSeason,
                txHash: txHash || 'Blockchain chưa sẵn sàng',
                warning: 'Database chưa kết nối. Mùa vụ chưa được lưu vào database. Vui lòng kết nối database để lưu vĩnh viễn.'
            });
        }

        // 1. Verify ownership of the farm
        let farm;
        try {
            farm = await Farm.findByPk(farmId);
        } catch (dbError) {
            if (dbError.name === 'SequelizeConnectionError' || dbError.name === 'SequelizeHostNotFoundError') {
                // Try memory store
                const { memoryFarmsStore } = require('./farmController');
                if (memoryFarmsStore && memoryFarmsStore.has(firebaseUid)) {
                    const farms = memoryFarmsStore.get(firebaseUid);
                    farm = farms.find(f => f.id == farmId || f.id === parseInt(farmId));
                    if (farm) {
                        // Create in memory
                        const mockSeason = {
                            id: Date.now(),
                            name,
                            startDate,
                            endDate,
                            farmId: farm.id,
                            status: 'active',
                            txHash: null,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        if (!memorySeasonsStore.has(firebaseUid)) {
                            memorySeasonsStore.set(firebaseUid, []);
                        }
                        memorySeasonsStore.get(firebaseUid).push(mockSeason);
                        
                        let txHash;
                        try {
                            txHash = await blockchainHelper.writeToBlockchain({
                                type: 'START_SEASON',
                                seasonId: mockSeason.id,
                                farmId: farm.id,
                                startDate: startDate
                            });
                            mockSeason.txHash = txHash;
                        } catch (blockchainError) {
                            console.error('Blockchain error:', blockchainError);
                        }
                        
                        return res.status(200).json({
                            message: 'Tạo mùa vụ thành công (Database chưa kết nối - chỉ lưu tạm)',
                            season: mockSeason,
                            txHash: txHash || 'Blockchain chưa sẵn sàng',
                            warning: 'Database chưa kết nối. Mùa vụ chưa được lưu vào database.'
                        });
                    }
                }
                return res.status(500).json({ 
                    message: 'Database chưa kết nối. Vui lòng kết nối database để tạo mùa vụ.' 
                });
            }
            throw dbError;
        }

        if (!farm) {
            return res.status(404).json({ message: 'Nông trại không tồn tại' });
        }

        // Check if the current user owns this farm
        if (farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không phải chủ sở hữu nông trại này' });
        }

        // 2. Create Season
        const newSeason = await FarmingSeason.create({
            name,
            startDate,
            endDate,
            farmId,
            status: 'active'
        });

        // 3. Log to Blockchain (Mock) - Always works even if DB fails
        let txHash;
        try {
            txHash = await blockchainHelper.writeToBlockchain({
                type: 'START_SEASON',
                seasonId: newSeason.id,
                farmId: farmId,
                startDate: startDate
            });
        } catch (blockchainError) {
            console.error('Blockchain error (non-fatal):', blockchainError);
            txHash = null; // Continue even if blockchain fails
        }

        // Update txHash in DB if available
        if (txHash) {
            newSeason.txHash = txHash;
            await newSeason.save();
        }

        res.status(201).json({
            message: 'Tạo mùa vụ thành công!',
            season: newSeason,
            txHash: txHash || 'Blockchain chưa sẵn sàng'
        });

    } catch (error) {
        console.error('Create Season Error:', error);
        
        // Handle database connection errors
        if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
            // Try memory store as fallback
            const firebaseUid = req.user?.firebaseUid;
            if (firebaseUid) {
                try {
                    const { memoryFarmsStore } = require('./farmController');
                    if (memoryFarmsStore && memoryFarmsStore.has(firebaseUid)) {
                        const farms = memoryFarmsStore.get(firebaseUid);
                        const farm = farms.find(f => f.id == req.body.farmId || f.id === parseInt(req.body.farmId));
                        if (farm) {
                            const mockSeason = {
                                id: Date.now(),
                                name: req.body.name,
                                startDate: req.body.startDate,
                                endDate: req.body.endDate,
                                farmId: farm.id,
                                status: 'active',
                                txHash: null,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            };
                            if (!memorySeasonsStore.has(firebaseUid)) {
                                memorySeasonsStore.set(firebaseUid, []);
                            }
                            memorySeasonsStore.get(firebaseUid).push(mockSeason);
                            
                            let txHash;
                            try {
                                txHash = await blockchainHelper.writeToBlockchain({
                                    type: 'START_SEASON',
                                    seasonId: mockSeason.id,
                                    farmId: farm.id,
                                    startDate: req.body.startDate
                                });
                                mockSeason.txHash = txHash;
                            } catch (blockchainError) {
                                console.error('Blockchain error:', blockchainError);
                            }
                            
                            return res.status(200).json({
                                message: 'Tạo mùa vụ thành công (Database chưa kết nối - chỉ lưu tạm)',
                                season: mockSeason,
                                txHash: txHash || 'Blockchain chưa sẵn sàng',
                                warning: 'Database chưa kết nối. Mùa vụ chưa được lưu vào database.'
                            });
                        }
                    }
                } catch (memError) {
                    console.error('Memory store error:', memError);
                }
            }
            
            return res.status(500).json({ 
                message: 'Database chưa kết nối. Vui lòng kết nối database để tạo mùa vụ.' 
            });
        }
        
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Add a Farming Process (Log Activity)
// @route   POST /api/seasons/:seasonId/process
// @access  Private (Farm Owner)
exports.addProcess = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const { type, description } = req.body;
        
        // Check if user ID exists
        if (!req.user?.id) {
            return res.status(500).json({ 
                message: 'Database chưa kết nối hoặc người dùng chưa được đồng bộ.' 
            });
        }
        
        // Lấy imageUrl từ uploaded file hoặc từ body
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = getFileUrl(req, req.file.path);
        }

        // 1. Check Season existence
        let season;
        try {
            season = await FarmingSeason.findByPk(seasonId);
        } catch (dbError) {
            if (dbError.name === 'SequelizeConnectionError' || dbError.name === 'SequelizeHostNotFoundError') {
                return res.status(500).json({ 
                    message: 'Database chưa kết nối. Vui lòng kết nối database.' 
                });
            }
            throw dbError;
        }

        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Verify Ownership (via Farm)
        const farm = await Farm.findByPk(season.farmId);
        if (!farm || farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền thêm hoạt động vào mùa vụ này' });
        }

        // 3. Create Process Record
        const newProcess = await FarmingProcess.create({
            type, // e.g., 'watering', 'fertilizing', 'harvesting'
            description,
            imageUrl,
            seasonId
        });

        // 4. Log to Blockchain (Mock) - Non-fatal if fails
        let txHash;
        try {
            txHash = await blockchainHelper.writeToBlockchain({
                type: 'ADD_PROCESS',
                processId: newProcess.id,
                seasonId: seasonId,
                action: type,
                details: description
            });
        } catch (blockchainError) {
            console.error('Blockchain error (non-fatal):', blockchainError);
            txHash = null;
        }

        // Update txHash in DB if available
        if (txHash) {
            newProcess.txHash = txHash;
            await newProcess.save();
        }

        res.status(201).json({
            message: 'Ghi nhật ký hoạt động thành công!',
            process: newProcess,
            txHash: txHash || 'Blockchain chưa sẵn sàng'
        });

    } catch (error) {
        console.error('Add Process Error:', error);
        
        if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
            return res.status(500).json({ 
                message: 'Database chưa kết nối. Vui lòng kết nối database.' 
            });
        }
        
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Get all seasons for a specific farm
// @route   GET /api/seasons/farm/:farmId
// @desc    Get all seasons for a specific farm
// @route   GET /api/seasons/farm/:farmId
exports.getSeasonsByFarm = async (req, res) => {
    try {
        const { farmId } = req.params;
        const { status } = req.query; // Get status from query params
        console.log(`[DEBUG] getSeasonsByFarm: Fetching seasons for Farm ID = ${farmId}, Status = ${status || 'ALL'}`);

        const whereClause = { farmId };
        if (status) {
            whereClause.status = status;
        }

        const seasons = await FarmingSeason.findAll({
            where: whereClause,
            include: [{ model: FarmingProcess, as: 'processes' }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`[DEBUG] getSeasonsByFarm: Found ${seasons.length} seasons`);
        res.json(seasons);
    } catch (error) {
        console.error(`[DEBUG] getSeasonsByFarm Error:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Get a specific season by ID
// @route   GET /api/seasons/:seasonId
exports.getSeasonById = async (req, res) => {
    try {
        const { seasonId } = req.params;
        console.log(`[DEBUG] getSeasonById: Fetching seasonId = ${seasonId}`);

        if (!seasonId || isNaN(seasonId)) {
            return res.status(400).json({ message: 'Invalid Season ID' });
        }

        const season = await FarmingSeason.findByPk(seasonId, {
            include: [
                { model: FarmingProcess, as: 'processes' },
                { model: Farm, as: 'farm' }
            ],
            order: [[{ model: FarmingProcess, as: 'processes' }, 'createdAt', 'DESC']]
        });

        if (!season) {
            console.log(`[DEBUG] getSeasonById: Season ${seasonId} NOT FOUND`);
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        console.log(`[DEBUG] getSeasonById: Found season ${season.id}`);
        res.json(season);
    } catch (error) {
        console.error(`[DEBUG] getSeasonById Error:`, error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Export Season (Finish & Generate QR)
// @route   POST /api/seasons/:seasonId/export
// @access  Private (Farm Owner)
exports.exportSeason = async (req, res) => {
    try {
        const { seasonId } = req.params;

        // Check if user ID exists
        if (!req.user?.id) {
            return res.status(500).json({ 
                message: 'Database chưa kết nối hoặc người dùng chưa được đồng bộ.' 
            });
        }

        // 1. Check Season existence
        let season;
        try {
            season = await FarmingSeason.findByPk(seasonId);
        } catch (dbError) {
            if (dbError.name === 'SequelizeConnectionError' || dbError.name === 'SequelizeHostNotFoundError') {
                return res.status(500).json({ 
                    message: 'Database chưa kết nối. Vui lòng kết nối database.' 
                });
            }
            throw dbError;
        }

        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Verify Ownership
        const farm = await Farm.findByPk(season.farmId);
        if (!farm || farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
        }

        // 3. Update status
        season.status = 'completed';
        if (!season.endDate) {
            season.endDate = new Date();
        }

        // 4. Log to Blockchain (Mock) - Non-fatal if fails
        let txHash;
        try {
            txHash = await blockchainHelper.writeToBlockchain({
                type: 'EXPORT_SEASON',
                seasonId: seasonId,
                status: 'completed'
            });
        } catch (blockchainError) {
            console.error('Blockchain error (non-fatal):', blockchainError);
            txHash = null;
        }

        // Update txHash in DB if available
        if (txHash) {
            season.txHash = txHash;
        }
        await season.save();

        // 5. Generate Response with QR Code Data (always works)
        const traceabilityLink = qrGenerator.generateTraceabilityURL(seasonId);

        res.json({
            message: 'Xuất mùa vụ thành công!',
            season: season,
            qrCodeData: traceabilityLink,
            qrCodeImageUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/seasons/${seasonId}/qr-code`,
            txHash: txHash || 'Blockchain chưa sẵn sàng'
        });

    } catch (error) {
        console.error('Export Season Error:', error);
        
        if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
            return res.status(500).json({ 
                message: 'Database chưa kết nối. Vui lòng kết nối database.' 
            });
        }
        
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Get QR Code Image for Season
// @route   GET /api/seasons/:seasonId/qr-code
// @access  Public (Anyone can scan QR to trace)
exports.getSeasonQRCode = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const { format = 'png', size = 300 } = req.query; // format: png, svg | size: number

        // Validate seasonId
        if (!seasonId || isNaN(seasonId)) {
            return res.status(400).json({ message: 'Season ID không hợp lệ' });
        }

        // Validate size
        const qrSize = parseInt(size);
        if (isNaN(qrSize) || qrSize < 50 || qrSize > 2000) {
            return res.status(400).json({ message: 'Kích thước QR code phải từ 50 đến 2000 pixels' });
        }

        // 1. Check Season existence (optional - QR can work even if season doesn't exist in DB)
        let season = null;
        try {
            season = await FarmingSeason.findByPk(seasonId, {
                include: [{ model: Farm, as: 'farm', attributes: ['name'] }]
            });
        } catch (dbError) {
            // If database error, still generate QR code (traceability page will handle 404)
            console.warn('Database error when fetching season for QR, generating QR anyway:', dbError.message);
        }

        // 2. Generate traceability URL (always works)
        const traceabilityURL = qrGenerator.generateTraceabilityURL(seasonId);

        // 3. Generate QR code based on format
        try {
            if (format === 'svg') {
                const svg = await qrGenerator.generateSVG(traceabilityURL, {
                    width: qrSize
                });
                res.setHeader('Content-Type', 'image/svg+xml');
                return res.send(svg);
            } else {
                // Default: PNG
                const buffer = await qrGenerator.generateBuffer(traceabilityURL, {
                    width: qrSize
                });
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Content-Disposition', `inline; filename="qr-season-${seasonId}.png"`);
                return res.send(buffer);
            }
        } catch (qrError) {
            console.error('QR Generation Error:', qrError);
            return res.status(500).json({ 
                message: 'Lỗi tạo mã QR', 
                error: qrError.message 
            });
        }

    } catch (error) {
        console.error('Error in getSeasonQRCode:', error);
        res.status(500).json({ 
            message: 'Lỗi tạo mã QR', 
            error: error.message 
        });
    }
};

// @desc    Get QR Code Data URL (Base64) for Season
// @route   GET /api/seasons/:seasonId/qr-code-data
// @access  Private (Farm Owner) or Public
exports.getSeasonQRCodeDataURL = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const { size = 300 } = req.query;

        // Validate seasonId
        if (!seasonId || isNaN(seasonId)) {
            return res.status(400).json({ message: 'Season ID không hợp lệ' });
        }

        // Validate size
        const qrSize = parseInt(size);
        if (isNaN(qrSize) || qrSize < 50 || qrSize > 2000) {
            return res.status(400).json({ message: 'Kích thước QR code phải từ 50 đến 2000 pixels' });
        }

        // 1. Check Season existence (optional - QR can work even if season doesn't exist)
        let season = null;
        try {
            season = await FarmingSeason.findByPk(seasonId);
        } catch (dbError) {
            // If database error, still generate QR code
            console.warn('Database error when fetching season for QR, generating QR anyway:', dbError.message);
        }

        // 2. Generate traceability URL (always works)
        const traceabilityURL = qrGenerator.generateTraceabilityURL(seasonId);

        // 3. Generate QR code as Data URL
        try {
            const dataURL = await qrGenerator.generateDataURL(traceabilityURL, {
                width: qrSize
            });

            res.json({
                seasonId: seasonId,
                traceabilityURL: traceabilityURL,
                qrCodeDataURL: dataURL,
                seasonExists: season !== null
            });
        } catch (qrError) {
            console.error('QR Generation Error:', qrError);
            return res.status(500).json({ 
                message: 'Lỗi tạo mã QR', 
                error: qrError.message 
            });
        }

    } catch (error) {
        console.error('Error in getSeasonQRCodeDataURL:', error);
        res.status(500).json({ 
            message: 'Lỗi tạo mã QR', 
            error: error.message 
        });
    }
};
