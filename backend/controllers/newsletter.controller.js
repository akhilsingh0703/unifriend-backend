const { getFirestore } = require('../config/firebase-admin');

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
async function subscribeNewsletter(req, res) {
  try {
    const firestore = getFirestore();
    const {
      email,
      mobileNumber,
      course
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Email is required.'
      });
    }

    const subscriptionData = {
      email,
      mobileNumber: mobileNumber || null,
      course: course || null,
      createdAt: new Date()
    };

    const docRef = await firestore.collection('newsletter_subscriptions').add(subscriptionData);

    res.status(201).json({ 
      id: docRef.id,
      ...subscriptionData,
      message: 'Successfully subscribed to newsletter.'
    });
  } catch (error) {
    console.error('Subscribe newsletter error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to subscribe to newsletter.'
    });
  }
}

/**
 * Get all newsletter subscriptions (Admin only)
 * GET /api/newsletter/subscriptions
 */
async function getSubscriptions(req, res) {
  try {
    const firestore = getFirestore();
    const { limit = 100, offset = 0 } = req.query;

    const snapshot = await firestore
      .collection('newsletter_subscriptions')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const subscriptions = [];
    snapshot.forEach(doc => {
      subscriptions.push({ id: doc.id, ...doc.data() });
    });

    res.json({ 
      subscriptions,
      total: subscriptions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch subscriptions.'
    });
  }
}

module.exports = {
  subscribeNewsletter,
  getSubscriptions
};

