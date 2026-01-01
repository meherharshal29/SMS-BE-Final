    const express = require("express");
    const router = express.Router();
    const authMiddleware = require("../middlewares/auth");
    const { 
        register, login, verifyOTP, logout, 
        getAllUsers, requestUnban, getProfile 
    } = require("../controllers/userController");

    // Public
    router.post("/register", register);
    router.post("/login", login);
    router.post("/verify-otp", verifyOTP);
    router.post("/request-unban", requestUnban);

    // Protected (Requires Token)
    router.get("/profile", authMiddleware, getProfile);
    router.post("/logout", authMiddleware, logout);

    // Admin
    router.get("/users", getAllUsers);

    module.exports = router;