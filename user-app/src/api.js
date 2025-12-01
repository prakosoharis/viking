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

  // Upload endpoints (files are already processed as arrayBuffer + metadata)
  async uploadImages(userId, files, onProgress) {
    const log = (msg) => {
      console.log(msg);
      if (onProgress) onProgress(msg);
    };

    try {
      // Check if any file is from camera
      const hasCameraFiles = files.some(f => f.fromCamera);

      if (hasCameraFiles) {
        // Use Base64 method for camera files (iOS Safari workaround)
        log(`📦 Converting files to Base64 (iOS camera mode)...`);

        const filesData = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          log(`🔄 Converting file ${i}: ${file.name}...`);

          const base64 = this.arrayBufferToBase64(file.arrayBuffer, file.type);
          filesData.push({
            name: file.name,
            type: file.type,
            data: base64
          });

          log(`✅ File ${i} converted to Base64`);
        }

        const apiUrl = `${API_BASE_URL}/uploads-base64`;
        log(`🌐 Sending Base64 data to: ${apiUrl}`);
        log(`📨 Making JSON request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          log(`⏱️ Timeout after 60s`);
          controller.abort();
        }, 60000);

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

        log(`📬 Response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          log(`❌ Response not OK`);
          let errorData;
          try {
            errorData = await response.json();
            log(`Error: ${JSON.stringify(errorData)}`);
          } catch (e) {
            errorData = { error: response.statusText };
          }
          throw new Error(errorData?.error || `Upload failed: ${response.statusText}`);
        }

        log(`✅ Parsing response...`);
        const result = await response.json();
        log(`✅ Success: ${result.count} files uploaded`);
        return result;

      } else {
        // Use FormData for gallery files (faster)
        log(`📦 Preparing FormData (gallery mode)...`);
        const formData = new FormData();
        formData.append('user_id', userId);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          log(`➕ Adding file ${i}: ${file.name} (${(file.size/1024).toFixed(1)}KB)`);

          // Create File from ArrayBuffer
          const fileBlob = new File([file.arrayBuffer], file.name, { type: file.type });
          formData.append('images', fileBlob, file.name);
        }

        const apiUrl = `${API_BASE_URL}/uploads`;
        log(`🌐 Sending FormData to: ${apiUrl}`);
        log(`📨 Making FormData request...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          log(`⏱️ Timeout after 60s`);
          controller.abort();
        }, 60000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        log(`📬 Response: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          log(`❌ Response not OK`);
          let errorData;
          try {
            errorData = await response.json();
            log(`Error: ${JSON.stringify(errorData)}`);
          } catch (e) {
            errorData = { error: response.statusText };
          }
          throw new Error(errorData?.error || `Upload failed: ${response.statusText}`);
        }

        log(`✅ Parsing response...`);
        const result = await response.json();
        log(`✅ Success: ${result.count} files uploaded`);
        return result;
      }
    } catch (error) {
      log(`💥 Error: ${error.name} - ${error.message}`);

      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - file too large or slow connection');
      } else if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
        throw new Error('Network error - please try again');
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
