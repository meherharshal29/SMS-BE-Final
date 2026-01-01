const GalleryImage = require('./galleryModel');
const EventPackage = require('./packageModel');

// A Wedding Package (Photography/Videography) now owns its own gallery
EventPackage.hasMany(GalleryImage, { 
    as: 'gallery', 
    foreignKey: 'packageId', 
    onDelete: 'CASCADE' 
});

// Each Image belongs to a specific Package
GalleryImage.belongsTo(EventPackage, { 
    as: 'package',
    foreignKey: 'packageId' 
});

module.exports = { GalleryImage, EventPackage };