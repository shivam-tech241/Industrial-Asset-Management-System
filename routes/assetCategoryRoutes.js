const express = require('express');
const router = express.Router();
const assetCategoryController = require('../controllers/assetCategoryController');
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// GET all categories - Any logged-in user
router.get('/', verifyToken, assetCategoryController.getAllCategories);

// POST create category - Admin only
router.post('/', verifyToken, authorize('Admin'), assetCategoryController.createCategory);

// PUT update category - Admin only
router.put('/:id', verifyToken, authorize('Admin'), assetCategoryController.updateCategory);

// DELETE category - Admin only
router.delete('/:id', verifyToken, authorize('Admin'), assetCategoryController.deleteCategory);

module.exports = router;
