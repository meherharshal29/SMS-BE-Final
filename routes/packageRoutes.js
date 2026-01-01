const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { 
    createPackage, 
    getAllPackages, 
    addImagesToPackage, 
    getPackagesByCategory, 
    deletePackage,
    getPackageById          
} = require('../controllers/packageController');

/* --- 1. PACKAGE MANAGEMENT --- */

/** * Create a new package with a single main thumbnail image.
 * Postman Key: 'image' 
 * Type: File (Single)
 */
router.post('/add', upload.single('image'), createPackage);

/** * Get every package in the database.
 * Used for the main listing page.
 */
router.get('/all', getAllPackages);

/** * Get a specific package by ID.
 * Used for the Package Details page.
 */
router.get('/:id', getPackageById);

/** * Get packages by category (e.g., Photography, Videography).
 * Used for category-specific navigation.
 */
router.get('/category/:categoryName', getPackagesByCategory);

/** * Delete a package and its associated gallery images.
 */
router.delete('/:id', deletePackage);


/* --- 2. GALLERY MANAGEMENT --- */

/**
 * Add multiple gallery images to an existing package.
 * Postman Key: 'images' 
 * Type: File (Multiple - up to 10)
 */
router.post('/:packageId/add-images', upload.array('images', 10), addImagesToPackage);

module.exports = router;