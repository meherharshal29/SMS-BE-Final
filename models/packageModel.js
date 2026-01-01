const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EventPackage = sequelize.define('EventPackage', {
    title: { type: DataTypes.STRING, allowNull: false },
    category: { 
        type: DataTypes.ENUM('Photography', 'Videography', 'Drone', 'Full Wedding'), 
        allowNull: false 
    },
    price: { type: DataTypes.INTEGER, allowNull: false },
    inclusions: { type: DataTypes.TEXT },
    event_type: { type: DataTypes.STRING, defaultValue: 'Wedding' },
    image: { type: DataTypes.STRING, allowNull: true } // Stores the main card thumbnail
}, { timestamps: false });

module.exports = EventPackage;