const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getCurrentUserProfile
} = require('../controllers/user.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// GET /api/users/me - Get current user's profile
router.get('/me', verifyFirebaseToken, getCurrentUserProfile);

// GET /api/users/:userId - Get user profile by ID
router.get('/:userId', verifyFirebaseToken, getUserProfile);

// PUT /api/users/:userId - Update user profile
router.put('/:userId', verifyFirebaseToken, updateUserProfile);

module.exports = router;

