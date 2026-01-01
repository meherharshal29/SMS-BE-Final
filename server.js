require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet'); // New: Security headers
const sequelize = require('./config/db');

// Initialize SQL Models & Associations
// This must happen BEFORE routes are loaded
require('./models/associations'); 
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. Global Middleware ---
app.use(helmet({
    contentSecurityPolicy: false, // Set false if it blocks Angular resources
}));
app.use(cors({ 
    origin: process.env.CLIENT_URL || '*', 
    credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 2. API Routes ---
// Import routes here to ensure they use the initialized models
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api', require('./routes/cameraRoutes'));
app.use('/api/orders', orderRoutes);
// --- 3. Static File Serving (Angular) ---
const angularPath = path.resolve(__dirname, '..', 'Frontend', 'dist', 'test');

if (fs.existsSync(angularPath)) {
    app.use(express.static(angularPath));
    
    // Proper SPA Routing: Handle all non-API GET requests
    app.get(/^(?!\/api).+/, (req, res) => {
        res.sendFile(path.join(angularPath, 'index.html'));
    });
}

// --- 4. 404 Handler for API ---
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// --- 5. Global Error Handler ---
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(`[Error] ${req.method} ${req.url}:`, err.stack);
    res.status(status).json({ 
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

// --- 6. Startup Sequence ---
const startServer = async () => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ SQL Database Connected.');

        // Sync models (alter: true is for dev only)
        await sequelize.sync({ alter: true });
        console.log('✅ Database Models Synced.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();