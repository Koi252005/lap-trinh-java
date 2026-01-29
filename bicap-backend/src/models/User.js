// src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null initially for migration or errors, but should be unique
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'retailer',
    // Các role: 'admin', 'farm', 'driver', 'retailer', 'shipping_manager'
    validate: {
      isIn: [['admin', 'farm', 'driver', 'retailer', 'shipping_manager', 'shipping', 'guest']]
    }
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  businessLicense: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active', // active, pending, blocked
    validate: {
      isIn: [['active', 'pending', 'blocked']]
    }
  }
}, {
  timestamps: true, // Tự động tạo cột createdAt, updatedAt
});

module.exports = User;