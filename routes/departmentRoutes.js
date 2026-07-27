const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// GET all departments - Any logged-in user
router.get('/', verifyToken, departmentController.getAllDepartments);

// POST create department - Admin only
router.post('/', verifyToken, authorize('Admin'), departmentController.createDepartment);

// PUT update department - Admin only
router.put('/:id', verifyToken, authorize('Admin'), departmentController.updateDepartment);

// DELETE department - Admin only
router.delete('/:id', verifyToken, authorize('Admin'), departmentController.deleteDepartment);

module.exports = router;
