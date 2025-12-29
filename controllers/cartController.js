const pool = require('../config/db');

// 1. ADD TO CART
exports.addToCart = async (req, res) => {
    try {
        const { camera_id, quantity } = req.body;
        const qty = quantity || 1;

        // Check if item already exists in cart
        const [existing] = await pool.execute(
            "SELECT id, quantity FROM cart_items WHERE camera_id = ?", 
            [camera_id]
        );

        if (existing.length > 0) {
            // Update quantity if already in cart
            await pool.execute(
                "UPDATE cart_items SET quantity = quantity + ? WHERE camera_id = ?",
                [qty, camera_id]
            );
            return res.json({ message: "Cart updated successfully" });
        }

        // Insert new item
        await pool.execute(
            "INSERT INTO cart_items (camera_id, quantity) VALUES (?, ?)",
            [camera_id, qty]
        );

        res.status(201).json({ message: "Added to cart successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. GET CART ITEMS
exports.getCart = async (req, res) => {
    try {
        // Join with cameras and camera_images to get full details for the frontend
        const [rows] = await pool.execute(`
            SELECT 
                cart_items.id AS cart_id,
                cart_items.quantity,
                cameras.*,
                (SELECT image_url FROM camera_images WHERE camera_id = cameras.id LIMIT 1) as thumbnail
            FROM cart_items
            JOIN cameras ON cart_items.camera_id = cameras.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params; // This is the cart_items.id
        await pool.execute("DELETE FROM cart_items WHERE id = ?", [id]);
        res.json({ message: "Item removed from cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. CLEAR CART
exports.clearCart = async (req, res) => {
    try {
        await pool.execute("DELETE FROM cart_items");
        res.json({ message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 5. UPDATE QUANTITY (NEW)
exports.updateQuantity = async (req, res) => {
    try {
        const { cart_id, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ error: "Quantity cannot be less than 1" });
        }

        await pool.execute(
            "UPDATE cart_items SET quantity = ? WHERE id = ?",
            [quantity, cart_id]
        );

        res.json({ message: "Quantity updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};