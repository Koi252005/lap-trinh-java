// src/models/Farm.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Farm = sequelize.define('Farm', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  certification: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location_coords: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Mỗi trang trại thuộc về một User (Chủ trại)
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Farm;