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
