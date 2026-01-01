const Order = require('../models/Order');
const User = require('../models/User');
const CartModel = require('../models/CartModel');

/**
 * logic: Create a new order with User details, Aadhaar, and Address
 */
exports.createOrder = async (req, res) => {
    try {
        const { address, city, adhar_no, payment_method, cartItems, total_amount } = req.body;
        const userId = req.user.id; // From authMiddleware

        // 1. Validation: Ensure required fields are present
        if (!address || !city || !adhar_no || adhar_no.length !== 12) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing details. Address, City, and 12-digit Aadhaar are required." 
            });
        }

        // 2. Validation: Ensure cart is not empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Cart is empty. Add items before checking out." 
            });
        }

        // 3. Security: Fetch Logged-in User Info
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        if (user.accountStatus === 'banned') {
            return res.status(403).json({ 
                success: false, 
                message: "Your account is restricted from making rentals." 
            });
        }

        // 4. Create Order Record (Includes Name and Email snapshot)
        const newOrder = await Order.create({
            user_id: userId,
            user_name: user.name,      // Fetched from User table for permanent record
            user_email: user.email,    // Fetched from User table for permanent record
            address,
            city,
            adhar_no,
            total_amount,
            items: cartItems,          // JSON array of gear details
            payment_method,
            payment_status: 'pending',
            transaction_id: `SMS_${Date.now()}_${userId}`
        });

        // 5. Automated Cleanup: Destroy cart items in SQL
        await CartModel.destroy({ 
            where: { user_id: userId } 
        });

        // 6. Final Response
        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (err) {
        console.error("ORDER_CONTROLLER_ERROR:", err);
        res.status(500).json({ 
            success: false, 
            error: "An internal error occurred during order placement." 
        });
    }
};

/**
 * logic: Retrieve order history for the current logged-in user
 */
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']] // Newest rentals first
        });

        res.status(200).json({ 
            success: true, 
            count: orders.length,
            orders 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch order history." 
        });
    }
};

/**
 * logic: Get details for a single specific order (for invoices)
 */
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { 
                id: req.params.id,
                user_id: req.user.id // Security: Ensure user can only see their own order
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.status(200).json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};