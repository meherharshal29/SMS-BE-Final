const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GalleryImage = sequelize.define('GalleryImage', {
    image_url: { type: DataTypes.STRING, allowNull: false },
    cloudinary_id: { type: DataTypes.STRING, allowNull: false },
    packageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'EventPackages', key: 'id' }
    }
}, { timestamps: false });

module.exports = GalleryImage;