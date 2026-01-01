const CartItem = require('../models/cartModel');
const sequelize = require('../config/db');

// GET CART - Only for logged-in user
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id; 
        const [rows] = await sequelize.query(`
            SELECT 
                ci.id AS cart_id, ci.quantity, 
                c.id AS camera_id, c.brand, c.model_name, c.price_per_day,
                (SELECT image_url FROM camera_images WHERE camera_id = c.id LIMIT 1) as thumbnail
            FROM cart_items ci 
            JOIN cameras c ON ci.camera_id = c.id
            WHERE ci.user_id = :userId
        `, { replacements: { userId } });
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADD TO CART - Link to User ID
exports.addToCart = async (req, res) => {
    try {
        const { camera_id, quantity } = req.body;
        const userId = req.user.id; 

        const [item, created] = await CartItem.findOrCreate({
            where: { camera_id, user_id: userId },
            defaults: { quantity: quantity || 1 }
        });

        if (!created) {
            item.quantity += (quantity || 1);
            await item.save();
        }
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE QUANTITY - The function your error was missing
exports.updateQuantity = async (req, res) => {
    try {
        const { cart_id, quantity } = req.body;
        const userId = req.user.id;

        // Security check: only update if the cart item belongs to the user
        const result = await CartItem.update(
            { quantity }, 
            { where: { id: cart_id, user_id: userId } }
        );

        res.json({ message: "Quantity updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// REMOVE ONE ITEM
exports.removeFromCart = async (req, res) => {
    try {
        await CartItem.destroy({ where: { id: req.params.id, user_id: req.user.id } });
        res.json({ message: "Removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CLEAR FULL CART
exports.clearCart = async (req, res) => {
    try {
        await CartItem.destroy({ where: { user_id: req.user.id } });
        res.json({ message: "Cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};