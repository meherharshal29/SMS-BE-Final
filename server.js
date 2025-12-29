require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cameraRoutes = require('./routes/cameraRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors()); 
app.use(express.json());

// 2. Routes
app.use('/api', cameraRoutes);
app.use('/api/payment', paymentRoutes); // This creates: /api/payment/initiate

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));