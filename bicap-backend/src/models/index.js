// src/models/index.js
const { sequelize } = require('../config/database');
const User = require('./User');
const Farm = require('./Farm');
const Product = require('./Product');
const FarmingSeason = require('./FarmingSeason');
const FarmingProcess = require('./FarmingProcess');
const Order = require('./Order');
const Shipment = require('./Shipment');
const Notification = require('./Notification');
const Report = require('./Report');
const Subscription = require('./Subscription');
const SeasonTask = require('./SeasonTask');
const Payment = require('./Payment');

// --- Define Associations ---

// 1. User & Farm
User.hasMany(Farm, { foreignKey: 'ownerId', as: 'farms' });
Farm.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. Farm & Season
Farm.hasMany(FarmingSeason, { foreignKey: 'farmId', as: 'seasons', onDelete: 'CASCADE' });
FarmingSeason.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });

// 3. Season & Process
FarmingSeason.hasMany(FarmingProcess, { foreignKey: 'seasonId', as: 'processes' });
FarmingProcess.belongsTo(FarmingSeason, { foreignKey: 'seasonId', as: 'season' });

// 4. Farm & Product
Farm.hasMany(Product, { foreignKey: 'farmId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });

Product.belongsTo(FarmingSeason, { foreignKey: 'seasonId', as: 'season', onDelete: 'NO ACTION' });
FarmingSeason.hasMany(Product, { foreignKey: 'seasonId', as: 'products', onDelete: 'NO ACTION' });

// 5. Order Relationships
User.hasMany(Order, { foreignKey: 'retailerId', as: 'orders', onDelete: 'NO ACTION' });
Order.belongsTo(User, { foreignKey: 'retailerId', as: 'retailer' });

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders', onDelete: 'NO ACTION' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'NO ACTION' });

// 6. Shipment Relationships
Order.hasOne(Shipment, { foreignKey: 'orderId', as: 'shipment' });
Shipment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Shipment, { foreignKey: 'managerId', as: 'managedShipments', onDelete: 'NO ACTION' });
Shipment.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

User.hasMany(Shipment, { foreignKey: 'driverId', as: 'assignedShipments', onDelete: 'NO ACTION' });
Shipment.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// 7. Notification & Report
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Report, { foreignKey: 'senderId', as: 'sentReports', onDelete: 'NO ACTION' });
Report.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// 8. User & Subscription
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 10. Payment Relationships
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments', onDelete: 'NO ACTION' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments', onDelete: 'NO ACTION' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments', onDelete: 'NO ACTION' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

// 9. SeasonTask Associations
User.hasMany(SeasonTask, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
SeasonTask.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Farm.hasMany(SeasonTask, { foreignKey: 'farmId', as: 'tasks', onDelete: 'NO ACTION' });
SeasonTask.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm', onDelete: 'NO ACTION' });

FarmingSeason.hasMany(SeasonTask, { foreignKey: 'seasonId', as: 'tasks', onDelete: 'NO ACTION' });
SeasonTask.belongsTo(FarmingSeason, { foreignKey: 'seasonId', as: 'season', onDelete: 'NO ACTION' });



const initModels = async () => {
  try {
    // 1. Sync all tables (Create if not exists, but DO NOT ALTER)
    await sequelize.sync();

    // 2. Manual Migration for 'Products' table to add missing columns safely
    const queryInterface = sequelize.getQueryInterface();
    const tableDesc = await queryInterface.describeTable('Products');

    // Add 'price' if not exists
    if (!tableDesc.price) {
      console.log('⚡ Adding missing column: price to Products');
      await queryInterface.addColumn('Products', 'price', {
        type: require('sequelize').DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
      });
    }

    // Add 'seasonId' if not exists
    if (!tableDesc.seasonId) {
      console.log('⚡ Adding missing column: seasonId to Products');
      await queryInterface.addColumn('Products', 'seasonId', {
        type: require('sequelize').DataTypes.INTEGER,
        allowNull: true
      });
    }

    /*if (!tableDesc.farmId) {
      console.log('⚡ Adding missing column: farmId to Products');
      await queryInterface.addColumn('Products', 'farmId', {
        type: require('sequelize').DataTypes.INTEGER,
        allowNull: true // Should be false but set true for existing data safety
      });
    }*/

    // 3. Manual Migration for 'Users' table
    const userTableDesc = await queryInterface.describeTable('Users');
    if (!userTableDesc.phone) {
      console.log('⚡ Adding missing column: phone to Users');
      await queryInterface.addColumn('Users', 'phone', {
        type: require('sequelize').DataTypes.STRING,
        allowNull: true
      });
    }

    // 4. Manual Migration for 'Orders' table
    const orderTableDesc = await queryInterface.describeTable('Orders');

    if (!orderTableDesc.contractTerms) {
      console.log('⚡ Adding missing column: contractTerms to Orders');
      await queryInterface.addColumn('Orders', 'contractTerms', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true
      });
    }

    if (!orderTableDesc.depositAmount) {
      console.log('⚡ Adding missing column: depositAmount to Orders');
      await queryInterface.addColumn('Orders', 'depositAmount', {
        type: require('sequelize').DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
      });
    }

    if (!orderTableDesc.deliveryImage) {
      console.log('⚡ Adding missing column: deliveryImage to Orders');
      await queryInterface.addColumn('Orders', 'deliveryImage', {
        type: require('sequelize').DataTypes.STRING,
        allowNull: true
      });
    }

    // 5. Manual Migration for 'Reports' table
    const reportTableDesc = await queryInterface.describeTable('Reports');
    if (!reportTableDesc.receiverRole) {
      console.log('⚡ Adding missing column: receiverRole to Reports');
      await queryInterface.addColumn('Reports', 'receiverRole', { type: require('sequelize').DataTypes.STRING, defaultValue: 'admin' });
    }
    if (!reportTableDesc.type) {
      console.log('⚡ Adding missing column: type to Reports');
      await queryInterface.addColumn('Reports', 'type', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!reportTableDesc.adminNote) {
      console.log('⚡ Adding missing column: adminNote to Reports');
      await queryInterface.addColumn('Reports', 'adminNote', { type: require('sequelize').DataTypes.TEXT, allowNull: true });
    }

    // 6. Check Shipments table just in case
    const shipmentTableDesc = await queryInterface.describeTable('Shipments');
    if (!shipmentTableDesc.managerId) {
      console.log('⚡ Adding missing column: managerId to Shipments');
      await queryInterface.addColumn('Shipments', 'managerId', { type: require('sequelize').DataTypes.INTEGER, allowNull: true });
    }
    if (!shipmentTableDesc.pickupLocation) {
      console.log('⚡ Adding missing column: pickupLocation to Shipments');
      await queryInterface.addColumn('Shipments', 'pickupLocation', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!shipmentTableDesc.deliveryLocation) {
      console.log('⚡ Adding missing column: deliveryLocation to Shipments');
      await queryInterface.addColumn('Shipments', 'deliveryLocation', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }
    if (!shipmentTableDesc.currentLocation) {
      console.log('⚡ Adding missing column: currentLocation to Shipments');
      await queryInterface.addColumn('Shipments', 'currentLocation', { type: require('sequelize').DataTypes.STRING, allowNull: true });
    }

    console.log('✅ Database Schema Updated Successfully!');
  } catch (error) {
    console.error('❌ Database Sync Error:', error);
  }
};

module.exports = {
  sequelize,
  initModels,
  User,
  Farm,
  Product,
  FarmingSeason,
  FarmingProcess,
  Order,
  Shipment,
  Notification,
  Report,
  Subscription,
  SeasonTask,
  Payment
};