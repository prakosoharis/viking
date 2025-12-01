import React, { useState, useEffect } from 'react';
import { Upload, LogOut, CheckCircle, Image as ImageIcon, Phone, Calendar, Camera } from 'lucide-react';
import api from './api';

// Storage key for current user session (still use localStorage for session)
const STORAGE_KEY_CURRENT_USER = 'invoice_current_user';

// Viking Helm Logo Component
const VikingHelm = ({ className = "w-16 h-16", color = "currentColor" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Left Horn */}
    <path
      d="M15 35 Q10 25 8 15 Q7 10 10 8 Q12 7 14 10 L20 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Right Horn */}
    <path
      d="M85 35 Q90 25 92 15 Q93 10 90 8 Q88 7 86 10 L80 30 Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />

    {/* Helm Main Body */}
    <ellipse cx="50" cy="55" rx="32" ry="35" fill={color} />

    {/* Face Opening */}
    <rect x="35" y="50" width="30" height="25" rx="3" fill="white" opacity="0.9" />

    {/* Eye Slits */}
    <rect x="38" y="56" width="10" height="4" rx="1" fill={color} />
    <rect x="52" y="56" width="10" height="4" rx="1" fill={color} />

    {/* Nose Guard */}
    <path
      d="M48 60 L50 70 L52 60 Z"
      fill={color}
      opacity="0.8"
    />

    {/* Helm Details - Rivets */}
    <circle cx="25" cy="50" r="2" fill="white" opacity="0.6" />
    <circle cx="75" cy="50" r="2" fill="white" opacity="0.6" />
    <circle cx="30" cy="65" r="2" fill="white" opacity="0.6" />
    <circle cx="70" cy="65" r="2" fill="white" opacity="0.6" />

    {/* Top Ridge */}
    <path
      d="M30 38 Q50 35 70 38"
      stroke="white"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, count }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-scale">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">
            {count} {count === 1 ? 'image' : 'images'} uploaded
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      onLogin(phone.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <VikingHelm className="w-16 h-16" color="#2563eb" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vikings Invoice</h1>
            <p className="text-gray-600">Enter your phone number to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg shadow-blue-200 hover:shadow-xl"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [uploads, setUploads] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      const userUploads = await api.getUserUploads(user._id);
      setUploads(userUploads);
    } catch (error) {
      console.error('Failed to load uploads:', error);
      alert('Failed to load your uploads. Please try again.');
    }
  };

  // Not needed anymore - validation done during processing

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = validateFiles(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    const inputId = e.target.id; // camera-input or gallery-input

    const processedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Store as object with buffer and metadata
        const fileData = {
          name: file.name,
          type: file.type || 'image/jpeg',
          size: file.size,
          arrayBuffer: arrayBuffer,
          fromCamera: inputId === 'camera-input' // Flag for camera files
        };

        processedFiles.push(fileData);
      } catch (error) {
        console.error(`Failed to process file ${i}:`, error);
      }
    }

    setSelectedFiles(processedFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const result = await api.uploadImages(user._id, selectedFiles);

      setUploadCount(result.count);
      setShowModal(true);
      setSelectedFiles([]);

      // Reload uploads
      loadUploads();
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload images: ${error.message || 'Please try again'}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice Upload</h1>
                <p className="text-sm text-gray-600">{user.phone_number}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Images</h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            {/* Hidden input for camera (no multiple - iOS issue) */}
            <input
              type="file"
              id="camera-input"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Hidden input for gallery/file picker */}
            <input
              type="file"
              id="gallery-input"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Upload Images
            </h3>
            <p className="text-gray-600 mb-6">
              Take a photo or choose from gallery
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <label
                htmlFor="camera-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold cursor-pointer shadow-lg shadow-blue-200"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </label>

              <label
                htmlFor="gallery-input"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold cursor-pointer shadow-lg"
              >
                <ImageIcon className="w-5 h-5" />
                Choose Files
              </label>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              All image formats supported (JPG, PNG, HEIC, WebP, etc.)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 animate-slide-up">
              <h3 className="font-bold text-gray-900 mb-4">
                Selected ({selectedFiles.length})
              </h3>
              <div className="space-y-3 mb-6">
                {Array.from(selectedFiles).map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate flex-1">
                      {file.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-lg shadow-lg shadow-green-200"
              >
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          )}
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Uploads</h2>

          {uploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No uploads yet</p>
              <p className="text-gray-500 text-sm mt-2">Upload your first invoice above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload) => (
                <div key={upload.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-square overflow-hidden bg-gray-200">
                    <img
                      src={api.getImageUrl(upload.image_url)}
                      alt="Invoice"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(upload.uploaded_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        count={uploadCount}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load current user from localStorage
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = async (phoneNumber) => {
    try {
      const user = await api.login(phoneNumber);
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  return (
    <>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
