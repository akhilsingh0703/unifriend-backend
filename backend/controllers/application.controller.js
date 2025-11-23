const { getFirestore } = require('../config/firebase-admin');

/**
 * Get all applications for the current user
 * GET /api/applications
 */
async function getUserApplications(req, res) {
  try {
    const firestore = getFirestore();
    const applicationsSnapshot = await firestore
      .collection('users')
      .doc(req.user.uid)
      .collection('applications')
      .orderBy('submittedAt', 'desc')
      .get();

    const applications = [];
    applicationsSnapshot.forEach(doc => {
      applications.push({ id: doc.id, ...doc.data() });
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch applications.'
    });
  }
}

/**
 * Get a single application by ID
 * GET /api/applications/:id
 */
async function getApplicationById(req, res) {
  try {
    const firestore = getFirestore();
    const { id } = req.params;

    // Try to find in user's applications
    const applicationDoc = await firestore
      .collection('users')
      .doc(req.user.uid)
      .collection('applications')
      .doc(id)
      .get();

    if (!applicationDoc.exists) {
      // If not found and user is admin/university admin, search globally
      if (req.user.isAdmin || req.user.isUniversityAdmin) {
        // Use collection group query to find across all users
        const collectionGroupQuery = await firestore
          .collectionGroup('applications')
          .where('__name__', '==', id)
          .limit(1)
          .get();

        if (collectionGroupQuery.empty) {
          return res.status(404).json({ 
            error: 'Not Found',
            message: 'Application not found.'
          });
        }

        const doc = collectionGroupQuery.docs[0];
        return res.json({ id: doc.id, ...doc.data() });
      }

      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Application not found.'
      });
    }

    res.json({ id: applicationDoc.id, ...applicationDoc.data() });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch application.'
    });
  }
}

/**
 * Create a new application
 * POST /api/applications
 */
async function createApplication(req, res) {
  try {
    const firestore = getFirestore();
    const {
      universityId,
      universityName,
      courseName,
      tradeName,
      studentName,
      email,
      phone,
      city,
      message
    } = req.body;

    // Validate required fields
    if (!universityId || !courseName || !studentName || !email) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'University ID, course name, student name, and email are required.'
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

    // Get trade fees if tradeName is provided
    let fees = 'N/A';
    if (tradeName && universityDoc.data().courses) {
      const course = universityDoc.data().courses.find(c => c.name === courseName);
      if (course && course.trades) {
        const trade = course.trades.find(t => t.name === tradeName);
        if (trade) {
          fees = trade.fees || 'N/A';
        }
      }
    }

    const applicationData = {
      studentId: req.user.uid,
      studentName,
      email,
      phone: phone || null,
      city: city || null,
      message: message || null,
      universityId,
      universityName: universityName || universityDoc.data().name,
      courseName,
      tradeName: tradeName || null,
      fees,
      status: 'Pending',
      submittedAt: new Date()
    };

    const docRef = await firestore
      .collection('users')
      .doc(req.user.uid)
      .collection('applications')
      .add(applicationData);

    res.status(201).json({ 
      id: docRef.id,
      ...applicationData,
      message: 'Application submitted successfully.'
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to create application.'
    });
  }
}

/**
 * Update application status (University Admin or Admin only)
 * PUT /api/applications/:id/status
 */
async function updateApplicationStatus(req, res) {
  try {
    const firestore = getFirestore();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Review', 'Reviewed', 'Approved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find the application using collection group query
    const collectionGroupQuery = await firestore
      .collectionGroup('applications')
      .where('__name__', '==', id)
      .limit(1)
      .get();

    if (collectionGroupQuery.empty) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Application not found.'
      });
    }

    const applicationDoc = collectionGroupQuery.docs[0];
    const applicationData = applicationDoc.data();

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

    // If user is university admin, verify they own the university
    if (isUniversityAdmin && applicationData.universityId !== userUniversityId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only update applications for your university.'
      });
    }

    // If user is neither admin nor university admin, deny access
    if (!isAdmin && !isUniversityAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin or University Admin access required.'
      });
    }

    // Update the application
    await applicationDoc.ref.update({
      status,
      updatedAt: new Date()
    });

    const updatedDoc = await applicationDoc.ref.get();

    res.json({ 
      id: updatedDoc.id,
      ...updatedDoc.data(),
      message: 'Application status updated successfully.'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to update application status.'
    });
  }
}

/**
 * Get applications for a university (University Admin only)
 * GET /api/applications/university/:universityId
 */
async function getUniversityApplications(req, res) {
  try {
    const firestore = getFirestore();
    const { universityId } = req.params;

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
    if (isUniversityAdmin && userUniversityId !== universityId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only view applications for your university.'
      });
    }

    // If user is neither admin nor university admin, deny access
    if (!isAdmin && !isUniversityAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin or University Admin access required.'
      });
    }

    // Query all applications for this university using collection group
    const applicationsSnapshot = await firestore
      .collectionGroup('applications')
      .where('universityId', '==', universityId)
      .orderBy('submittedAt', 'desc')
      .get();

    const applications = [];
    applicationsSnapshot.forEach(doc => {
      applications.push({ id: doc.id, ...doc.data() });
    });

    res.json({ applications, total: applications.length });
  } catch (error) {
    console.error('Get university applications error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch applications.'
    });
  }
}

module.exports = {
  getUserApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  getUniversityApplications
};

