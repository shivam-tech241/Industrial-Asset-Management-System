const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// GET all assets - Any logged-in user (supports query filters)
router.get('/', verifyToken, assetController.getAllAssets);

// GET single asset - Any logged-in user
router.get('/:id', verifyToken, assetController.getAssetById);

// POST create asset - Admin and Technician only
router.post('/', verifyToken, authorize('Admin', 'Technician'), assetController.createAsset);

// PUT update asset - Admin and Technician only
router.put('/:id', verifyToken, authorize('Admin', 'Technician'), assetController.updateAsset);

// DELETE asset - Admin only
router.delete('/:id', verifyToken, authorize('Admin'), assetController.deleteAsset);

module.exports = router;
