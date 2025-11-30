import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Phone, Calendar, ChevronDown, ChevronUp, User, Image as ImageIcon } from 'lucide-react';
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
  const [usersWithUploads, setUsersWithUploads] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    loadData();
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
                          {user.uploads.map((upload) => (
                            <div
                              key={upload.id}
                              className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                            >
                              <div className="aspect-square overflow-hidden bg-gray-200">
                                <img
                                  src={api.getImageUrl(upload.image_url)}
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
                          ))}
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
