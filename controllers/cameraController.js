const cloudinary = require('cloudinary').v2;
const pool = require('../config/db');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// 1. ADD CAMERA
exports.addCamera = async (req, res) => {
    try {
        const { model_name, brand, price_per_day, description, images } = req.body;
        const files = req.files;

        const [camera] = await pool.execute(
            "INSERT INTO cameras (model_name, brand, price_per_day, description) VALUES (?, ?, ?, ?)",
            [model_name, brand, price_per_day, description]
        );
        const cameraId = camera.insertId;

        // Handle JSON Links
        if (images && Array.isArray(images)) {
            const linkQueries = images.map(url => 
                pool.execute("INSERT INTO camera_images (camera_id, image_url, cloudinary_id) VALUES (?, ?, ?)", [cameraId, url, null])
            );
            await Promise.all(linkQueries);
            return res.status(201).json({ message: "Added with links!", cameraId });
        }

        // Handle File Uploads
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => cloudinary.uploader.upload(file.path, {
                folder: "camera_rentals",
                transformation: [{ width: 1000, quality: "auto", fetch_format: "auto" }]
            }));
            const results = await Promise.all(uploadPromises);
            const imageQueries = results.map(result => 
                pool.execute("INSERT INTO camera_images (camera_id, image_url, cloudinary_id) VALUES (?, ?, ?)", 
                [cameraId, result.secure_url, result.public_id])
            );
            await Promise.all(imageQueries);
            return res.status(201).json({ message: "Added with files!", cameraId });
        }
        res.status(400).json({ error: "No images provided" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. GET ALL CAMERAS
exports.getAllCameras = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, GROUP_CONCAT(ci.image_url) as all_images 
            FROM cameras c 
            LEFT JOIN camera_images ci ON c.id = ci.camera_id 
            GROUP BY c.id
        `);

        // Serialize data: Convert string of URLs into a clean Array
        const serializedData = rows.map(row => ({
            ...row,
            images: row.all_images ? row.all_images.split(',') : []
        }));

        res.json(serializedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GET BY ID (FIXED & FULL)
exports.getCameraById = async (req, res) => {
    try {
        const cameraId = req.params.id;
        
        // Get Camera Data
        const [camera] = await pool.execute("SELECT * FROM cameras WHERE id = ?", [cameraId]);
        
        if (camera.length === 0) {
            return res.status(404).json({ error: "Camera not found" });
        }

        // Get Associated Images
        const [images] = await pool.execute("SELECT image_url, cloudinary_id FROM camera_images WHERE camera_id = ?", [cameraId]);

        res.json({
            ...camera[0],
            images: images
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. DELETE CAMERA
exports.deleteCamera = async (req, res) => {
    try {
        const cameraId = req.params.id;

        // Optional: Delete from Cloudinary first if IDs exist
        const [images] = await pool.execute("SELECT cloudinary_id FROM camera_images WHERE camera_id = ?", [cameraId]);
        for (const img of images) {
            if (img.cloudinary_id) {
                await cloudinary.uploader.destroy(img.cloudinary_id);
            }
        }

        await pool.execute("DELETE FROM cameras WHERE id = ?", [cameraId]);
        res.json({ message: "Camera and associated images deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};