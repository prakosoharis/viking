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
    try {
      console.log('API uploadImages called with:', { userId, fileCount: files.length });

      const formData = new FormData();
      formData.append('user_id', userId);

      // Convert files to proper format for FormData (iOS camera compatibility)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // If file has no type (iOS camera issue), try to detect from extension
        let fileType = file.type;
        if (!fileType || fileType === '') {
          const ext = file.name.split('.').pop().toLowerCase();
          const typeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'heic': 'image/heic',
            'heif': 'image/heif',
            'webp': 'image/webp'
          };
          fileType = typeMap[ext] || 'image/jpeg';
          console.log(`Empty type detected, using: ${fileType}`);
        }

        // Create a new Blob with proper type (iOS camera fix)
        const blob = new Blob([file], { type: fileType });

        // Append as File with proper filename
        formData.append('images', blob, file.name);

        console.log(`Added file ${i} to FormData as Blob with type: ${fileType}`);
      }

      console.log('FormData prepared, sending request to:', `${API_BASE_URL}/uploads`);

      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Upload failed response:', errorData);
        throw new Error(errorData?.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
    } catch (error) {
      console.error('uploadImages error:', error);
      throw error;
    }
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
