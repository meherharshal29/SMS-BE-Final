const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cameraController = require('../controllers/cameraController');

router.post('/add-camera', upload.array('images', 4), cameraController.addCamera);
router.get('/all-cameras', cameraController.getAllCameras);
router.get('/camera/:id', cameraController.getCameraById);
router.delete('/camera/:id', cameraController.deleteCamera);

module.exports = router;