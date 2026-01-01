const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

/**
 * Helper: Generate Secure 6-digit OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * 1. REGISTER
 * Logic: Checks existence, creates user as 'pending', sends verification OTP.
 */
exports.register = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // SQL Check for existing email or phone
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email or Phone already registered." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

        await User.create({
            name,
            email,
            phone,
            otp,
            otpExpires,
            accountStatus: 'pending',
            role: 'user'
        });

        await sendEmail(email, "Verify Your Account", otp, name);

        res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to email."
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 2. LOGIN
 * Logic: Checks if user exists and is not banned, then sends Login OTP.
 */
exports.login = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Ban Check
        if (user.accountStatus === 'banned') {
            return res.status(403).json({
                success: false,
                message: "Account is banned. Please contact support.",
                isBanned: true
            });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        await user.update({ otp, otpExpires });

        await sendEmail(user.email, "Login Verification Code", otp, user.name);

        res.status(200).json({
            success: true,
            message: "Verification code sent to your email."
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 3. VERIFY OTP
 * Logic: Validates OTP string and expiration, activates account, returns JWT.
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Validate OTP and Check Expiration
        const isValidOTP = String(user.otp).trim() === String(otp).trim();
        const isNotExpired = new Date(user.otpExpires) > new Date();

        if (!isValidOTP || !isNotExpired) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Update User Status and Clear OTP
        await user.update({
            otp: null,
            otpExpires: null,
            accountStatus: user.accountStatus === 'pending' ? 'active' : user.accountStatus
        });

        // Generate JWT (Matches middleware req.user.id)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: "Authentication successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.accountStatus
            }
        });
    } catch (err) {
        console.error("Verify Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 4. GET PROFILE
 * Logic: Uses req.user.id from middleware to fetch full details.
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['otp', 'otpExpires'] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (err) {
        console.error("Profile Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 5. LOGOUT
 * Logic: Records the token in RevokedTokens table for blacklisting.
 */
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            await RevokedToken.create({ token });
        }
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 6. REQUEST UNBAN
 * Logic: Allows banned users to submit a reason for reactivation.
 */
exports.requestUnban = async (req, res) => {
    try {
        const { email, reason } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "User not found" });

        await user.update({
            activationRequested: true,
            unbanReason: reason
        });

        res.status(200).json({
            success: true,
            message: "Unban request submitted successfully."
        });
    } catch (err) {
        console.error("Unban Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

/**
 * 7. GET ALL USERS (Admin Only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['otp', 'otpExpires'] },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};