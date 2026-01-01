const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/create', orderController.createOrder);
router.get('/my-history', orderController.getMyOrders);

module.exports = router;