const express = require('express');
const router = express.Router();
const {
  grantAdminRole,
  revokeAdminRole,
  grantUniversityRole,
  revokeUniversityRole,
  getAdminUsers,
  getUniversityAdmins
} = require('../controllers/admin.controller');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth.middleware');

// All admin routes require admin authentication
router.use(verifyFirebaseToken, requireAdmin);

// Admin role management
router.post('/roles/admin', grantAdminRole);
router.delete('/roles/admin/:userId', revokeAdminRole);
router.get('/roles/admin', getAdminUsers);

// University role management
router.post('/roles/university', grantUniversityRole);
router.delete('/roles/university/:userId', revokeUniversityRole);
router.get('/roles/university', getUniversityAdmins);

module.exports = router;

