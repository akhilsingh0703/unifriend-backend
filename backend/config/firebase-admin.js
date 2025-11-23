const admin = require('firebase-admin');

let firebaseAdminInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  if (firebaseAdminInitialized) {
    return admin;
  }

  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      firebaseAdminInitialized = true;
      return admin;
    }

    // Hardcoded Firebase Project Configuration
    const HARDCODED_PROJECT_ID = 'studio-8902009279-d5e73';
    
    // Hardcoded Service Account Credentials
    const HARDCODED_SERVICE_ACCOUNT = {
      projectId: HARDCODED_PROJECT_ID,
      privateKeyId: '4f0578088f07a0ea56d6101b0cb5cd2ffc2ef005',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAlKst9Nj3tP+/\nZtwvSfD5sapTyr+cnKXQ/zWLUJ/o3JPhEGxd1r0JPC4lKM2MsgD1fcQS1e32grWz\nK4VQ9yJKPM0ga3yZX1AoBVPAm585vd/6GUBbScvaQdltVwz1b7uGgpq6uEtYIYwo\nmffK2G5dbvREOzyrezSl8WGvbFkzfhLW5zah0NlToIFHErmvtDfgj/2bkehzToN2\nJI3806wD3W9sRirtJx1aT3zD1VxwN18fbBJMYNan1ldADjxLQETETAr/4NRJkBIK\nHEMQabNguLGLRq/2cIPHoB5zyTqdTSGTAZNOL5zdgskuHp4Z7ZiMkOcXsZqEDXw5\nWdaHZjVfAgMBAAECggEAVHN9o8AZO3tEoedWDGjFA4KNWoRxRZkOQBoCnY7kKSY9\ntTdSBk6qhDe/Vq1PgnD26bDWwJnO6kjErIcbxfcyMtL580sfj1SUXpCDe1XjW9tv\nsonLRp0Uh6hT1FaVyLXQSvrQJqy14baIc6+dUfdaYp/K/3bospxraI/zUg3WCjVt\nvUodYHyPaeLWk9gVgycyl1ISYZqKnqdTOwmvTVSPnzR9lWWiD3BeI6E+SeVNybwP\ndl4QYaAuwJAAxItpdYkqoaOOkl0zICYxW/05oZPToBp9YgEgcc3FONxCBQE3uLng\nBgiArQZhED1PGXkZZUBbwp5YR9wmcx2z/H/M3iGxMQKBgQD5LIBKk75OJ4YrSR2Z\nMl/jGgDdSu/JC0c55XQbIlRZVAWvETm9d82fEYWUuWC1cq288s+ndE/PxddFJK9t\nvIYy1CJZHmdY/ejZiZB/hWgToKrzxlkaXza0MMZKAzTsMUjFvYt1hUafAmov5vo+\nZ5+0zFG5ESj9k2AwkVNJWso2jwKBgQDF20U7aE1zU71NAKxDln3UWaGLnCOmi9nS\n8aLJKwOudH/Urw3gHKhA7KG3Tl3MWBSN/8rMCaC5s2FwWnYWO6YjSHCiEy5VLmXW\nvnmtBr4BLqLVFuMGW2w4Aeg2VPtBAM3lOt2DkBRCbzVXLlUoT3RP/w/wcOU9jPx0\n203ZXbP8MQKBgQCKtp9k5QLYd2BV0IpNsqF2yA8bIpCCl2i7bmVIhb/3SrMvVqOS\nOpOZriNzPA/+cy0NNw8q5bFYtYa100pmCMGcokPM4QQfoppyIAb1NstNwe/pbc5E\nxCSsA0sgANEBfB5LFs4ASoWaF7oNmMRO4VkjSWtlX4w2PkkaQIzhFU3lOQKBgQCq\nTVRIED0qGVgFYaDlBDIGh6fPHXRqNFInialOcmHW1Zv6GztcPg5s48FGoIOIEgCP\nQS7zdQ4NCWPDa3ndJTaZhA6+0re8xhUORCFDV1xQdC3gMLT0kdiSVMHlkjw59VFE\nD+j/BxMJI+PLyKuv6MP631Z+5Q3MbwAWLXXStR7o4QKBgG4tX8iP5exMvpNOXJW1\n1PrLJkF+9hAXnB9sfslF88ChwN/zGCcjx2qE3f3BDABPbnl6NsuEF1osvDz4OKZK\nQgafBi2UUuoFCf5rkB9DYUPHyXaPzqsVtkB9BccyeztQbIkQ91KMTRhL/EcB2gZs\n+eZLhW3aqE7k0h1+dt3uXot7\n-----END PRIVATE KEY-----\n',
      clientEmail: 'firebase-adminsdk-fbsvc@studio-8902009279-d5e73.iam.gserviceaccount.com',
      clientId: '100061242837740809038',
      authUri: 'https://accounts.google.com/o/oauth2/auth',
      tokenUri: 'https://oauth2.googleapis.com/token',
      authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
      clientX509CertUrl: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-8902009279-d5e73.iam.gserviceaccount.com'
    };

    // Initialize with service account credentials (hardcoded values take priority, fallback to env vars)
    const serviceAccount = {
      projectId: HARDCODED_SERVICE_ACCOUNT.projectId || process.env.FIREBASE_PROJECT_ID,
      privateKeyId: HARDCODED_SERVICE_ACCOUNT.privateKeyId || process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: (HARDCODED_SERVICE_ACCOUNT.privateKey || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
      clientEmail: HARDCODED_SERVICE_ACCOUNT.clientEmail || process.env.FIREBASE_CLIENT_EMAIL,
      clientId: HARDCODED_SERVICE_ACCOUNT.clientId || process.env.FIREBASE_CLIENT_ID,
      authUri: HARDCODED_SERVICE_ACCOUNT.authUri || process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      tokenUri: HARDCODED_SERVICE_ACCOUNT.tokenUri || process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      authProviderX509CertUrl: HARDCODED_SERVICE_ACCOUNT.authProviderX509CertUrl || process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      clientX509CertUrl: HARDCODED_SERVICE_ACCOUNT.clientX509CertUrl || process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Validate required fields
    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Missing required Firebase Admin configuration. Please provide service account credentials in the HARDCODED_SERVICE_ACCOUNT object or .env file.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId
    });

    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
function getFirestore() {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
}

/**
 * Get Auth instance
 */
function getAuth() {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}

module.exports = {
  initializeFirebaseAdmin,
  getFirestore,
  getAuth,
  admin
};

