const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'invoice_admin_token';

class ApiService {
  // ---------- Auth ----------
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  }

  // Every admin call goes through here so the token is always attached
  // and an expired session logs the admin out instead of showing empty data.
  async request(path, options = {}) {
    const token = this.getToken();
    const headers = { ...(options.headers || {}) };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    if (response.status === 401) {
      this.clearToken();
      window.dispatchEvent(new Event('admin-unauthorized'));
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  async requestJson(path, options = {}, errorMessage = 'Request failed') {
    const response = await this.request(path, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || errorMessage);
    }

    return data;
  }

  jsonBody(body) {
    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };
  }

  // ---------- Admin endpoints ----------
  async getUsersWithUploads() {
    return this.requestJson('/admin/users-with-uploads', {}, 'Failed to fetch users');
  }

  // ---------- User management ----------
  async getAllUsers(searchQuery = '') {
    const path = searchQuery
      ? `/admin/users?search=${encodeURIComponent(searchQuery)}`
      : '/admin/users';

    return this.requestJson(path, {}, 'Failed to fetch users');
  }

  async createUser(userData) {
    return this.requestJson(
      '/admin/users',
      { method: 'POST', ...this.jsonBody(userData) },
      'Failed to create user'
    );
  }

  async updateUser(userId, userData) {
    return this.requestJson(
      `/admin/users/${userId}`,
      { method: 'PUT', ...this.jsonBody(userData) },
      'Failed to update user'
    );
  }

  async deleteUser(userId) {
    return this.requestJson(
      `/admin/users/${userId}`,
      { method: 'DELETE' },
      'Failed to delete user'
    );
  }

  // ---------- Uploads ----------
  async deleteSession(userId, sessionNumber) {
    return this.requestJson(
      `/uploads/session/${userId}/${sessionNumber}`,
      { method: 'DELETE' },
      'Failed to delete session'
    );
  }

  async deleteUpload(uploadId) {
    return this.requestJson(
      `/uploads/${uploadId}`,
      { method: 'DELETE' },
      'Failed to delete upload'
    );
  }

  // ---------- Client advertisements ----------
  async getClientAdvertisements() {
    return this.requestJson('/admin/client-advertisements', {}, 'Failed to fetch advertisements');
  }

  async uploadClientAdvertisements(advertisements) {
    const formData = new FormData();

    // Backend expects the files under "logos" plus an "advertisements"
    // JSON array holding each file's name and url, in the same order.
    const metadata = advertisements.map((ad) => ({
      name: ad.name || null,
      url: ad.url || null,
    }));

    advertisements.forEach((ad) => formData.append('logos', ad.file));
    formData.append('advertisements', JSON.stringify(metadata));

    return this.requestJson(
      '/admin/client-advertisements',
      { method: 'POST', body: formData },
      'Failed to upload advertisements'
    );
  }

  async deleteClientAdvertisement(adId) {
    return this.requestJson(
      `/admin/client-advertisements/${adId}`,
      { method: 'DELETE' },
      'Failed to delete advertisement'
    );
  }

  // Helper to get full image URL
  getImageUrl(imagePath) {
    if (!imagePath) return '';

    // If already a proper full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Get base URL and replace /api with /assets
    // Example: https://api.clickz.co.no/api -> https://api.clickz.co.no/assets
    const baseUrl = API_BASE_URL.replace(/\/api$/, '/assets');

    // Extract clean path from malformed URLs
    let cleanPath = imagePath;

    if (cleanPath.includes('/assets/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/assets/'));
      cleanPath = cleanPath.replace('/assets/', '/');
    } else if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    return `${baseUrl}${cleanPath}`;
  }
}

export default new ApiService();
