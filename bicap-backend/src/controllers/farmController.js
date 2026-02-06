// src/controllers/farmController.js
const { Farm, FarmingSeason, FarmingProcess } = require('../models');
const { Op } = require('sequelize');

// In-memory store for farms when database is not connected
// Key: firebaseUid, Value: Array of farms
const memoryFarmsStore = new Map();

// Export memoryFarmsStore để các controller khác có thể sử dụng
exports.memoryFarmsStore = memoryFarmsStore;

// 1. Tạo trang trại mới
exports.createFarm = async (req, res) => {
  try {
    const { name, address, description, certification, location_coords } = req.body;

    // Lấy ID người dùng từ Token (do Middleware giải mã)
    // Đây là bước quan trọng để biết "Ai là chủ trang trại này"
    let ownerId = req.user?.id;

    // If database not connected, ownerId might be null
    // In that case, we can't create farm in database, return error or mock response
    if (!ownerId) {
      // Database not connected - save to memory and return mock farm response
      const firebaseUid = req.user?.firebaseUid || 'temp_owner';
      const mockFarm = {
        id: Date.now(), // Temporary ID
        name,
        address,
        description,
        certification,
        location_coords,
        ownerId: firebaseUid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to memory store
      if (!memoryFarmsStore.has(firebaseUid)) {
        memoryFarmsStore.set(firebaseUid, []);
      }
      memoryFarmsStore.get(firebaseUid).push(mockFarm);
      
      console.warn('Database not connected, saving farm to memory store');
      return res.status(200).json({
        message: 'Tạo trang trại thành công (Database chưa kết nối - chỉ lưu tạm)',
        farm: mockFarm,
        warning: 'Database chưa kết nối. Trang trại chưa được lưu vào database. Vui lòng kết nối database để lưu vĩnh viễn.'
      });
    }

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
    console.error('Create Farm Error:', error);
    
    // If database error, save to memory and return mock response
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError' || error.name === 'SequelizeValidationError') {
      const firebaseUid = req.user?.firebaseUid || 'temp_owner';
      const mockFarm = {
        id: Date.now(),
        name: req.body.name,
        address: req.body.address,
        description: req.body.description,
        certification: req.body.certification,
        location_coords: req.body.location_coords,
        ownerId: firebaseUid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to memory store
      if (!memoryFarmsStore.has(firebaseUid)) {
        memoryFarmsStore.set(firebaseUid, []);
      }
      memoryFarmsStore.get(firebaseUid).push(mockFarm);
      
      return res.status(200).json({
        message: 'Tạo trang trại thành công (Database chưa kết nối - chỉ lưu tạm)',
        farm: mockFarm,
        warning: 'Database chưa kết nối. Trang trại chưa được lưu vào database.'
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy danh sách trang trại của tôi
exports.getMyFarms = async (req, res) => {
  try {
    // Check if database is connected and user ID exists
    if (!req.user?.id) {
      // Database not connected or user not synced - try to get from memory store
      const firebaseUid = req.user?.firebaseUid;
      if (firebaseUid && memoryFarmsStore.has(firebaseUid)) {
        const memoryFarms = memoryFarmsStore.get(firebaseUid);
        console.warn('Database not connected, returning farms from memory store');
        return res.status(200).json({ 
          farms: memoryFarms,
          warning: 'Database chưa kết nối. Đang hiển thị trang trại từ bộ nhớ tạm.'
        });
      }
      
      // No memory farms either - return empty array
      console.warn('Database not connected and no memory farms, returning empty farms list');
      return res.status(200).json({ 
        farms: [],
        warning: 'Database chưa kết nối. Vui lòng kết nối database để xem danh sách trang trại.'
      });
    }

    const farms = await Farm.findAll({
      where: { ownerId: req.user.id } // Chỉ lấy trang trại của người đang đăng nhập
    });

    res.status(200).json({ farms });
  } catch (error) {
    console.error('Get My Farms Error:', error);
    
    // If database connection error, try to get from memory store
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
      const firebaseUid = req.user?.firebaseUid;
      if (firebaseUid && memoryFarmsStore.has(firebaseUid)) {
        const memoryFarms = memoryFarmsStore.get(firebaseUid);
        return res.status(200).json({ 
          farms: memoryFarms,
          warning: 'Database chưa kết nối. Đang hiển thị trang trại từ bộ nhớ tạm.'
        });
      }
      
      return res.status(200).json({ 
        farms: [],
        warning: 'Database chưa kết nối. Vui lòng kết nối database để xem danh sách trang trại.'
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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