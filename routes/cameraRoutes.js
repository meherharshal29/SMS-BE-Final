const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Import Controllers
const cameraController = require('../controllers/cameraController');
const cartController = require('../controllers/cartController');

// --- CAMERA ROUTES ---
router.post('/add-camera', upload.array('images', 4), cameraController.addCamera);
router.get('/all-cameras', cameraController.getAllCameras);
router.get('/camera/:id', cameraController.getCameraById);
router.delete('/camera/:id', cameraController.deleteCamera);

// --- CART ROUTES ---
router.post('/cart/add', cartController.addToCart);
router.get('/cart', cartController.getCart);
router.put('/cart/update-qty', cartController.updateQuantity); // ADD THIS LINE
router.delete('/cart/:id', cartController.removeFromCart);
router.delete('/cart-clear', cartController.clearCart);
module.exports = router;