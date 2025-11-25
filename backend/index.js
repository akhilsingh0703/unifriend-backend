require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Firebase Admin initialization
const { initializeFirebaseAdmin } = require('./config/firebase-admin');
initializeFirebaseAdmin();

const app = express();

// ---------------- Security Middleware ----------------
app.use(helmet());

// ---------------- CORS Configuration ----------------
const allowedOrigins = [
  'https://unifriend.in',
  'https://www.unifriend.in'
];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:9002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:9002'
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true); // allow request
    }
    console.warn('CORS blocked:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 600
};

// Apply CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight requests

// ---------------- Rate Limiting ----------------
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP
  message: 'Too many requests from this IP, please try again later.'
}));

// ---------------- Body Parsing ----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------- Logging (Dev Only) ----------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------------- Health Check ----------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ---------------- API Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

// ---------------- 404 Handler ----------------
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ---------------- Error Handler ----------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ---------------- Export for Vercel ----------------
module.exports = (req, res) => app(req, res);
