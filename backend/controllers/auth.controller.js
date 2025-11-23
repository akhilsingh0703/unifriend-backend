const { getAuth, getFirestore } = require('../config/firebase-admin');

/**
 * Verify Firebase ID token and return user info
 * POST /api/auth/verify
 */
async function verifyToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Token is required.'
      });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Get user document from Firestore
    const firestore = getFirestore();
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    
    let userData = null;
    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    }

    // Check admin role
    const adminRoleDoc = await firestore
      .collection('roles_admin')
      .doc(decodedToken.uid)
      .get();
    
    // Check university role
    const universityRoleDoc = await firestore
      .collection('roles_university')
      .doc(decodedToken.uid)
      .get();

    res.json({
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        ...userData
      },
      roles: {
        isAdmin: adminRoleDoc.exists,
        isUniversityAdmin: universityRoleDoc.exists,
        universityId: universityRoleDoc.exists ? universityRoleDoc.data().universityId : null
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token.'
    });
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const firestore = getFirestore();
    const userDoc = await firestore.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User profile not found.'
      });
    }

    const userData = { id: userDoc.id, ...userDoc.data() };

    // Check roles
    const adminRoleDoc = await firestore
      .collection('roles_admin')
      .doc(req.user.uid)
      .get();
    
    const universityRoleDoc = await firestore
      .collection('roles_university')
      .doc(req.user.uid)
      .get();

    res.json({
      ...userData,
      roles: {
        isAdmin: adminRoleDoc.exists,
        isUniversityAdmin: universityRoleDoc.exists,
        universityId: universityRoleDoc.exists ? universityRoleDoc.data().universityId : null
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile.'
    });
  }
}

module.exports = {
  verifyToken,
  getCurrentUser
};

