// src/models/Payment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable vì có thể là thanh toán subscription
        comment: 'ID của Order nếu thanh toán đơn hàng'
    },
    subscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable vì có thể là thanh toán order
        comment: 'ID của Subscription nếu thanh toán gói dịch vụ'
    },
    paymentType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['subscription', 'order_deposit', 'order_full']]
        },
        comment: 'Loại thanh toán: subscription (gói dịch vụ), order_deposit (cọc đơn hàng), order_full (thanh toán đầy đủ)'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'VND',
        allowNull: false
    },
    // VNPay fields
    vnp_TxnRef: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Mã tham chiếu giao dịch (unique)'
    },
    vnp_TransactionNo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Mã giao dịch từ VNPay'
    },
    vnp_ResponseCode: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Mã phản hồi từ VNPay'
    },
    vnp_TransactionStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Trạng thái giao dịch từ VNPay'
    },
    vnp_SecureHash: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Chữ ký bảo mật từ VNPay'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'processing', 'success', 'failed', 'cancelled']]
        }
    },
    paymentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL thanh toán từ VNPay (để redirect user)'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mô tả giao dịch'
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời điểm thanh toán thành công'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['vnp_TxnRef'],
            unique: true
        },
        {
            fields: ['userId']
        },
        {
            fields: ['orderId']
        },
        {
            fields: ['subscriptionId']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Payment;





