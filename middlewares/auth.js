const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/RevokedToken");

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token, authorization denied" });
        }

        const token = authHeader.split(" ")[1];

        const blacklisted = await RevokedToken.findOne({ where: { token } });
        if (blacklisted) {
            return res.status(401).json({ success: false, message: "Session expired, please login again" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        // Attach ID and Role so both Cart and Admin routes work
        req.user = { 
            id: decoded.id,
            role: decoded.role 
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
};