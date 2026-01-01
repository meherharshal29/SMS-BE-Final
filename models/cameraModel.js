const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Camera = sequelize.define('Camera', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    model_name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    price_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description: { type: DataTypes.TEXT }
}, { 
    tableName: 'cameras',
    timestamps: true 
});

module.exports = Camera;