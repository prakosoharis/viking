const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Email service
const { sendInvoiceEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS FIRST
// CORS configuration with explicit options
app.use(cors({
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '100mb' })); // Increase for Base64 uploads
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files (uploaded images) with CORS headers
app.use('/assets', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure client-advertisements directory exists
const clientAdsDir = path.join(__dirname, 'uploads', 'client-advertisements');
if (!fs.existsSync(clientAdsDir)) {
  fs.mkdirSync(clientAdsDir, { recursive: true });
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/invoice_db?authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  phone_number: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  created_at: { type: Date, default: Date.now },
  // Registration fields
  company_name: { type: String },
  org_nr: { type: String },
  address: { type: String },
  zip_code: { type: String },
  company_email: { type: String },
  updated_at: { type: Date, default: Date.now }
});

const uploadSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' },
  session_number: { type: Number, required: true, default: 1 },
  // Email tracking
  email_status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  email_sent_at: { type: Date },
  email_error: { type: String },
  email_id: { type: String } // Brevo email ID for tracking
});

const User = mongoose.model('User', userSchema);
const Upload = mongoose.model('Upload', uploadSchema);

// Client Advertisement Schema
const clientAdvertisementSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  name: { type: String },
  url: { type: String },
  uploaded_at: { type: Date, default: Date.now }
});

const ClientAdvertisement = mongoose.model('ClientAdvertisement', clientAdvertisementSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept all image formats (JPEG, PNG, HEIC, HEIF, WebP, AVIF, etc.)
  // Also accept PDF files
  // Also accept files with empty mimetype (iOS camera sometimes sends empty type)
  const isImage = file.mimetype.startsWith('image/') ||
                  file.mimetype === '' ||
                  /\.(jpe?g|png|gif|bmp|webp|heic|heif|avif)$/i.test(file.originalname);

  const isPDF = file.mimetype === 'application/pdf' ||
                /\.pdf$/i.test(file.originalname);

  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image and PDF files allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit (untuk HEIC/RAW images)
});

// Configure Multer for client advertisement uploads (separate storage)
const clientAdStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, clientAdsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Only accept images for client advertisements
const clientAdFileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/') ||
                  file.mimetype === '' ||
                  /\.(jpe?g|png|gif|bmp|webp|heic|heif|avif)$/i.test(file.originalname);

  if (isImage) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files allowed'), false);
  }
};

const clientAdUpload = multer({
  storage: clientAdStorage,
  fileFilter: clientAdFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for logos
});

// ==================== VALIDATION HELPERS ====================

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (numeric or starts with +)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

// Validation middleware for user creation/update
const validateUserData = (data) => {
  const errors = [];

  if (!data.company_name || !data.company_name.trim()) {
    errors.push('Company name is required');
  }

  if (!data.org_nr || !data.org_nr.trim()) {
    errors.push('Organization number is required');
  }

  if (!data.address || !data.address.trim()) {
    errors.push('Address is required');
  }

  if (!data.zip_code || !data.zip_code.trim()) {
    errors.push('Zip code is required');
  }

  if (!data.company_email || !data.company_email.trim()) {
    errors.push('Company email is required');
  } else if (!isValidEmail(data.company_email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone_number || !data.phone_number.trim()) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(data.phone_number)) {
    errors.push('Phone number must be numeric or start with +');
  }

  return errors;
};

// ==================== ADMIN AUTHENTICATION ====================

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('❌ JWT_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

// Constant-time compare so a wrong password cannot be found by timing
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Throttle failed logins per IP
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

const tooManyAttempts = (ip) => {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

const recordFailure = (ip) => {
  const entry = loginAttempts.get(ip);
  if (!entry || Date.now() - entry.first > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
};

const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==================== ROUTES ====================

// Admin login - issues a token used by every /api/admin route
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  const { username, password } = req.body;

  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
    recordFailure(ip);
    console.warn(`⚠️ Failed admin login from ${ip}`);
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  loginAttempts.delete(ip);
  const token = jwt.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS
  });

  res.json({ token, expires_in: TOKEN_TTL_SECONDS });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ==================== USER ROUTES ====================

// User login - CHECK ONLY (no auto-creation)
app.post('/api/users/login', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const user = await User.findOne({ phone_number });

    if (!user) {
      return res.status(404).json({
        error: 'Phone number not registered. Please contact your administrator to create an account.'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get all users
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// ==================== UPLOAD ROUTES ====================

// Upload images
app.post('/api/uploads', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({
        error: err.message || 'File upload error',
        code: err.code
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get last session number for this user
    const lastUpload = await Upload.findOne({ user_id }).sort({ session_number: -1 });
    const sessionNumber = lastUpload ? lastUpload.session_number + 1 : 1;

    const uploadPromises = req.files.map(file => {
      const imageUrl = `/assets/${file.filename}`;
      return new Upload({
        user_id,
        image_url: imageUrl,
        status: 'completed',
        session_number: sessionNumber
      }).save();
    });

    const uploads = await Promise.all(uploadPromises);

    // Send email to Tripletex (async, don't wait)
    const user = await User.findById(user_id);
    if (user) {
      sendInvoiceEmail(user, uploads, sessionNumber)
        .then(async (result) => {
          if (result.success) {
            // Update email status to 'sent'
            await Upload.updateMany(
              { user_id, session_number: sessionNumber },
              {
                email_status: 'sent',
                email_sent_at: new Date(),
                email_id: result.messageId
              }
            );
            console.log(`✅ Email status updated: sent (ID: ${result.messageId})`);
          } else {
            // Update email status to 'failed'
            await Upload.updateMany(
              { user_id, session_number: sessionNumber },
              {
                email_status: 'failed',
                email_error: result.error
              }
            );
            console.error(`❌ Email status updated: failed (${result.error})`);
          }
        })
        .catch((error) => {
          console.error('❌ Email send error:', error);
        });
    }

    res.json({
      success: true,
      count: uploads.length,
      uploads,
      session_number: sessionNumber
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Upload images via Base64 (iOS Safari camera workaround)
app.post('/api/uploads-base64', async (req, res) => {
  try {
    const { user_id, files } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Get last session number for this user
    const lastUpload = await Upload.findOne({ user_id }).sort({ session_number: -1 });
    const sessionNumber = lastUpload ? lastUpload.session_number + 1 : 1;

    const uploadPromises = files.map(async (fileData, idx) => {
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const matches = fileData.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error(`Invalid base64 data for file ${idx}`);
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      const ext = fileData.type.split('/')[1] || 'jpg';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      // Write file to disk
      await fs.promises.writeFile(filepath, imageBuffer);

      // Save to database
      const imageUrl = `/assets/${filename}`;
      return new Upload({
        user_id,
        image_url: imageUrl,
        status: 'completed',
        session_number: sessionNumber
      }).save();
    });

    const uploads = await Promise.all(uploadPromises);

    // Send email to Tripletex (async, don't wait)
    const user = await User.findById(user_id);
    if (user) {
      sendInvoiceEmail(user, uploads, sessionNumber)
        .then(async (result) => {
          if (result.success) {
            // Update email status to 'sent'
            await Upload.updateMany(
              { user_id, session_number: sessionNumber },
              {
                email_status: 'sent',
                email_sent_at: new Date(),
                email_id: result.messageId
              }
            );
            console.log(`✅ Email status updated: sent (ID: ${result.messageId})`);
          } else {
            // Update email status to 'failed'
            await Upload.updateMany(
              { user_id, session_number: sessionNumber },
              {
                email_status: 'failed',
                email_error: result.error
              }
            );
            console.error(`❌ Email status updated: failed (${result.error})`);
          }
        })
        .catch((error) => {
          console.error('❌ Email send error:', error);
        });
    }

    res.json({
      success: true,
      count: uploads.length,
      uploads,
      session_number: sessionNumber
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({ error: error.message || 'Server error during upload' });
  }
});

// Get uploads by user ID
app.get('/api/uploads/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const uploads = await Upload.find({ user_id: userId }).sort({ uploaded_at: -1 });
    res.json(uploads);
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ error: 'Server error fetching uploads' });
  }
});

// Get all uploads
app.get('/api/uploads', requireAdmin, async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ uploaded_at: -1 });
    res.json(uploads);
  } catch (error) {
    console.error('Get all uploads error:', error);
    res.status(500).json({ error: 'Server error fetching uploads' });
  }
});

// DELETE /api/uploads/:id - Delete single upload
app.delete('/api/uploads/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete physical file
    const imagePath = upload.image_url;
    if (imagePath && imagePath.startsWith('/assets/')) {
      const filename = imagePath.replace('/assets/', '');
      const filepath = path.join(uploadsDir, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`✅ File deleted: ${filename}`);
      }
    }

    // Delete database record
    await Upload.findByIdAndDelete(id);

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Server error deleting upload' });
  }
});

// DELETE /api/uploads/session/:userId/:sessionNumber - Delete all uploads in a session
app.delete('/api/uploads/session/:userId/:sessionNumber', requireAdmin, async (req, res) => {
  try {
    const { userId, sessionNumber } = req.params;

    const uploads = await Upload.find({ user_id: userId, session_number: parseInt(sessionNumber) });

    if (uploads.length === 0) {
      return res.status(404).json({ error: 'No uploads found for this session' });
    }

    // Delete all physical files
    for (const upload of uploads) {
      const imagePath = upload.image_url;
      if (imagePath && imagePath.startsWith('/assets/')) {
        const filename = imagePath.replace('/assets/', '');
        const filepath = path.join(uploadsDir, filename);

        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log(`✅ File deleted: ${filename}`);
        }
      }
    }

    // Delete all database records
    await Upload.deleteMany({ user_id: userId, session_number: parseInt(sessionNumber) });

    res.json({ message: `${uploads.length} uploads deleted successfully` });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error deleting session' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get users with upload counts
app.get('/api/admin/users-with-uploads', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });

    const usersWithUploads = await Promise.all(
      users.map(async (user) => {
        const uploads = await Upload.find({ user_id: user._id }).sort({ uploaded_at: -1 });
        return {
          ...user.toObject(),
          uploads,
          uploadCount: uploads.length
        };
      })
    );

    // Filter only users with uploads and sort by upload count
    const filteredUsers = usersWithUploads
      .filter(u => u.uploadCount > 0)
      .sort((a, b) => b.uploadCount - a.uploadCount);

    res.json(filteredUsers);
  } catch (error) {
    console.error('Get users with uploads error:', error);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
});

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

// GET /api/admin/users - Get all users with optional search
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    let query = { role: 'user' };

    if (search && search.trim()) {
      // Search by company name or phone number
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company_name: searchRegex },
        { phone_number: searchRegex }
      ];
    }

    const users = await User.find(query).sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// POST /api/admin/users - Create new user (registration)
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { company_name, org_nr, address, zip_code, company_email, phone_number } = req.body;

    // Validate all fields
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    // Create new user
    const newUser = new User({
      phone_number,
      company_name,
      org_nr,
      address,
      zip_code,
      company_email,
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// PUT /api/admin/users/:id - Update user
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, org_nr, address, zip_code, company_email, phone_number } = req.body;

    // Validate all fields
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if phone number is being changed to one that already exists
    if (phone_number !== user.phone_number) {
      const existingUser = await User.findOne({ phone_number });
      if (existingUser) {
        return res.status(409).json({ error: 'Phone number already registered' });
      }
    }

    // Update user
    user.company_name = company_name;
    user.org_nr = org_nr;
    user.address = address;
    user.zip_code = zip_code;
    user.company_email = company_email;
    user.phone_number = phone_number;
    user.updated_at = new Date();

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// DELETE /api/admin/users/:id - Delete user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's uploads first (cascade delete)
    await Upload.deleteMany({ user_id: id });

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and associated uploads deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// ==================== ADMIN CLIENT ADVERTISEMENT ROUTES ====================

// POST /api/admin/client-advertisements - Upload client advertisement logos
app.post('/api/admin/client-advertisements', requireAdmin, (req, res, next) => {
  clientAdUpload.array('logos', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({
        error: err.message || 'File upload error',
        code: err.code
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Parse metadata from request body
    let advertisementsData = [];
    try {
      advertisementsData = JSON.parse(req.body.advertisements || '[]');
    } catch (e) {
      console.error('Error parsing advertisements metadata:', e);
      advertisementsData = [];
    }

    const uploadPromises = req.files.map((file, index) => {
      const imageUrl = `/assets/client-advertisements/${file.filename}`;
      const adData = advertisementsData[index] || {};

      return new ClientAdvertisement({
        image_url: imageUrl,
        name: adData.name || null,
        url: adData.url || null
      }).save();
    });

    const advertisements = await Promise.all(uploadPromises);

    res.json({
      success: true,
      count: advertisements.length,
      advertisements
    });
  } catch (error) {
    console.error('Upload client advertisement error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// GET /api/admin/client-advertisements - Get all client advertisements (for admin)
app.get('/api/admin/client-advertisements', requireAdmin, async (req, res) => {
  try {
    const advertisements = await ClientAdvertisement.find().sort({ uploaded_at: -1 });
    res.json(advertisements);
  } catch (error) {
    console.error('Get client advertisements error:', error);
    res.status(500).json({ error: 'Server error fetching advertisements' });
  }
});

// GET /api/client-advertisements - Get all client advertisements (public, for user app)
app.get('/api/client-advertisements', async (req, res) => {
  try {
    const advertisements = await ClientAdvertisement.find().sort({ uploaded_at: -1 });
    res.json(advertisements);
  } catch (error) {
    console.error('Get client advertisements error:', error);
    res.status(500).json({ error: 'Server error fetching advertisements' });
  }
});

// DELETE /api/admin/client-advertisements/:id - Delete a client advertisement
app.delete('/api/admin/client-advertisements/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await ClientAdvertisement.findById(id);
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', 'client-advertisements', path.basename(advertisement.image_url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await ClientAdvertisement.findByIdAndDelete(id);

    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Delete client advertisement error:', error);
    res.status(500).json({ error: 'Server error deleting advertisement' });
  }
});

// ==================== PUBLIC POLICY PAGES (for Google Play Store) ====================

const getBaseHTML = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CLICKZ</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 0 0 20px 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    h2 {
      color: #1e3a8a;
      font-size: 1.8rem;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    h2:first-child {
      margin-top: 0;
    }
    h3 {
      color: #1e40af;
      font-size: 1.3rem;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
      color: #4b5563;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin-bottom: 8px;
      color: #4b5563;
    }
    strong {
      color: #1e3a8a;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #6b7280;
      font-size: 0.9rem;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
      margin: 0 10px;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .contact-info {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .contact-info p {
      margin: 5px 0;
    }
    @media (max-width: 768px) {
      .header h1 { font-size: 2rem; }
      .content { padding: 25px; }
      h2 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>CLICKZ - Invoice Management Solution</p>
  </div>
  <div class="container">
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CLICKZ. All rights reserved.</p>
      <p style="margin-top: 15px;">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/about">About Us</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Privacy Policy Page
app.get('/privacy', (req, res) => {
  const content = `
    <h2>1. Information We Collect</h2>
    <p>CLICKZ collects the following types of information:</p>
    <ul>
      <li><strong>Personal Information:</strong> Phone number, company name, email address, organization number, and address that you provide.</li>
      <li><strong>Uploaded Content:</strong> Invoice images and PDF documents that you upload through our service.</li>
      <li><strong>Usage Data:</strong> App usage information, timestamps, and session data for service improvement.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
      <li>Provide and maintain our invoice upload service</li>
      <li>Process and store your uploaded invoices</li>
      <li>Send invoices to designated recipients via email</li>
      <li>Communicate with you about your account and service updates</li>
      <li>Improve our services and develop new features</li>
      <li>Comply with legal obligations</li>
    </ul>

    <h2>3. Data Storage and Security</h2>
    <p>We implement appropriate security measures to protect your information:</p>
    <ul>
      <li>All uploaded files are encrypted during transmission and storage</li>
      <li>We use secure servers and industry-standard security protocols</li>
      <li>Access to your data is restricted to authorized personnel only</li>
      <li>Your data is stored in secure data centers with controlled access</li>
    </ul>

    <h2>4. Data Sharing and Disclosure</h2>
    <p>We do not sell your personal information. We may share your data only in the following circumstances:</p>
    <ul>
      <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service</li>
      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
      <li><strong>With Your Consent:</strong> When you explicitly consent to sharing</li>
    </ul>

    <h2>5. Your Rights</h2>
    <p>You have the following rights regarding your data:</p>
    <ul>
      <li><strong>Access:</strong> Request a copy of your personal data</li>
      <li><strong>Correction:</strong> Update or correct inaccurate information</li>
      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
      <li><strong>Objection:</strong> Object to processing of your personal data</li>
      <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
    </ul>
    <p>To exercise these rights, please contact us using the information below.</p>

    <h2>6. Data Retention</h2>
    <p>We retain your personal data for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Uploaded invoices are retained according to your account settings and applicable legal requirements.</p>

    <h2>7. Children's Privacy</h2>
    <p>Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.</p>

    <h2>8. International Data Transfers</h2>
    <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
    <p><strong>Last Updated:</strong> February 2025</p>

    <h2>10. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
    <div class="contact-info">
      <p><strong>Email:</strong> admin@clickz.co.no</p>
      <p><strong>Website:</strong> www.clickz.co.no</p>
    </div>
  `;

  res.send(getBaseHTML('Privacy Policy', content));
});

// Terms of Service Page
app.get('/terms', (req, res) => {
  const content = `
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using the CLICKZ invoice upload service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.</p>

    <h2>2. Description of Service</h2>
    <p>CLICKZ is an invoice upload service that allows registered users to upload invoice images and PDF documents for processing and delivery to designated recipients via email.</p>

    <h2>3. User Responsibilities</h2>
    <p>As a user of CLICKZ, you agree to:</p>
    <ul>
      <li>Provide accurate and complete information when creating your account</li>
      <li>Only upload invoices that you have the right to share</li>
      <li>Ensure that uploaded content does not violate any laws or third-party rights</li>
      <li>Maintain the confidentiality of your account credentials</li>
      <li>Notify us immediately of any unauthorized use of your account</li>
      <li>Not use the service for any illegal or unauthorized purpose</li>
    </ul>

    <h2>4. Acceptable Use Policy</h2>
    <p>You agree NOT to:</p>
    <ul>
      <li>Upload malicious, harmful, or illegal content</li>
      <li>Impersonate any person or entity</li>
      <li>Interfere with or disrupt the Service or servers</li>
      <li>Attempt to gain unauthorized access to any portion of the Service</li>
      <li>Use the Service to transmit spam or unsolicited communications</li>
      <li>Upload content that infringes on intellectual property rights</li>
    </ul>

    <h2>5. Uploaded Content</h2>
    <p>Regarding content you upload:</p>
    <ul>
      <li>You retain ownership of the content you upload</li>
      <li>You grant us a license to process, store, and transmit your uploaded content for the purpose of providing the Service</li>
      <li>You are responsible for ensuring you have all necessary rights to upload the content</li>
      <li>We may remove content that violates these Terms or applicable laws</li>
    </ul>

    <h2>6. Intellectual Property</h2>
    <p>The Service and its original content, features, and functionality are owned by CLICKZ and are protected by international copyright, trademark, and other intellectual property laws. You may not:</p>
    <ul>
      <li>Copy, modify, or distribute the Service</li>
      <li>Use any trademarks, logos, or service marks without our prior written consent</li>
      <li>Reverse engineer or attempt to extract source code from the Service</li>
    </ul>

    <h2>7. Termination</h2>
    <p>We may suspend or terminate your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe:</p>
    <ul>
      <li>Violates these Terms</li>
      <li>Is harmful to other users, us, or third parties</li>
      <li>Violates applicable law</li>
    </ul>
    <p>Upon termination, your right to use the Service will immediately cease.</p>

    <h2>8. Disclaimers</h2>
    <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
    <ul>
      <li>MERCHANTABILITY</li>
      <li>FITNESS FOR A PARTICULAR PURPOSE</li>
      <li>NON-INFRINGEMENT</li>
      <li>ACCURACY OR RELIABILITY OF INFORMATION</li>
    </ul>

    <h2>9. Limitation of Liability</h2>
    <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLICKZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE.</p>

    <h2>10. Indemnification</h2>
    <p>You agree to indemnify and hold harmless CLICKZ from any claims, damages, losses, liabilities, and expenses arising from:</p>
    <ul>
      <li>Your use of the Service</li>
      <li>Your violation of these Terms</li>
      <li>Your violation of any third-party rights</li>
    </ul>

    <h2>11. Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of Norway, without regard to its conflict of law provisions.</p>

    <h2>12. Changes to Terms</h2>
    <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.</p>

    <h2>13. Contact Information</h2>
    <p>For questions about these Terms, please contact:</p>
    <div class="contact-info">
      <p><strong>Email:</strong> admin@clickz.co.no</p>
      <p><strong>Website:</strong> www.clickz.co.no</p>
    </div>
  `;

  res.send(getBaseHTML('Terms of Service', content));
});

// About Us Page
app.get('/about', (req, res) => {
  const content = `
    <h2>About CLICKZ</h2>
    <p>CLICKZ is a modern invoice management solution designed to streamline how businesses handle their invoice documentation and delivery. Our platform simplifies the process of uploading, managing, and sharing invoices with clients and partners.</p>

    <h2>Our Mission</h2>
    <p>To provide businesses with an efficient, secure, and user-friendly platform for invoice management that saves time, reduces errors, and improves cash flow.</p>

    <h2>What We Do</h2>
    <p>CLICKZ offers a comprehensive invoice upload solution that includes:</p>
    <ul>
      <li><strong>Easy Upload:</strong> Capture and upload invoices via camera or file selection</li>
      <li><strong>Multiple Formats:</strong> Support for images (JPG, PNG, HEIC, WebP) and PDF documents</li>
      <li><strong>Secure Storage:</strong> Bank-level encryption for all uploaded documents</li>
      <li><strong>Email Delivery:</strong> Automatic delivery of invoices to designated recipients</li>
      <li><strong>Upload History:</strong> Track and manage all your uploads in one place</li>
      <li><strong>Session Management:</strong> Organize uploads into sessions for better tracking</li>
    </ul>

    <h2>Why Choose CLICKZ?</h2>
    <p>We understand the challenges businesses face with invoice management. That's why we built CLICKZ with focus on:</p>
    <ul>
      <li><strong>Simplicity:</strong> Intuitive interface that anyone can use</li>
      <li><strong>Security:</strong> Your data is protected with enterprise-grade security</li>
      <li><strong>Reliability:</strong> 99.9% uptime guarantee for business continuity</li>
      <li><strong>Speed:</strong> Fast uploads and processing</li>
      <li><strong>Support:</strong> Dedicated customer support team</li>
    </ul>

    <h2>Our Commitment</h2>
    <p>We are committed to continuously improving our platform based on user feedback and evolving business needs. Your success is our priority, and we work hard to ensure CLICKZ meets and exceeds your expectations.</p>

    <h2>Contact Us</h2>
    <p>We'd love to hear from you! Reach out to us:</p>
    <div class="contact-info">
      <p><strong>Email:</strong> admin@clickz.co.no</p>
      <p><strong>Website:</strong> www.clickz.co.no</p>
    </div>
  `;

  res.send(getBaseHTML('About Us', content));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from /assets`);
});
