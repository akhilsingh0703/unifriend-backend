const { getFirestore } = require('../config/firebase-admin');

/**
 * Get all universities with optional filters
 * GET /api/universities
 */
async function getUniversities(req, res) {
  try {
    const firestore = getFirestore();
    const {
      location,
      type,
      minRating,
      maxRating,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    let query = firestore.collection('universities');

    // Apply filters
    if (location) {
      query = query.where('location', '==', location);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (minRating) {
      query = query.where('rating', '>=', parseFloat(minRating));
    }
    if (maxRating) {
      query = query.where('rating', '<=', parseFloat(maxRating));
    }

    // Get all universities (Firestore doesn't support full-text search natively)
    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();
    
    let universities = [];
    snapshot.forEach(doc => {
      universities.push({ id: doc.id, ...doc.data() });
    });

    // Apply search filter in memory if provided
    if (search) {
      const searchLower = search.toLowerCase();
      universities = universities.filter(uni => 
        uni.name?.toLowerCase().includes(searchLower) ||
        uni.address?.toLowerCase().includes(searchLower) ||
        uni.about?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      universities,
      total: universities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch universities.'
    });
  }
}

/**
 * Get a single university by ID
 * GET /api/universities/:id
 */
async function getUniversityById(req, res) {
  try {
    const firestore = getFirestore();
    const { id } = req.params;

    const universityDoc = await firestore.collection('universities').doc(id).get();

    if (!universityDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'University not found.'
      });
    }

    res.json({ id: universityDoc.id, ...universityDoc.data() });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch university.'
    });
  }
}

/**
 * Create a new university (Admin only)
 * POST /api/universities
 */
async function createUniversity(req, res) {
  try {
    const firestore = getFirestore();
    const universityData = req.body;

    // Validate required fields
    if (!universityData.name || !universityData.address) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Name and address are required.'
      });
    }

    // Add timestamps
    const now = new Date();
    universityData.createdAt = now;
    universityData.updatedAt = now;

    const docRef = await firestore.collection('universities').add(universityData);

    res.status(201).json({ 
      id: docRef.id,
      ...universityData,
      message: 'University created successfully.'
    });
  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create university.'
    });
  }
}

/**
 * Update a university (Admin or University Admin)
 * PUT /api/universities/:id
 */
async function updateUniversity(req, res) {
  try {
    const firestore = getFirestore();
    const { id } = req.params;
    const updateData = req.body;

    // Check if university exists
    const universityDoc = await firestore.collection('universities').doc(id).get();
    
    if (!universityDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'University not found.'
      });
    }

    // Check if user is admin
    const adminRoleDoc = await firestore
      .collection('roles_admin')
      .doc(req.user.uid)
      .get();
    
    const isAdmin = adminRoleDoc.exists;

    // Check if user is university admin
    const universityRoleDoc = await firestore
      .collection('roles_university')
      .doc(req.user.uid)
      .get();
    
    const isUniversityAdmin = universityRoleDoc.exists;
    const userUniversityId = isUniversityAdmin ? universityRoleDoc.data().universityId : null;

    // If user is university admin, verify they own this university
    if (isUniversityAdmin && userUniversityId !== id) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only update your own university.'
      });
    }

    // If user is neither admin nor university admin, deny access
    if (!isAdmin && !isUniversityAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin or University Admin access required.'
      });
    }

    // Add update timestamp
    updateData.updatedAt = new Date();

    await firestore.collection('universities').doc(id).update(updateData);

    const updatedDoc = await firestore.collection('universities').doc(id).get();

    res.json({ 
      id: updatedDoc.id,
      ...updatedDoc.data(),
      message: 'University updated successfully.'
    });
  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update university.'
    });
  }
}

/**
 * Delete a university (Admin only)
 * DELETE /api/universities/:id
 */
async function deleteUniversity(req, res) {
  try {
    const firestore = getFirestore();
    const { id } = req.params;

    const universityDoc = await firestore.collection('universities').doc(id).get();
    
    if (!universityDoc.exists) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'University not found.'
      });
    }

    await firestore.collection('universities').doc(id).delete();

    res.json({ 
      message: 'University deleted successfully.'
    });
  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to delete university.'
    });
  }
}

module.exports = {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity
};

