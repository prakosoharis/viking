const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  // Admin endpoints
  async getUsersWithUploads() {
    const response = await fetch(`${API_BASE_URL}/admin/users-with-uploads`);

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  // User management endpoints
  async getAllUsers(searchQuery = '') {
    const url = searchQuery
      ? `${API_BASE_URL}/admin/users?search=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/admin/users`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create user');
    }

    return data;
  }

  async updateUser(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update user');
    }

    return data;
  }

  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }

    return data;
  }

  // Client Advertisement endpoints
  async getClientAdvertisements() {
    const response = await fetch(`${API_BASE_URL}/admin/client-advertisements`);

    if (!response.ok) {
      throw new Error('Failed to fetch client advertisements');
    }

    return response.json();
  }

  async uploadClientAdvertisements(advertisements) {
    const formData = new FormData();

    // Add advertisements metadata as JSON string
    formData.append('advertisements', JSON.stringify(
      advertisements.map(ad => ({
        name: ad.name || null,
        url: ad.url || null
      }))
    ));

    // Add files
    advertisements.forEach(ad => {
      formData.append('logos', ad.file);
    });

    const response = await fetch(`${API_BASE_URL}/admin/client-advertisements`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload advertisements');
    }

    return data;
  }

  async deleteClientAdvertisement(adId) {
    const response = await fetch(`${API_BASE_URL}/admin/client-advertisements/${adId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete advertisement');
    }

    return data;
  }

  // Helper to get full image URL
  getImageUrl(imagePath) {
    if (!imagePath) return '';

    // If already a proper full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Get base URL and replace /api with /assets
    // Example: https://api.deluwang.online/api -> https://api.deluwang.online/assets
    const baseUrl = API_BASE_URL.replace(/\/api$/, '/assets');

    // Extract clean path from malformed URLs
    let cleanPath = imagePath;

    // Handle malformed URLs like ".deluwang.online/api/assets/xxx.jpg" or "https/.deluwang.online/api/assets/xxx.jpg"
    if (cleanPath.includes('/assets/')) {
      // Extract only /assets/filename part
      cleanPath = cleanPath.substring(cleanPath.indexOf('/assets/'));
      // Remove /assets/ prefix since baseUrl already has it
      cleanPath = cleanPath.replace('/assets/', '/');
    } else if (!cleanPath.startsWith('/')) {
      // If no /assets/ found and doesn't start with /, assume it's just filename
      cleanPath = '/' + cleanPath;
    }

    return `${baseUrl}${cleanPath}`;
  }
}

export default new ApiService();
