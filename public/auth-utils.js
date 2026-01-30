// public/auth-utils.js
// Utility functions for authentication

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

/**
 * Get current logged-in user
 * @returns {object|null}
 */
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Get auth token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('token');
}

/**
 * Logout user - clear localStorage and redirect
 * @param {string} redirectTo - URL to redirect after logout (default: /login.html)
 */
export function logout(redirectTo = '/login.html') {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = redirectTo;
}

/**
 * Make authenticated API fetch request with JWT token
 * @param {string} url - API endpoint
 * @param {object} options - fetch options
 * @returns {Promise}
 */
export async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers });
}

/**
 * Check if user has specific role
 * @param {string|array} requiredRole - Role or array of roles
 * @returns {boolean}
 */
export function hasRole(requiredRole) {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Redirect to login if not logged in
 * @param {string} redirectTo - URL to redirect after login
 */
export function requireLogin(redirectTo = window.location.href) {
  if (!isLoggedIn()) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(redirectTo)}`;
  }
}
