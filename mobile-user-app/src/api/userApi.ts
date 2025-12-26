import axios, { AxiosInstance } from 'axios';
import * as FileSystem from 'expo-file-system';
import { User, Upload } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3202/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 120000, // 2 minutes for large uploads
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new Error(error.response.data.error || `Request failed: ${error.response.status}`);
        } else if (error.request) {
          throw new Error('No response from server - check your connection');
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  async login(phoneNumber: string): Promise<User> {
    const response = await this.client.post<User>('/users/login', {
      phone_number: phoneNumber,
    });
    return response.data;
  }

  async uploadImages(
    userId: string,
    files: Array<{ uri: string; name: string; type: string; size?: number }>,
    useBase64: boolean
  ): Promise<{ success: boolean; count: number; uploads: Upload[]; session_number: number }> {

    if (useBase64) {
      // Base64 method for camera files (iOS workaround)
      const filesData = await Promise.all(
        files.map(async (file) => {
          const base64 = await this.fileToBase64(file.uri, file.name);
          return {
            name: file.name,
            type: file.type,
            data: base64,
          };
        })
      );

      const response = await this.client.post('/uploads-base64', {
        user_id: userId,
        files: filesData,
      });
      return response.data;
    } else {
      // FormData method for gallery files
      const formData = new FormData();
      formData.append('user_id', userId);

      for (const file of files) {
        formData.append('images', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }

      const response = await this.client.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    const response = await this.client.get<Upload[]>(`/uploads/user/${userId}`);
    return response.data;
  }

  private async fileToBase64(uri: string, filename: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine mime type
      const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeTypes: { [key: string]: string } = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        heif: 'image/heif',
        pdf: 'application/pdf',
      };

      const mimeType = mimeTypes[extension] || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      throw new Error('Failed to convert file');
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const baseUrl = API_BASE_URL.replace(/\/api$/, '/assets');

    // Handle malformed URLs
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

export const userApi = new ApiClient();
