const express = require('express');
const router = express.Router();
const {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity
} = require('../controllers/university.controller');
const { verifyFirebaseToken, requireAdmin, requireUniversityAdmin } = require('../middleware/auth.middleware');

// GET /api/universities - Get all universities (public)
router.get('/', getUniversities);

// GET /api/universities/:id - Get university by ID (public)
router.get('/:id', getUniversityById);

// POST /api/universities - Create university (admin only)
router.post('/', verifyFirebaseToken, requireAdmin, createUniversity);

// PUT /api/universities/:id - Update university (admin or university admin)
router.put('/:id', verifyFirebaseToken, updateUniversity);

// DELETE /api/universities/:id - Delete university (admin only)
router.delete('/:id', verifyFirebaseToken, requireAdmin, deleteUniversity);

module.exports = router;

