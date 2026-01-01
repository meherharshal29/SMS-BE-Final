const { EventPackage, GalleryImage } = require('../models/associations');

/**
 * 1. CREATE PACKAGE (Saves title, price, and main Card Image)
 * POST /api/packages/add
 * Expects: multipart/form-data (key: 'image' for the file)
 */
exports.createPackage = async (req, res) => {
    try {
        const { title, category, price, inclusions, event_type, image } = req.body;
        
        // 1. Check if a file was uploaded, OR if a URL was sent in the JSON body
        const imagePath = req.file ? req.file.path : image;

        // 2. Updated logic: check if either exists
        if (!imagePath) {
            return res.status(400).json({ 
                success: false, 
                message: "Main thumbnail image (file or URL) is required." 
            });
        }

        const newPackage = await EventPackage.create({ 
            title, 
            category, 
            price, 
            inclusions,
            event_type,
            image: imagePath 
        });

        res.status(201).json({ success: true, data: newPackage });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 2. ADD IMAGES TO GALLERY (Saves multiple photos for the Detail Page)
 * POST /api/packages/:packageId/add-images
 * Expects: multipart/form-data (key: 'images' for multiple files)
 */
exports.addImagesToPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        let imageData = [];

        // Check if the package exists first
        const pkg = await EventPackage.findByPk(packageId);
        if (!pkg) return res.status(404).json({ error: "Package not found" });

        // CASE A: Raw JSON (If sending pre-existing URLs)
        if (req.body.images && Array.isArray(req.body.images)) {
            imageData = req.body.images.map(img => ({
                image_url: img.image_url,
                packageId: packageId
            }));
        } 
        // CASE B: File Uploads (If uploading via Postman/Frontend)
        else if (req.files && req.files.length > 0) {
            imageData = req.files.map(file => ({
                image_url: file.path,
                packageId: packageId
            }));
        }

        if (imageData.length === 0) {
            return res.status(400).json({ error: "No gallery images provided." });
        }

        const savedImages = await GalleryImage.bulkCreate(imageData);
        res.status(201).json({ success: true, data: savedImages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 3. GET ALL PACKAGES
 * Used for the Package List (Card view)
 */
exports.getAllPackages = async (req, res) => {
    try {
        const data = await EventPackage.findAll({
            include: [{ model: GalleryImage, as: 'gallery' }]
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 4. GET PACKAGE BY ID
 * Used for the Package Details page
 */
exports.getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await EventPackage.findByPk(id, {
            include: [{ model: GalleryImage, as: 'gallery' }]
        });

        if (!data) return res.status(404).json({ success: false, message: "Package not found" });

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 5. GET BY CATEGORY
 * Used for filtering (Photography vs Videography)
 */
exports.getPackagesByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const data = await EventPackage.findAll({
            where: { category: categoryName },
            include: [{ model: GalleryImage, as: 'gallery' }]
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 6. DELETE PACKAGE
 * Cascades to delete all gallery images automatically
 */
exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        await EventPackage.destroy({ where: { id } });
        res.status(200).json({ success: true, message: "Package and gallery deleted." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};