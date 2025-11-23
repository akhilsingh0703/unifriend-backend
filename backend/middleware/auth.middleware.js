const admin = require('firebase-admin');
const { getAuth } = require('../config/firebase-admin');

/**
 * Middleware to verify Firebase ID token
 * Expects Authorization header: Bearer <token>
 */
async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided. Please include Authorization header with Bearer token.'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token format.'
      });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token. Please login again.'
    });
  }
}

/**
 * Middleware to check if user is admin
 * Must be used after verifyFirebaseToken
 */
async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    const firestore = admin.firestore();
    const adminRoleDoc = await firestore
      .collection('roles_admin')
      .doc(req.user.uid)
      .get();

    if (!adminRoleDoc.exists) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required.'
      });
    }

    req.user.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify admin status.'
    });
  }
}

/**
 * Middleware to check if user is university admin
 * Must be used after verifyFirebaseToken
 */
async function requireUniversityAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    const firestore = admin.firestore();
    const universityRoleDoc = await firestore
      .collection('roles_university')
      .doc(req.user.uid)
      .get();

    if (!universityRoleDoc.exists) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'University admin access required.'
      });
    }

    const universityRole = universityRoleDoc.data();
    req.user.universityId = universityRole.universityId;
    req.user.isUniversityAdmin = true;
    next();
  } catch (error) {
    console.error('University admin check error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify university admin status.'
    });
  }
}

/**
 * Middleware to check if user owns the resource or is admin
 * Must be used after verifyFirebaseToken
 */
function requireOwnerOrAdmin(req, res, next) {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required.'
    });
  }

  // If user is admin, allow access
  if (req.user.isAdmin) {
    return next();
  }

  // Check if user owns the resource
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (resourceUserId && resourceUserId === req.user.uid) {
    return next();
  }

  return res.status(403).json({ 
    error: 'Forbidden',
    message: 'You do not have permission to access this resource.'
  });
}

module.exports = {
  verifyFirebaseToken,
  requireAdmin,
  requireUniversityAdmin,
  requireOwnerOrAdmin
};

