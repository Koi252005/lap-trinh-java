// src/controllers/farmController.js
const { Farm, FarmingSeason, FarmingProcess } = require('../models');
const { Op } = require('sequelize');

// 1. Tạo trang trại mới
exports.createFarm = async (req, res) => {
  try {
    const { name, address, description, certification, location_coords } = req.body;

    // Lấy ID người dùng từ Token (do Middleware giải mã)
    // Đây là bước quan trọng để biết "Ai là chủ trang trại này"
    const ownerId = req.user.id;

    const newFarm = await Farm.create({
      name,
      address,
      description,
      certification,
      location_coords,
      ownerId
    });

    res.status(201).json({
      message: 'Tạo trang trại thành công!',
      farm: newFarm
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy danh sách trang trại của tôi
exports.getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.findAll({
      where: { ownerId: req.user.id } // Chỉ lấy trang trại của người đang đăng nhập
    });

    res.status(200).json({ farms });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Cập nhật thông tin trang trại
exports.updateFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description, certification, location_coords } = req.body;
    const ownerId = req.user.id;

    // Tìm trang trại
    const farm = await Farm.findOne({ where: { id, ownerId } });

    if (!farm) {
      return res.status(404).json({ message: 'Không tìm thấy trang trại hoặc bạn không có quyền sở hữu' });
    }

    // Cập nhật
    farm.name = name || farm.name;
    farm.address = address || farm.address;
    farm.description = description || farm.description;
    farm.certification = certification || farm.certification;
    farm.location_coords = location_coords || farm.location_coords;

    await farm.save();

    res.json({
      message: 'Cập nhật trang trại thành công!',
      farm
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @desc    Get Farm Dashboard Stats
// @route   GET /api/farms/stats
// @access  Private (Farm Owner)
exports.getFarmStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { farmId } = req.query; // Check for farmId query param

    // 1. Get all farms of user to verify ownership AND to default to all if no filter
    const farms = await Farm.findAll({ where: { ownerId: userId } });

    let farmIds = farms.map(f => f.id);

    // If specific farm requested, filter it (and verify ownership implicitly by intersection)
    if (farmId) {
      // Convert to int
      const targetId = parseInt(farmId);
      if (farmIds.includes(targetId)) {
        farmIds = [targetId];
      } else {
        // User requested a farm they don't own, or invalid ID. 
        // Better to return 403 or just fallback? let's return empty stats or 404 to be safe.
        return res.status(403).json({ message: 'Bạn không sở hữu trang trại này' });
      }
    }

    if (farmIds.length === 0) {
      return res.json({
        activeSeasons: 0,
        todayProcesses: 0,
        totalOutput: 0
      });
    }

    // 2. Count Active Seasons
    const activeSeasons = await FarmingSeason.count({
      where: {
        farmId: { [Op.in]: farmIds },
        status: 'active'
      }
    });

    // 3. Count Today's Processes
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayProcesses = await FarmingProcess.count({
      // created today
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [{
        model: FarmingSeason,
        as: 'season',
        where: {
          farmId: { [Op.in]: farmIds }
        },
        required: true
      }]
    });

    // 4. Mock Total Output (since we don't have product quantity tracking yet)
    const completedSeasons = await FarmingSeason.count({
      where: {
        farmId: { [Op.in]: farmIds },
        status: 'completed'
      }
    });

    res.json({
      activeSeasons,
      todayProcesses,
      totalOutput: completedSeasons
    });

  } catch (error) {
    console.error("Get Farm Stats Error:", error);
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
  }
};