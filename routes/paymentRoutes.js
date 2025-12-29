const express = require('express');
const router = express.Router();
const { pay, checkStatus } = require('../controllers/paymentController');

router.post('/initiate', pay);
router.get('/validate/:txnId', checkStatus);

module.exports = router;