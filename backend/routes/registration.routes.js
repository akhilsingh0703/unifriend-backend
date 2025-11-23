const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrations
} = require('../controllers/registration.controller');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth.middleware');

// POST /api/registrations - Create registration (public)
router.post('/', createRegistration);

// GET /api/registrations - Get all registrations (admin only)
router.get('/', verifyFirebaseToken, requireAdmin, getRegistrations);

module.exports = router;

