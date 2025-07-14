export const handleTokenExpiration = () => {
  localStorage.removeItem('authToken');
  // Store the current URL so you can redirect back after login
  localStorage.setItem('redirectAfterLogin', window.location.pathname);
  // Redirect to login page
  window.location.href = '/login';
};
