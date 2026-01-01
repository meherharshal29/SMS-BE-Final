const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    
    // New fields for User Identity
    user_name: { type: DataTypes.STRING, allowNull: false },
    user_email: { type: DataTypes.STRING, allowNull: false },

    address: { type: DataTypes.TEXT, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    adhar_no: { type: DataTypes.STRING(12), allowNull: false },
    total_amount: { type: DataTypes.FLOAT, allowNull: false },
    items: { type: DataTypes.JSON, allowNull: false }, 
    payment_method: { type: DataTypes.ENUM('upi', 'card', 'netbanking'), defaultValue: 'upi' },
    payment_status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
    transaction_id: { type: DataTypes.STRING, unique: true }
}, { tableName: 'orders', timestamps: true });

module.exports = Order;