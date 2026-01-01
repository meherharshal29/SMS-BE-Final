const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RevokedToken = sequelize.define('RevokedToken', {
    token: { type: DataTypes.TEXT, allowNull: false }
});

module.exports = RevokedToken;