const express = require('express');
const router = express.Router();
const { verifyToken, getCurrentUser } = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// POST /api/auth/verify - Verify Firebase ID token
router.post('/verify', verifyToken);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', verifyFirebaseToken, getCurrentUser);

module.exports = router;

