const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// ==================== ROUTES ====================

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
app.get('/api/users', async (req, res) => {
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
app.get('/api/uploads', async (req, res) => {
  try {
    const uploads = await Upload.find().sort({ uploaded_at: -1 });
    res.json(uploads);
  } catch (error) {
    console.error('Get all uploads error:', error);
    res.status(500).json({ error: 'Server error fetching uploads' });
  }
});

// ==================== ADMIN ROUTES ====================

// Get users with upload counts
app.get('/api/admin/users-with-uploads', async (req, res) => {
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
app.get('/api/admin/users', async (req, res) => {
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
app.post('/api/admin/users', async (req, res) => {
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
app.put('/api/admin/users/:id', async (req, res) => {
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
app.delete('/api/admin/users/:id', async (req, res) => {
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
app.post('/api/admin/client-advertisements', (req, res, next) => {
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
app.get('/api/admin/client-advertisements', async (req, res) => {
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
app.delete('/api/admin/client-advertisements/:id', async (req, res) => {
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
