const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASS || '', // Default to empty string if no password
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to console.log in development to see SQL queries
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // Ensure timezone is handled correctly (useful for OTP expiry)
        timezone: '+05:30' 
    }
);

module.exports = sequelize;