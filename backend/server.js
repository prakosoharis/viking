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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
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
app.post('/api/uploads', upload.array('images', 10), async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      const imageUrl = `/assets/${file.filename}`;
      return new Upload({
        user_id,
        image_url: imageUrl,
        status: 'completed'
      }).save();
    });

    const uploads = await Promise.all(uploadPromises);
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
