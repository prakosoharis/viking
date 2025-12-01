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

  // Helper to convert File to Base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload endpoints with iOS Safari workaround
  async uploadImages(userId, files, onProgress) {
    const log = (msg) => {
      console.log(msg);
      if (onProgress) onProgress(msg);
    };

    try {
      log(`📦 Preparing upload data...`);

      // Try FormData first (works for gallery files)
      const tryFormData = async () => {
        const formData = new FormData();
        formData.append('user_id', userId);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          log(`➕ Adding file ${i}: ${file.name} (${(file.size/1024).toFixed(1)}KB)`);
          formData.append('images', file, file.name);
        }

        const apiUrl = `${API_BASE_URL}/uploads`;
        log(`🌐 Sending FormData to: ${apiUrl}`);
        log(`📨 Making fetch request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        return response;
      };

      // Fallback: Base64 method (for iOS camera)
      const tryBase64 = async () => {
        log(`🔄 FormData failed, trying Base64 method (iOS workaround)...`);

        const filesData = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          log(`🔄 Converting file ${i} to Base64...`);

          const base64 = await this.fileToBase64(file);
          filesData.push({
            name: file.name,
            type: file.type || 'image/jpeg',
            data: base64
          });
          log(`✅ File ${i} converted`);
        }

        const apiUrl = `${API_BASE_URL}/uploads-base64`;
        log(`🌐 Sending Base64 to: ${apiUrl}`);
        log(`📨 Making fetch request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            files: filesData
          }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        return response;
      };

      // Try FormData first
      let response;
      try {
        response = await tryFormData();
      } catch (error) {
        log(`⚠️ FormData failed: ${error.message}`);
        // Fallback to Base64
        response = await tryBase64();
      }

      log(`📬 Response received: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        log(`❌ Response not OK`);
        let errorData;
        try {
          errorData = await response.json();
          log(`Error data: ${JSON.stringify(errorData)}`);
        } catch (e) {
          errorData = { error: response.statusText };
          log(`Failed to parse error JSON`);
        }
        throw new Error(errorData?.error || `Upload failed: ${response.statusText}`);
      }

      log(`✅ Parsing success response...`);
      const result = await response.json();
      log(`✅ Upload complete: ${result.count} files`);
      return result;
    } catch (error) {
      log(`💥 Exception caught: ${error.name} - ${error.message}`);

      // Better error messages
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - file too large or slow connection');
      } else if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
        throw new Error('Network error - iOS Safari camera bug, trying workaround...');
      }

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
