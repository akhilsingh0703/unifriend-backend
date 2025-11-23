const express = require('express');
const router = express.Router();
const {
  getUserApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  getUniversityApplications
} = require('../controllers/application.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// GET /api/applications - Get current user's applications
router.get('/', verifyFirebaseToken, getUserApplications);

// GET /api/applications/university/:universityId - Get applications for a university (university admin or admin)
router.get('/university/:universityId', verifyFirebaseToken, getUniversityApplications);

// GET /api/applications/:id - Get application by ID
router.get('/:id', verifyFirebaseToken, getApplicationById);

// POST /api/applications - Create new application
router.post('/', verifyFirebaseToken, createApplication);

// PUT /api/applications/:id/status - Update application status (university admin or admin)
router.put('/:id/status', verifyFirebaseToken, updateApplicationStatus);

module.exports = router;

