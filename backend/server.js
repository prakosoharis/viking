const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images)
app.use('/assets', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
  created_at: { type: Date, default: Date.now }
});

const uploadSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' }
});

const User = mongoose.model('User', userSchema);
const Upload = mongoose.model('Upload', uploadSchema);

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
  // Also accept files with empty mimetype (iOS camera sometimes sends empty type)
  const isImage = file.mimetype.startsWith('image/') ||
                  file.mimetype === '' ||
                  /\.(jpe?g|png|gif|bmp|webp|heic|heif|avif)$/i.test(file.originalname);

  if (isImage) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit (untuk HEIC/RAW images)
});

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ==================== USER ROUTES ====================

// Get or create user by phone number
app.post('/api/users/login', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    let user = await User.findOne({ phone_number });

    if (!user) {
      user = new User({
        phone_number,
        role: 'user'
      });
      await user.save();
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
      console.error('Multer error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      return res.status(400).json({
        error: err.message || 'File upload error',
        code: err.code
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Log file details
    req.files.forEach((file, idx) => {
      console.log(`File ${idx}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename
      });
    });

    const uploadPromises = req.files.map(file => {
      const imageUrl = `/assets/${file.filename}`;
      return new Upload({
        user_id,
        image_url: imageUrl,
        status: 'completed'
      }).save();
    });

    const uploads = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${uploads.length} files`);

    res.json({
      success: true,
      count: uploads.length,
      uploads
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
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
