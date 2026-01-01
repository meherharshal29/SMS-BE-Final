const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    otp: { type: DataTypes.STRING, allowNull: true }, // Ensure this is not 'null' by default if required
    otpExpires: { type: DataTypes.DATE, allowNull: true },
    accountStatus: { 
        type: DataTypes.ENUM('pending', 'active', 'banned'), 
        defaultValue: 'pending' 
    }
});

module.exports = User;