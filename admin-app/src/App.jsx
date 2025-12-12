import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Phone, Calendar, ChevronDown, ChevronUp, User, Image as ImageIcon, ZoomIn, ZoomOut, X, RotateCw, Maximize2, Download, Check, UserPlus, Edit2, Trash2, Search, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import api from './api';

// Storage key for admin session (still use localStorage for session)
const STORAGE_KEY_ADMIN_SESSION = 'invoice_admin_session';

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

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

// Image Preview Modal with Zoom
const ImagePreview = ({ imageUrl, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleRotate(); }}
          className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          title="Rotate"
        >
          <RotateCw className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
          title="Reset"
        >
          <Maximize2 className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          title="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-semibold text-gray-700">{(zoom * 100).toFixed(0)}%</span>
      </div>

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-full select-none"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600">
          {zoom > 1 ? 'Drag to pan • ' : ''}Scroll or use buttons to zoom • Click outside to close
        </p>
      </div>
    </div>
  );
};

// User Form Modal Component
const UserFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    org_nr: '',
    address: '',
    zip_code: '',
    company_email: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        org_nr: initialData.org_nr || '',
        address: initialData.address || '',
        zip_code: initialData.zip_code || '',
        company_email: initialData.company_email || '',
        phone_number: initialData.phone_number || ''
      });
    } else {
      // Reset form when not editing
      setFormData({
        company_name: '',
        org_nr: '',
        address: '',
        zip_code: '',
        company_email: '',
        phone_number: ''
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.org_nr.trim()) {
      newErrors.org_nr = 'Organization number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'Zip code is required';
    }

    if (!formData.company_email.trim()) {
      newErrors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      newErrors.company_email = 'Invalid email format';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be numeric or start with +';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        company_name: '',
        org_nr: '',
        address: '',
        zip_code: '',
        company_email: '',
        phone_number: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit User' : 'Register New User'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isEdit ? 'Update user information' : 'Fill in all required fields'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.company_name
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-purple-500'
                }`}
              placeholder="Vikings Corp"
            />
            {errors.company_name && (
              <p className="text-red-600 text-sm mt-1">{errors.company_name}</p>
            )}
          </div>

          {/* Organization Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Number *
            </label>
            <input
              type="text"
              value={formData.org_nr}
              onChange={(e) => handleChange('org_nr', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.org_nr
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-purple-500'
                }`}
              placeholder="123456789"
            />
            {errors.org_nr && (
              <p className="text-red-600 text-sm mt-1">{errors.org_nr}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.address
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-purple-500'
                }`}
              placeholder="123 Viking Street"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Zip Code *
            </label>
            <input
              type="text"
              value={formData.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.zip_code
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-purple-500'
                }`}
              placeholder="12345"
            />
            {errors.zip_code && (
              <p className="text-red-600 text-sm mt-1">{errors.zip_code}</p>
            )}
          </div>

          {/* Company Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Email *
            </label>
            <input
              type="email"
              value={formData.company_email}
              onChange={(e) => handleChange('company_email', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.company_email
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-200 focus:border-purple-500'
                }`}
              placeholder="contact@vikings.com"
            />
            {errors.company_email && (
              <p className="text-red-600 text-sm mt-1">{errors.company_email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number (Login ID) *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.phone_number
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-purple-500'
                  }`}
                placeholder="+62 812 3456 7890"
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This will be used as the login identifier
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Dialog Component
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete User?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{userName}</span>?
            This will also delete all their uploads. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Toast Notification Component
const SuccessToast = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6" />
        <p className="font-semibold">{message}</p>
      </div>
    </div>
  );
};

// Login Component
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin();
      setError('');
    } else {
      setError('Invalid credentials. Try admin / admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <VikingHelm className="w-16 h-16" color="#9333ea" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vikings Admin</h1>
            <p className="text-gray-600">Manage all invoice uploads</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-lg"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold text-lg shadow-lg shadow-purple-200 hover:shadow-xl"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Default: <span className="font-mono font-semibold text-gray-700">admin / admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const Dashboard = ({ onLogout }) => {
  // Existing state
  const [usersWithUploads, setUsersWithUploads] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // User management state
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('uploads');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadAllUsers();
    }
  }, [activeTab, searchQuery]);

  const loadData = async () => {
    try {
      const usersData = await api.getUsersWithUploads();
      setUsersWithUploads(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load user data. Please try again.');
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await api.getAllUsers(searchQuery);
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users. Please try again.');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await api.createUser(userData);
      setSuccessMessage('User registered successfully!');
      setShowSuccess(true);
      setShowUserForm(false);
      loadAllUsers();
    } catch (error) {
      throw error;
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await api.updateUser(editingUser._id, userData);
      setSuccessMessage('User updated successfully!');
      setShowSuccess(true);
      setShowUserForm(false);
      setEditingUser(null);
      loadAllUsers();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.deleteUser(deletingUser._id);
      setSuccessMessage('User deleted successfully!');
      setShowSuccess(true);
      setShowDeleteDialog(false);
      setDeletingUser(null);
      loadAllUsers();
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleUser = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
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

  // Selection handlers
  const toggleImageSelection = (imageUrl) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const selectAllImages = () => {
    const allImages = usersWithUploads.flatMap(user =>
      user.uploads.map(upload => api.getImageUrl(upload.image_url))
    );
    setSelectedImages(allImages);
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  // Download handlers
  const downloadSingleImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = imageUrl.split('/').pop();
      saveAs(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  const downloadSelectedImages = async () => {
    if (selectedImages.length === 0) {
      alert('No images selected');
      return;
    }

    try {
      const zip = new JSZip();
      const folder = zip.folder('invoices');

      // Download all selected images
      for (let i = 0; i < selectedImages.length; i++) {
        const imageUrl = selectedImages[i];
        const filename = imageUrl.split('/').pop();

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        folder.file(filename, blob);
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `invoices-selected-${Date.now()}.zip`);

      alert(`${selectedImages.length} images downloaded successfully`);
      clearSelection();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download images');
    }
  };

  const downloadAllImages = async () => {
    const allImages = usersWithUploads.flatMap(user =>
      user.uploads.map(upload => api.getImageUrl(upload.image_url))
    );

    if (allImages.length === 0) {
      alert('No images to download');
      return;
    }

    const confirmed = confirm(`Download all ${allImages.length} images as zip?`);
    if (!confirmed) return;

    try {
      const zip = new JSZip();
      const folder = zip.folder('all-invoices');

      // Download all images
      for (let i = 0; i < allImages.length; i++) {
        const imageUrl = allImages[i];
        const filename = imageUrl.split('/').pop();

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        folder.file(filename, blob);
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `all-invoices-${Date.now()}.zip`);

      alert(`${allImages.length} images downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download images');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Invoice Management</p>
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

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-white rounded-2xl shadow-md p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'uploads'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Upload Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            User Management
          </button>
        </div>
      </div>

      {/* User Management Panel */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-slide-up">
            {/* Header with Search and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Registered Users</h2>
              <div className="flex gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserForm(true);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add User</span>
                </button>
              </div>
            </div>

            {/* User List */}
            {allUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No users found matching your search' : 'No registered users yet'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {!searchQuery && 'Click "Add User" to register the first user'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Company</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Address</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Org Nr</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{user.company_name || '-'}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.phone_number}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{user.company_email || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-700">
                            {user.address || '-'}
                            {user.zip_code && <span className="text-gray-500 ml-2">{user.zip_code}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{user.org_nr || '-'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowUserForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingUser(user);
                                setShowDeleteDialog(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Toolbar - only show on uploads tab */}
      {activeTab === 'uploads' && usersWithUploads.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-white" />
                <div className="text-white">
                  <h3 className="font-bold text-lg">Download Manager</h3>
                  <p className="text-sm text-purple-100">
                    {selectedImages.length > 0 ? `${selectedImages.length} images selected` : 'Select images to download'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedImages.length > 0 && (
                  <>
                    <button
                      onClick={downloadSelectedImages}
                      className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download Selected ({selectedImages.length})
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
                    >
                      Clear
                    </button>
                  </>
                )}
                <button
                  onClick={selectAllImages}
                  className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900 transition-all font-semibold"
                >
                  Select All
                </button>
                <button
                  onClick={downloadAllImages}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Management Content - only show on uploads tab */}
      {activeTab === 'uploads' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Users with Uploads</h2>
            <div className="px-5 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold text-lg">
              {usersWithUploads.length} {usersWithUploads.length === 1 ? 'User' : 'Users'}
            </div>
          </div>

          {usersWithUploads.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No users have uploaded files yet</p>
              <p className="text-gray-500 text-sm mt-2">Users will appear here after uploading</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersWithUploads.map((user) => {
                const isExpanded = expandedUser === user.id;

                return (
                  <div
                    key={user.id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-all"
                  >
                    {/* User Header */}
                    <button
                      onClick={() => toggleUser(user.id)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="w-7 h-7 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {user.phone_number}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {user.uploadCount} {user.uploadCount === 1 ? 'upload' : 'uploads'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-500">Joined</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content - User's Uploads */}
                    {isExpanded && (
                      <div className="px-6 py-6 bg-gray-50 border-t-2 border-gray-200 animate-slide-up">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          All Uploads ({user.uploads.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {user.uploads.map((upload) => {
                            const imageUrl = api.getImageUrl(upload.image_url);
                            const isSelected = selectedImages.includes(imageUrl);

                            return (
                              <div
                                key={upload.id}
                                className={`group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
                              >
                                {/* Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleImageSelection(imageUrl);
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                      isSelected
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/80 text-gray-600 hover:bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-5 h-5" />}
                                  </button>
                                </div>

                                {/* Download Button */}
                                <div className="absolute top-2 right-2 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadSingleImage(imageUrl);
                                    }}
                                    className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-all"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>

                                <div
                                  className="aspect-square overflow-hidden bg-gray-200 cursor-pointer"
                                  onClick={() => setPreviewImage(imageUrl)}
                                >
                                  <img
                                    src={imageUrl}
                                    alt="Invoice"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(upload.uploaded_at)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      )}

      {/* Modals */}
      <UserFormModal
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleEditUser : handleCreateUser}
        initialData={editingUser}
        isEdit={!!editingUser}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingUser(null);
        }}
        onConfirm={handleDeleteUser}
        userName={deletingUser?.company_name || deletingUser?.phone_number || ''}
      />

      <SuccessToast
        message={successMessage}
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      <ImagePreview
        imageUrl={previewImage}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const session = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (session === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
