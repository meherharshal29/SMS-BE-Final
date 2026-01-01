const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.STRING },
    lessons: { type: DataTypes.INTEGER },
    price: { type: DataTypes.INTEGER },
    rating: { type: DataTypes.FLOAT },
    image: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    advantages: { type: DataTypes.TEXT } 
});

module.exports = Course;