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
    if (!imagePath) return '';

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Clean base URL (remove /api suffix if exists)
    let baseUrl = API_BASE_URL.replace('/api', '');

    // Ensure base URL has protocol
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `http://${baseUrl}`;
    }

    // Clean image path - remove leading dots or domain fragments
    let cleanPath = imagePath;

    // Remove malformed domain fragments (e.g., ".deluwang.online/api/assets/...")
    if (cleanPath.includes('/assets/')) {
      cleanPath = cleanPath.substring(cleanPath.indexOf('/assets/'));
    }

    // Ensure path starts with /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    return `${baseUrl}${cleanPath}`;
  }
}

export default new ApiService();
