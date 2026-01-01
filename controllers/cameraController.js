const cloudinary = require('cloudinary').v2;
const Camera = require('../models/cameraModel');
const CameraImage = require('../models/cameraImageModel');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Add Camera
exports.addCamera = async (req, res) => {
    try {
        const { model_name, brand, price_per_day, description, images } = req.body;
        const camera = await Camera.create({ model_name, brand, price_per_day, description });

        let imageData = [];
        // Scenario A: Physical files (Postman form-data)
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => 
                cloudinary.uploader.upload(file.path, { folder: "camera_rentals" })
            );
            const results = await Promise.all(uploadPromises);
            imageData = results.map(result => ({
                camera_id: camera.id,
                image_url: result.secure_url,
                cloudinary_id: result.public_id
            }));
        } 
        // Scenario B: URLs in JSON (Postman raw JSON)
        else if (images && Array.isArray(images)) {
            imageData = images.map(img => ({
                camera_id: camera.id,
                image_url: img.image_url || img, // Handles both object and string arrays
                cloudinary_id: null
            }));
        }

        if (imageData.length > 0) await CameraImage.bulkCreate(imageData);

        const fullCamera = await Camera.findByPk(camera.id, {
            include: [{ model: CameraImage, as: 'images', attributes: ['image_url'] }]
        });
        res.status(201).json(fullCamera);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All (Optimized for fast loading)
exports.getAllCameras = async (req, res) => {
    try {
        const cameras = await Camera.findAll({
            include: [{ model: CameraImage, as: 'images', attributes: ['image_url'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(cameras);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get By ID
exports.getCameraById = async (req, res) => {
    try {
        const camera = await Camera.findByPk(req.params.id, {
            include: [{ model: CameraImage, as: 'images', attributes: ['image_url'] }]
        });
        if (!camera) return res.status(404).json({ error: "Not found" });
        res.status(200).json(camera);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete
exports.deleteCamera = async (req, res) => {
    try {
        const camera = await Camera.findByPk(req.params.id, { include: [{ model: CameraImage, as: 'images' }] });
        if (!camera) return res.status(404).json({ error: "Not found" });

        for (const img of camera.images) {
            if (img.cloudinary_id) await cloudinary.uploader.destroy(img.cloudinary_id);
        }
        await camera.destroy();
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};