const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// GET all sections - Any logged-in user
router.get('/', verifyToken, sectionController.getAllSections);

// POST create section - Admin only
router.post('/', verifyToken, authorize('Admin'), sectionController.createSection);

// PUT update section - Admin only
router.put('/:id', verifyToken, authorize('Admin'), sectionController.updateSection);

// DELETE section - Admin only
router.delete('/:id', verifyToken, authorize('Admin'), sectionController.deleteSection);

module.exports = router;
