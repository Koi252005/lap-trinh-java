// src/models/FarmingSeason.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FarmingSeason = sequelize.define('FarmingSeason', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active', // active, completed, cancelled
        validate: {
            isIn: [['active', 'completed', 'cancelled']]
        }
    },
    farmId: {
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

module.exports = FarmingSeason;
