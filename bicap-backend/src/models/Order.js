// src/models/Order.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    retailerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    depositAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        // pending: chờ xác nhận, deposited: đã cọc, confirmed: đã xác nhận, shipping: đang giao, delivered: đã giao (chờ thanh toán), completed: hoàn thành, cancelled: hủy
        validate: {
            isIn: [['pending', 'deposited', 'confirmed', 'shipping', 'delivered', 'completed', 'cancelled']]
        }
    },
    contractTerms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    deliveryImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Order;
