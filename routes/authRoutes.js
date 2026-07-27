const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected test route (Admin only)
router.get('/test', verifyToken, authorize('Admin'), (req, res) => {
  return res.status(200).json({
    message: 'Access granted',
    user: req.user
  });
});

module.exports = router;
