// src/controllers/authController.js
const { User } = require('../models');

// @desc    Sync user from Firebase to SQL Server (Login/Register)
// @route   POST /api/auth/sync-user
// @access  Private (Valid Firebase Token required)
exports.syncUser = async (req, res) => {
  try {
    // req.userFirebase được populate từ middleware verifyToken
    const { uid, email, name, picture } = req.userFirebase;

    // Client có thể gửi thêm role nếu là đăng ký mới (Optional)
    const { role, fullName } = req.body;

    // Check if database is connected
    try {
      await User.sequelize.authenticate();
    } catch (dbError) {
      console.warn('Database not connected, returning Firebase user only:', dbError.message);
      // Return Firebase user info even if DB is not connected
      return res.status(200).json({
        message: 'Đăng nhập thành công (Database chưa kết nối - chỉ dùng Firebase)',
        user: {
          firebaseUid: uid,
          email: email,
          fullName: fullName || name || 'User',
          role: role || 'retailer',
          status: 'active'
        },
        warning: 'Database chưa kết nối. Một số tính năng có thể không hoạt động.'
      });
    }

    // 1. Tìm user trong DB theo firebaseUid
    let user = await User.findOne({ where: { firebaseUid: uid } });

    if (user) {
      // User found. Check if we need to update info (e.g., first time setting role)
      let updated = false;
      if (role && user.role !== role) {
        user.role = role;
        updated = true;
      }
      if (fullName && user.fullName !== fullName) {
        user.fullName = fullName;
        updated = true;
      }

      if (updated) {
        await user.save();
      }

      // User đã tồn tại -> Trả về thông tin
      return res.status(200).json({
        message: 'Đăng nhập thành công!',
        user: user
      });
    }

    // 2. Nếu chưa có firebaseUid, check xem email đã tồn tại chưa (Trường hợp migrate từ hệ thống cũ)
    user = await User.findOne({ where: { email } });

    if (user) {
      // Cập nhật firebaseUid cho user cũ
      user.firebaseUid = uid;
      await user.save();
      return res.status(200).json({
        message: 'Đồng bộ tài khoản cũ thành công!',
        user: user
      });
    }

    // 3. Nếu chưa có gì cả -> Tạo User mới
    try {
      const newUser = await User.create({
        firebaseUid: uid,
        email: email,
        fullName: fullName || name || 'New User',
        role: role || 'retailer', // Default role
        status: 'active'
      });

      return res.status(201).json({
        message: 'Đăng ký tài khoản mới thành công!',
        user: newUser
      });
    } catch (createError) {
      // Handle Race Condition: If unique constraint fails, it means user was created by another parallel request
      if (createError.name === 'SequelizeUniqueConstraintError') {
        console.log('Race condition detected: User created by parallel request. Fetching user...');
        const existingUser = await User.findOne({ where: { firebaseUid: uid } });
        if (existingUser) {
          return res.status(200).json({
            message: 'Đăng nhập thành công (Recovered from race condition)!',
            user: existingUser
          });
        }
      }
      throw createError; // Re-throw if it's not a unique constraint error
    }

  } catch (error) {
    console.error('Sync User Error Detailed:', error); // Log more detail
    
    // If database error, return Firebase user info as fallback
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeHostNotFoundError') {
      const { uid, email, name } = req.userFirebase;
      const { role, fullName } = req.body;
      return res.status(200).json({
        message: 'Đăng nhập thành công (Database chưa kết nối - chỉ dùng Firebase)',
        user: {
          firebaseUid: uid,
          email: email,
          fullName: fullName || name || 'User',
          role: role || 'retailer',
          status: 'active'
        },
        warning: 'Database chưa kết nối. Một số tính năng có thể không hoạt động.'
      });
    }
    
    res.status(500).json({ message: 'Lỗi đồng bộ User', error: error.message, details: error.errors });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const { uid } = req.userFirebase;
    const user = await User.findOne({ where: { firebaseUid: uid } });

    if (!user) {
      return res.status(404).json({ message: 'User not found in SQL Database' });
    }

    res.json(user);
  } catch (error) {
    console.error("SyncUser Controller Error:", error);
    res.status(500).json({
      message: 'Server error during user sync',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user; // Get from SQL User ID (populated by requireRole)
    const { fullName, address, businessLicense, phone } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.address = address || user.address;
    user.businessLicense = businessLicense || user.businessLicense;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công!',
      user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật thông tin', error: error.message });
  }
};