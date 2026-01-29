// src/models/FarmingProcess.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FarmingProcess = sequelize.define('FarmingProcess', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    seasonId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = FarmingProcess;
