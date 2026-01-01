const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/auth'); // IMPORTANT

// Protect all cart routes
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);

// Make sure this name exactly matches exports.updateQuantity in the controller
router.put('/update-qty', cartController.updateQuantity); 

router.delete('/clear', cartController.clearCart);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;