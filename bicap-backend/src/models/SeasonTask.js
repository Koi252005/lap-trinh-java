const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SeasonTask = sequelize.define('SeasonTask', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seasonId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'normal' // high, normal, low
    }
}, {
    timestamps: true
});

module.exports = SeasonTask;
