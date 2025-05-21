import { handleTokenExpiration } from './auth-utils';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.message === "Token expired") {
      handleTokenExpiration();
    }
  }
  
  return response;
};
