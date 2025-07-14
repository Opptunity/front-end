import axios from 'axios';
import { handleTokenExpiration } from './auth-utils';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL
});

// Add a response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401 && 
        error.response.data?.message === "Token expired") {
      handleTokenExpiration();
    }
    return Promise.reject(error);
  }
);

// Function to get absolute URL for API calls that work in both client and server environments
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    // Server-side - get host from environment variables
    const host = process.env.NEXT_PUBLIC_APP_URL || 
                process.env.VERCEL_URL || 
                'http://localhost:3000';
    
    // Make sure host doesn't end with slash before combining
    const normalizedHost = host.endsWith('/') ? host.slice(0, -1) : host;
    
    // Add protocol if needed
    const hostWithProtocol = normalizedHost.startsWith('http') 
      ? normalizedHost 
      : `https://${normalizedHost}`;
    
    return `${hostWithProtocol}${normalizedPath}`;
  }
  
  // Client-side - can use relative URL
  return normalizedPath;
}

// Original code below
let apiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

// Function to create API client
export function createApiClient(options = {}) {
  return {
    baseURL: apiBaseUrl,
    ...options
  }
}

export default apiClient;
