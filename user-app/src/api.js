import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configure axios
axios.defaults.timeout = 120000; // 120 seconds for large uploads
axios.defaults.maxContentLength = 50 * 1024 * 1024; // 50MB
axios.defaults.maxBodyLength = 50 * 1024 * 1024; // 50MB

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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  }

  // Helper to convert File to Base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper: Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer, mimeType) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  }

  // Upload endpoints using AXIOS (more reliable than fetch for iOS)
  async uploadImages(userId, files) {
    try {
      // Check if any file is from camera
      const hasCameraFiles = files.some(f => f.fromCamera);

      if (hasCameraFiles) {
        // Use Base64 method for camera files (iOS Safari workaround)
        const filesData = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const base64 = this.arrayBufferToBase64(file.arrayBuffer, file.type);
          filesData.push({
            name: file.name,
            type: file.type,
            data: base64
          });
        }

        const response = await axios.post(`${API_BASE_URL}/uploads-base64`, {
          user_id: userId,
          files: filesData
        }, {
          timeout: 120000,
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        return response.data;

      } else {
        // Use FormData for gallery files (faster)
        const formData = new FormData();
        formData.append('user_id', userId);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const blob = new Blob([file.arrayBuffer], { type: file.type });
          formData.append('images', blob, file.name);
        }

        const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
          timeout: 120000,
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        return response.data;
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.error || `Upload failed: ${error.response.status}`);
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server - check your connection');
      } else {
        // Something else
        throw new Error(`Upload error: ${error.message}`);
      }
    }
  }

  async getUserUploads(userId) {
    const response = await fetch(`${API_BASE_URL}/uploads/user/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch uploads');
    }

    return response.json();
  }

  async getClientAdvertisements() {
    const response = await fetch(`${API_BASE_URL}/client-advertisements`);

    if (!response.ok) {
      throw new Error('Failed to fetch client advertisements');
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
