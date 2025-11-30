const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  // User endpoints
  async login(phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: phoneNumber }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  // Upload endpoints
  async uploadImages(userId, files) {
    const formData = new FormData();
    formData.append('user_id', userId);

    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async getUserUploads(userId) {
    const response = await fetch(`${API_BASE_URL}/uploads/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch uploads');
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
