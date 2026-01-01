const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Camera = require('./cameraModel');

const CameraImage = sequelize.define('CameraImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    camera_id: { type: DataTypes.INTEGER, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    cloudinary_id: { type: DataTypes.STRING, allowNull: true }
}, { 
    tableName: 'camera_images', 
    timestamps: false 
});

// Associations: This makes the "include" work in the controller
Camera.hasMany(CameraImage, { foreignKey: 'camera_id', as: 'images', onDelete: 'CASCADE' });
CameraImage.belongsTo(Camera, { foreignKey: 'camera_id', as: 'camera' });

module.exports = CameraImage;