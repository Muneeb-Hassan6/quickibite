/**
 * apiHelper.js - Authenticated API Fetch Utility
 * Use this instead of plain fetch() for all protected API calls.
 * It automatically attaches the JWT token from sessionStorage.
 */

const API_BASE = import.meta.env.VITE_API_BASE || `${import.meta.env.VITE_API_BASE}`;

/**
 * Get the stored JWT token
 */
const getToken = () => {
  return sessionStorage.getItem("auth_token") || null;
};

/**
 * Authenticated fetch - automatically adds Authorization header
 * @param {string} endpoint - e.g. "add_menu.php"
 * @param {object} options  - fetch options (method, body, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

/**
 * Public fetch - no token attached (for customer-facing APIs)
 * @param {string} endpoint - e.g. "get_menu.php"
 * @param {object} options  - fetch options
 */
export const publicFetch = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}/${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
