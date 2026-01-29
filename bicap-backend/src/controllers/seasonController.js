// src/controllers/seasonController.js
const { FarmingSeason, FarmingProcess, Farm } = require('../models');
const blockchainHelper = require('../utils/blockchainHelper');
const qrGenerator = require('../utils/qrGenerator');
const { getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Start a new Farming Season
// @route   POST /api/seasons
// @access  Private (Farm Owner)
exports.createSeason = async (req, res) => {
    try {
        const { name, startDate, endDate, farmId } = req.body;

        // 1. Verify ownership of the farm
        const farm = await Farm.findByPk(farmId);
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

        // 3. Log to Blockchain (Mock)
        const txHash = await blockchainHelper.writeToBlockchain({
            type: 'START_SEASON',
            seasonId: newSeason.id,
            farmId: farmId,
            startDate: startDate
        });

        // Update txHash in DB
        newSeason.txHash = txHash;
        await newSeason.save();

        res.status(201).json({
            message: 'Tạo mùa vụ thành công!',
            season: newSeason,
            txHash: txHash
        });

    } catch (error) {
        console.error(error);
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
        
        // Lấy imageUrl từ uploaded file hoặc từ body
        let imageUrl = req.body.imageUrl;
        if (req.file) {
            imageUrl = getFileUrl(req, req.file.path);
        }

        // 1. Check Season existence
        const season = await FarmingSeason.findByPk(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Verify Ownership (via Farm)
        const farm = await Farm.findByPk(season.farmId);
        if (farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền thêm hoạt động vào mùa vụ này' });
        }

        // 3. Create Process Record
        const newProcess = await FarmingProcess.create({
            type, // e.g., 'watering', 'fertilizing', 'harvesting'
            description,
            imageUrl,
            seasonId
        });

        // 4. Log to Blockchain (Mock)
        const txHash = await blockchainHelper.writeToBlockchain({
            type: 'ADD_PROCESS',
            processId: newProcess.id,
            seasonId: seasonId,
            action: type,
            details: description
        });

        // Update txHash in DB
        newProcess.txHash = txHash;
        await newProcess.save();

        res.status(201).json({
            message: 'Ghi nhật ký hoạt động thành công!',
            process: newProcess,
            txHash: txHash
        });

    } catch (error) {
        console.error(error);
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

        // 1. Check Season existence
        const season = await FarmingSeason.findByPk(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Verify Ownership
        const farm = await Farm.findByPk(season.farmId);
        if (farm.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
        }

        // 3. Update status
        season.status = 'completed';
        if (!season.endDate) {
            season.endDate = new Date();
        }

        // 4. Log to Blockchain (Mock)
        const txHash = await blockchainHelper.writeToBlockchain({
            type: 'EXPORT_SEASON',
            seasonId: seasonId,
            status: 'completed'
        });

        season.txHash = txHash;
        await season.save();

        // 5. Generate Response with QR Code Data
        // URL for the public traceability page
        const traceabilityLink = qrGenerator.generateTraceabilityURL(seasonId);

        res.json({
            message: 'Xuất mùa vụ thành công!',
            season: season,
            qrCodeData: traceabilityLink,
            qrCodeImageUrl: `${process.env.API_URL || 'http://localhost:5001'}/api/seasons/${seasonId}/qr-code`,
            txHash: txHash
        });

    } catch (error) {
        console.error(error);
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

        // 1. Check Season existence
        const season = await FarmingSeason.findByPk(seasonId, {
            include: [{ model: Farm, as: 'farm', attributes: ['name'] }]
        });

        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Generate traceability URL
        const traceabilityURL = qrGenerator.generateTraceabilityURL(seasonId);

        // 3. Generate QR code based on format
        if (format === 'svg') {
            const svg = await qrGenerator.generateSVG(traceabilityURL, {
                width: parseInt(size)
            });
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.send(svg);
        } else {
            // Default: PNG
            const buffer = await qrGenerator.generateBuffer(traceabilityURL, {
                width: parseInt(size)
            });
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename="qr-season-${seasonId}.png"`);
            return res.send(buffer);
        }

    } catch (error) {
        console.error('Error generating QR code:', error);
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

        // 1. Check Season existence
        const season = await FarmingSeason.findByPk(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Mùa vụ không tồn tại' });
        }

        // 2. Generate traceability URL
        const traceabilityURL = qrGenerator.generateTraceabilityURL(seasonId);

        // 3. Generate QR code as Data URL
        const dataURL = await qrGenerator.generateDataURL(traceabilityURL, {
            width: parseInt(size)
        });

        res.json({
            seasonId: seasonId,
            traceabilityURL: traceabilityURL,
            qrCodeDataURL: dataURL
        });

    } catch (error) {
        console.error('Error generating QR code Data URL:', error);
        res.status(500).json({ 
            message: 'Lỗi tạo mã QR', 
            error: error.message 
        });
    }
};
