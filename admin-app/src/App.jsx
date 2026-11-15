import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Phone, Calendar, ChevronDown, ChevronUp, User, Image as ImageIcon, ZoomIn, ZoomOut, X, RotateCw, Maximize2, Download, Check, UserPlus, Edit2, Trash2, Search, Mail, AlertCircle, CheckCircle, Send, Clock, Upload, Plus } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import api from './api';

// Credentials live in the backend .env; the token it issues is the session.

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

// Delete Session Confirmation Dialog Component
const DeleteSessionDialog = ({ isOpen, onClose, onConfirm, sessionNumber, uploadCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Session?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">Session #{sessionNumber}</span>?
            This will delete <span className="font-semibold">{uploadCount} file(s)</span> in this session. This action cannot be undone.
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

// Delete Image Confirmation Dialog Component
const DeleteImageDialog = ({ isOpen, onClose, onConfirm, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Image?</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this image?
            This action cannot be undone.
          </p>
          {/* Image Preview */}
          {imageUrl && (
            <div className="mb-6 flex justify-center">
              <img
                src={imageUrl}
                alt="To be deleted"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
          )}
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.login(username, password);
      onLogin();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <img src="/logo.png" alt="CLICKZ Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CLICKZ Admin</h1>
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
              disabled={isSubmitting}
              className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold text-lg shadow-lg shadow-purple-200 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
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
  const [expandedSession, setExpandedSession] = useState({});
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

  // Upload deletion state
  const [showDeleteSessionDialog, setShowDeleteSessionDialog] = useState(false);
  const [deletingSession, setDeletingSession] = useState(null);
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);

  // Client Advertisement state
  const [clientAdvertisements, setClientAdvertisements] = useState([]);
  const [selectedAdvertisements, setSelectedAdvertisements] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmAd, setDeleteConfirmAd] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadAllUsers();
    } else if (activeTab === 'ads') {
      loadClientAdvertisements();
    }
  }, [activeTab, searchQuery]);

  let scrollTimeout;
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      loadData();
    }, 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

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

  const loadClientAdvertisements = async () => {
    try {
      const ads = await api.getClientAdvertisements();
      setClientAdvertisements(ads);
    } catch (error) {
      console.error('Failed to load client advertisements:', error);
      alert('Failed to load advertisements. Please try again.');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Initialize advertisements with default values
    const newAdvertisements = files.map(file => ({
      file,
      name: '',
      url: ''
    }));

    setSelectedAdvertisements(prev => [...prev, ...newAdvertisements]);
  };

  const handleRemoveAdvertisement = (index) => {
    setSelectedAdvertisements(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdvertisementChange = (index, field, value) => {
    setSelectedAdvertisements(prev => prev.map((ad, i) =>
      i === index ? { ...ad, [field]: value } : ad
    ));
  };

  const handleUploadAds = async () => {
    if (selectedAdvertisements.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadClientAdvertisements(selectedAdvertisements);
      setSuccessMessage(`${selectedAdvertisements.length} advertisement(s) uploaded successfully!`);
      setShowSuccess(true);
      setSelectedAdvertisements([]);
      loadClientAdvertisements();
    } catch (error) {
      alert(error.message || 'Failed to upload advertisements');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteConfirmAd) return;

    try {
      await api.deleteClientAdvertisement(deleteConfirmAd._id);
      setSuccessMessage('Advertisement deleted successfully!');
      setShowSuccess(true);
      setDeleteConfirmAd(null);
      loadClientAdvertisements();
    } catch (error) {
      alert(error.message || 'Failed to delete advertisement');
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

  const handleDeleteSession = async () => {
    try {
      await api.deleteSession(deletingSession.userId, deletingSession.sessionNumber);
      setSuccessMessage(`Session ${deletingSession.sessionNumber} deleted successfully!`);
      setShowSuccess(true);
      setShowDeleteSessionDialog(false);
      setDeletingSession(null);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await api.deleteUpload(deletingImage.uploadId);
      setSuccessMessage('Image deleted successfully!');
      setShowSuccess(true);
      setShowDeleteImageDialog(false);
      setDeletingImage(null);
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

  // Session grouping functions
  const groupUploadsBySession = (uploads) => {
    const sessions = {};
    uploads.forEach(upload => {
      const sessionNum = upload.session_number || 1;
      if (!sessions[sessionNum]) {
        sessions[sessionNum] = [];
      }
      sessions[sessionNum].push(upload);
    });

    return Object.entries(sessions)
      .map(([sessionNum, uploads]) => ({
        sessionNumber: parseInt(sessionNum),
        uploads: uploads.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)),
        uploadedAt: uploads[0].uploaded_at
      }))
      .sort((a, b) => b.sessionNumber - a.sessionNumber);
  };

  const toggleSession = (userId, sessionNumber) => {
    const key = `${userId}-${sessionNumber}`;
    setExpandedSession(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSessionExpanded = (userId, sessionNumber) => {
    const key = `${userId}-${sessionNumber}`;
    return expandedSession[key] || false;
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

  const downloadSession = async (sessionUploads, sessionNumber, userName) => {
    if (sessionUploads.length === 0) {
      alert('No images in this session');
      return;
    }

    try {
      const zip = new JSZip();
      const folderName = `session-${sessionNumber}`;
      const folder = zip.folder(folderName);

      // Download all images in the session
      for (let i = 0; i < sessionUploads.length; i++) {
        const upload = sessionUploads[i];
        const imageUrl = api.getImageUrl(upload.image_url);
        const filename = imageUrl.split('/').pop();

        const response = await fetch(imageUrl);
        const blob = await response.blob();
        folder.file(filename, blob);
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${userName || 'user'}-session-${sessionNumber}-${Date.now()}.zip`;
      saveAs(zipBlob, zipFileName);

      alert(`Session ${sessionNumber} (${sessionUploads.length} images) downloaded successfully`);
    } catch (error) {
      console.error('Download session failed:', error);
      alert('Failed to download session');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="CLICKZ Logo" className="w-full h-full object-contain" />
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
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${activeTab === 'ads'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Client Advertisement
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

      {/* Client Advertisement Panel */}
      {activeTab === 'ads' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-slide-up">
            {/* Header with Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Client Advertisements</h2>
                <p className="text-gray-600 mt-1">
                  {clientAdvertisements.length} {clientAdvertisements.length === 1 ? 'advertisement' : 'advertisements'}
                </p>
              </div>
              <div className="flex gap-3">
                <label className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Select Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedAdvertisements.length > 0 && (
                  <button
                    onClick={handleUploadAds}
                    disabled={isUploading}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    {isUploading ? 'Uploading...' : `Upload ${selectedAdvertisements.length} Image${selectedAdvertisements.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>

            {/* Selected Advertisements with Form */}
            {selectedAdvertisements.length > 0 && (
              <div className="mb-6 p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <p className="font-semibold text-purple-900 mb-4">
                  {selectedAdvertisements.length} file{selectedAdvertisements.length > 1 ? 's' : ''} selected - Please fill in details:
                </p>
                <div className="space-y-4">
                  {selectedAdvertisements.map((ad, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-purple-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* File Name */}
                          <div className="sm:col-span-2">
                            <p className="text-sm font-semibold text-gray-700 truncate">{ad.file.name}</p>
                          </div>

                          {/* Name Input */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Advertisement Name
                            </label>
                            <input
                              type="text"
                              value={ad.name}
                              onChange={(e) => handleAdvertisementChange(idx, 'name', e.target.value)}
                              placeholder="e.g., Apple"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>

                          {/* URL Input */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Advertisement URL
                            </label>
                            <input
                              type="text"
                              value={ad.url}
                              onChange={(e) => handleAdvertisementChange(idx, 'url', e.target.value)}
                              placeholder="e.g., www.apple.com"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveAdvertisement(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advertisements Grid */}
            {clientAdvertisements.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No advertisements yet</p>
                <p className="text-gray-500 text-sm mt-2">Click "Select Images" to upload client logos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {clientAdvertisements.map((ad) => (
                  <div
                    key={ad._id}
                    className="group relative bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    {/* Preview & Delete Button */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <button
                        onClick={() => setPreviewImage(api.getImageUrl(ad.image_url))}
                        className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-all"
                        title="Preview"
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmAd(ad)}
                        className="w-8 h-8 bg-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Image - Clickable if URL exists */}
                    {ad.url ? (
                      <a
                        href={ad.url.startsWith('http') ? ad.url : `https://${ad.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square overflow-hidden bg-gray-200 block"
                      >
                        <img
                          src={api.getImageUrl(ad.image_url)}
                          alt={ad.name || 'Advertisement'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </a>
                    ) : (
                      <div className="aspect-square overflow-hidden bg-gray-200">
                        <img
                          src={api.getImageUrl(ad.image_url)}
                          alt={ad.name || 'Advertisement'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Name, URL, and Upload Date */}
                    <div className="p-3">
                      {/* Name */}
                      {ad.name && (
                        <p className="font-semibold text-sm text-gray-900 mb-1 truncate">
                          {ad.name}
                        </p>
                      )}
                      {/* URL */}
                      {ad.url && (
                        <p className="text-xs text-blue-600 mb-1 truncate" title={ad.url}>
                          {ad.url}
                        </p>
                      )}
                      {/* Upload Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(ad.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
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
                const isExpanded = expandedUser === user._id;

                return (
                  <div
                    key={user._id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-all"
                  >
                    {/* User Header */}
                    <button
                      onClick={() => toggleUser(user._id)}
                      className="w-full px-6 py-5 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {user.company_name ? (
                              <User className="w-7 h-7 text-purple-600" />
                            ) : (
                              <Phone className="w-7 h-7 text-purple-600" />
                            )}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            {/* Company Name or Phone as primary */}
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {user.company_name || user.phone_number}
                            </h3>

                            {/* User Details Grid */}
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                              {/* Phone */}
                              {user.company_name && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{user.phone_number}</span>
                                </div>
                              )}

                              {/* Email */}
                              {user.company_email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">{user.company_email}</span>
                                </div>
                              )}

                              {/* Org Nr */}
                              {user.org_nr && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-semibold">Org Nr:</span>
                                  <span className="truncate">{user.org_nr}</span>
                                </div>
                              )}

                              {/* Upload Count */}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{user.uploadCount} {user.uploadCount === 1 ? 'upload' : 'uploads'}</span>
                              </div>
                            </div>

                            {/* Address */}
                            {user.address && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span className="truncate">
                                  {user.address}
                                  {user.zip_code && `, ${user.zip_code}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right hidden lg:block">
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content - User's Upload Sessions */}
                    {isExpanded && (
                      <div className="px-6 py-6 bg-gray-50 border-t-2 border-gray-200 animate-slide-up">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          All Uploads ({user.uploads.length})
                        </h4>

                        {/* Session Accordion */}
                        <div className="space-y-3">
                          {groupUploadsBySession(user.uploads).map((session) => {
                            const sessionExpanded = isSessionExpanded(user._id, session.sessionNumber);

                            return (
                              <div key={session.sessionNumber} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                {/* Session Header */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                                  <button
                                    onClick={() => toggleSession(user._id, session.sessionNumber)}
                                    className="flex items-center gap-3 flex-1"
                                  >
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                                      {session.sessionNumber}
                                    </div>
                                    <div className="text-left">
                                      <h5 className="font-bold text-gray-900">
                                        Upload Session {session.sessionNumber}
                                      </h5>
                                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                                        <span className="flex items-center gap-1">
                                          <ImageIcon className="w-3 h-3" />
                                          {session.uploads.length} {session.uploads.length === 1 ? 'file' : 'files'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(session.uploadedAt)}
                                        </span>

                                        {/* Email Status Badge */}
                                        {session.uploads[0].email_status === 'sent' && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold">
                                            <Send className="w-2.5 h-2.5" />
                                            Email Sent
                                          </span>
                                        )}
                                        {session.uploads[0].email_status === 'failed' && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-semibold">
                                            <AlertCircle className="w-2.5 h-2.5" />
                                            Failed
                                          </span>
                                        )}
                                        {session.uploads[0].email_status === 'pending' && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-semibold">
                                            <Clock className="w-2.5 h-2.5" />
                                            Sending
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronDown
                                      className={`w-5 h-5 text-gray-600 transition-transform ml-auto ${
                                        sessionExpanded ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>

                                  {/* Download Session Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadSession(session.uploads, session.sessionNumber, user.company_name || user.phone_number);
                                    }}
                                    className="ml-3 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-semibold"
                                    title="Download Session"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>

                                  {/* Delete Session Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingSession({ userId: user._id, sessionNumber: session.sessionNumber, uploadCount: session.uploads.length });
                                      setShowDeleteSessionDialog(true);
                                    }}
                                    className="ml-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-semibold"
                                    title="Delete Session"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>

                                {/* Session Content */}
                                {sessionExpanded && (
                                  <div className="p-4 bg-white">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                      {session.uploads.map((upload) => {
                                        const imageUrl = api.getImageUrl(upload.image_url);
                                        const isSelected = selectedImages.includes(imageUrl);

                                        return (
                                          <div
                                            key={upload._id}
                                            className={`group relative bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
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
                                            <div className="absolute top-2 right-2 z-10 flex gap-1">
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
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setDeletingImage({ uploadId: upload._id, imageUrl });
                                                  setShowDeleteImageDialog(true);
                                                }}
                                                className="w-8 h-8 bg-red-100/80 rounded-lg flex items-center justify-center hover:bg-red-200 transition-all"
                                                title="Delete"
                                              >
                                                <Trash2 className="w-4 h-4 text-red-600" />
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

      {/* Delete Session Confirmation Dialog */}
      <DeleteSessionDialog
        isOpen={showDeleteSessionDialog}
        onClose={() => {
          setShowDeleteSessionDialog(false);
          setDeletingSession(null);
        }}
        onConfirm={handleDeleteSession}
        sessionNumber={deletingSession?.sessionNumber}
        uploadCount={deletingSession?.uploadCount}
      />

      {/* Delete Image Confirmation Dialog */}
      <DeleteImageDialog
        isOpen={showDeleteImageDialog}
        onClose={() => {
          setShowDeleteImageDialog(false);
          setDeletingImage(null);
        }}
        onConfirm={handleDeleteImage}
        imageUrl={deletingImage?.imageUrl}
      />

      {/* Delete Advertisement Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmAd}
        onClose={() => setDeleteConfirmAd(null)}
        onConfirm={handleDeleteAd}
        userName="this advertisement"
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
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(api.getToken()));

  useEffect(() => {
    // The backend rejected our token (expired or revoked) - back to login
    const handleUnauthorized = () => setIsLoggedIn(false);

    window.addEventListener('admin-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin-unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    api.clearToken();
    setIsLoggedIn(false);
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
