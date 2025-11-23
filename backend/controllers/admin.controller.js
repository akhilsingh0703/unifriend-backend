const { getFirestore } = require('../config/firebase-admin');

/**
 * Grant admin role to a user
 * POST /api/admin/roles/admin
 */
async function grantAdminRole(req, res) {
  try {
    const firestore = getFirestore();
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID is required.'
      });
    }

    // Verify user exists
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User not found.'
      });
    }

    await firestore.collection('roles_admin').doc(userId).set({
      grantedAt: new Date(),
      grantedBy: req.user.uid
    });

    res.json({ 
      message: 'Admin role granted successfully.',
      userId
    });
  } catch (error) {
    console.error('Grant admin role error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to grant admin role.'
    });
  }
}

/**
 * Revoke admin role from a user
 * DELETE /api/admin/roles/admin/:userId
 */
async function revokeAdminRole(req, res) {
  try {
    const firestore = getFirestore();
    const { userId } = req.params;

    if (userId === req.user.uid) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'You cannot revoke your own admin role.'
      });
    }

    const adminRoleDoc = await firestore.collection('roles_admin').doc(userId).get();
    
    if (!adminRoleDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User does not have admin role.'
      });
    }

    await firestore.collection('roles_admin').doc(userId).delete();

    res.json({ 
      message: 'Admin role revoked successfully.',
      userId
    });
  } catch (error) {
    console.error('Revoke admin role error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to revoke admin role.'
    });
  }
}

/**
 * Grant university admin role to a user
 * POST /api/admin/roles/university
 */
async function grantUniversityRole(req, res) {
  try {
    const firestore = getFirestore();
    const { userId, universityId } = req.body;

    if (!userId || !universityId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID and University ID are required.'
      });
    }

    // Verify user exists
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User not found.'
      });
    }

    // Verify university exists
    const universityDoc = await firestore.collection('universities').doc(universityId).get();
    if (!universityDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'University not found.'
      });
    }

    await firestore.collection('roles_university').doc(userId).set({
      universityId,
      grantedAt: new Date(),
      grantedBy: req.user.uid
    });

    res.json({ 
      message: 'University admin role granted successfully.',
      userId,
      universityId
    });
  } catch (error) {
    console.error('Grant university role error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to grant university role.'
    });
  }
}

/**
 * Revoke university admin role from a user
 * DELETE /api/admin/roles/university/:userId
 */
async function revokeUniversityRole(req, res) {
  try {
    const firestore = getFirestore();
    const { userId } = req.params;

    const universityRoleDoc = await firestore.collection('roles_university').doc(userId).get();
    
    if (!universityRoleDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User does not have university admin role.'
      });
    }

    await firestore.collection('roles_university').doc(userId).delete();

    res.json({ 
      message: 'University admin role revoked successfully.',
      userId
    });
  } catch (error) {
    console.error('Revoke university role error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to revoke university role.'
    });
  }
}

/**
 * Get all admin users
 * GET /api/admin/roles/admin
 */
async function getAdminUsers(req, res) {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('roles_admin').get();

    const admins = [];
    for (const doc of snapshot.docs) {
      const userDoc = await firestore.collection('users').doc(doc.id).get();
      admins.push({
        userId: doc.id,
        roleData: doc.data(),
        userData: userDoc.exists ? userDoc.data() : null
      });
    }

    res.json({ admins });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch admin users.'
    });
  }
}

/**
 * Get all university admin users
 * GET /api/admin/roles/university
 */
async function getUniversityAdmins(req, res) {
  try {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('roles_university').get();

    const universityAdmins = [];
    for (const doc of snapshot.docs) {
      const userDoc = await firestore.collection('users').doc(doc.id).get();
      const roleData = doc.data();
      const universityDoc = await firestore.collection('universities').doc(roleData.universityId).get();
      
      universityAdmins.push({
        userId: doc.id,
        roleData: roleData,
        userData: userDoc.exists ? userDoc.data() : null,
        universityData: universityDoc.exists ? { id: universityDoc.id, ...universityDoc.data() } : null
      });
    }

    res.json({ universityAdmins });
  } catch (error) {
    console.error('Get university admins error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch university admins.'
    });
  }
}

module.exports = {
  grantAdminRole,
  revokeAdminRole,
  grantUniversityRole,
  revokeUniversityRole,
  getAdminUsers,
  getUniversityAdmins
};

