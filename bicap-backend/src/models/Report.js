// src/models/Report.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverRole: {
        type: DataTypes.STRING,
        defaultValue: 'admin', // admin, manager
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // pending, resolved, rejected
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'incident, feedback, other'
    },
    adminNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Ghi chú của admin khi xử lý report'
    }
}, {
    timestamps: true
});

module.exports = Report;
