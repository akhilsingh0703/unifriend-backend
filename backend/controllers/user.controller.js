const { getFirestore } = require('../config/firebase-admin');

/**
 * Get user profile
 * GET /api/users/:userId
 */
async function getUserProfile(req, res) {
  try {
    const firestore = getFirestore();
    const { userId } = req.params;

    // Users can only view their own profile unless they're admin
    if (!req.user.isAdmin && req.user.uid !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only view your own profile.'
      });
    }

    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User not found.'
      });
    }

    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile.'
    });
  }
}

/**
 * Update user profile
 * PUT /api/users/:userId
 */
async function updateUserProfile(req, res) {
  try {
    const firestore = getFirestore();
    const { userId } = req.params;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin
    if (!req.user.isAdmin && req.user.uid !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only update your own profile.'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;

    updateData.updatedAt = new Date();

    await firestore.collection('users').doc(userId).update(updateData);

    const updatedDoc = await firestore.collection('users').doc(userId).get();

    res.json({ 
      id: updatedDoc.id,
      ...updatedDoc.data(),
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update profile.'
    });
  }
}

/**
 * Get current user's profile (convenience endpoint)
 * GET /api/users/me
 */
async function getCurrentUserProfile(req, res) {
  try {
    const firestore = getFirestore();
    const userDoc = await firestore.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      const newUserData = {
        id: req.user.uid,
        email: req.user.email,
        fullName: req.user.name || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestore.collection('users').doc(req.user.uid).set(newUserData);
      return res.json(newUserData);
    }

    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch profile.'
    });
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  getCurrentUserProfile
};

