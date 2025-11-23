const express = require('express');
const router = express.Router();
const {
  subscribeNewsletter,
  getSubscriptions
} = require('../controllers/newsletter.controller');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth.middleware');

// POST /api/newsletter/subscribe - Subscribe to newsletter (public)
router.post('/subscribe', subscribeNewsletter);

// GET /api/newsletter/subscriptions - Get all subscriptions (admin only)
router.get('/subscriptions', verifyFirebaseToken, requireAdmin, getSubscriptions);

module.exports = router;

