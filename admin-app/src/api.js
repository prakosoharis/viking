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

  // Helper to get full image URL
  getImageUrl(imagePath) {
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  }
}

export default new ApiService();
