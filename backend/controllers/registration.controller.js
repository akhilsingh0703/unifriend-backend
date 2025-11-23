const { getFirestore } = require('../config/firebase-admin');

/**
 * Create a new registration
 * POST /api/registrations
 */
async function createRegistration(req, res) {
  try {
    const firestore = getFirestore();
    const {
      fullName,
      email,
      mobileNumber,
      city,
      courseInterestedIn,
      onlineDistance
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !mobileNumber || !city || !courseInterestedIn) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Full name, email, mobile number, city, and course interest are required.'
      });
    }

    const registrationData = {
      fullName,
      email,
      mobileNumber,
      city,
      courseInterestedIn,
      onlineDistance: onlineDistance === true || onlineDistance === 'true',
      createdAt: new Date()
    };

    const docRef = await firestore.collection('registrations').add(registrationData);

    res.status(201).json({ 
      id: docRef.id,
      ...registrationData,
      message: 'Registration submitted successfully.'
    });
  } catch (error) {
    console.error('Create registration error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create registration.'
    });
  }
}

/**
 * Get all registrations (Admin only)
 * GET /api/registrations
 */
async function getRegistrations(req, res) {
  try {
    const firestore = getFirestore();
    const { limit = 100, offset = 0 } = req.query;

    const snapshot = await firestore
      .collection('registrations')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const registrations = [];
    snapshot.forEach(doc => {
      registrations.push({ id: doc.id, ...doc.data() });
    });

    res.json({ 
      registrations,
      total: registrations.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch registrations.'
    });
  }
}

module.exports = {
  createRegistration,
  getRegistrations
};

