require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth.routes');
const universityRoutes = require('./routes/university.routes');
const applicationRoutes = require('./routes/application.routes');
const userRoutes = require('./routes/user.routes');
const registrationRoutes = require('./routes/registration.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const adminRoutes = require('./routes/admin.routes');

// Import Firebase Admin initialization
const { initializeFirebaseAdmin } = require('./config/firebase-admin');

// Initialize Firebase Admin
initializeFirebaseAdmin();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const baseAllowedOrigins = [
  'https://unifriend.in',
  'https://www.unifriend.in'
];

if (process.env.NODE_ENV !== 'production') {
  baseAllowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:9002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:9002'
  );
}

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow server-to-server or curl requests
  return baseAllowedOrigins.includes(origin);
};

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization'
];

const corsMiddleware = (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (!isOriginAllowed(requestOrigin)) {
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }

  if (requestOrigin) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.header('Access-Control-Allow-Origin', baseAllowedOrigins[0]);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', ALLOWED_METHODS.join(','));
  res.header('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(','));
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  next();
};

app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;

