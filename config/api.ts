// API Configuration for the mobile app
// Update these values based on your deployment

/**
 * API Endpoints Configuration
 *
 * Development:
 * - Use ngrok or your local IP address
 * - Example: http://192.168.1.100:3000 (your computer's local IP)
 * - Or use ngrok: https://your-ngrok-url.ngrok.io
 *
 * Production:
 * - Use your deployed Next.js app URL
 * - Example: https://your-app.vercel.app
 */

export const API_CONFIG = {
  // Change this to your API URL
  BASE_URL: __DEV__
    ? "http://localhost:3000" // Development (update with your local IP or ngrok URL)
    : "https://your-production-url.com", // Production

  ENDPOINTS: {
    CHAT: "/api/chat",
    // Add more endpoints as needed
  },

  // Timeout in milliseconds
  TIMEOUT: 30000,
};

/**
 * Get full API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Example usage:
 *
 * import { getApiUrl, API_CONFIG } from '../config/api';
 *
 * const chatUrl = getApiUrl(API_CONFIG.ENDPOINTS.CHAT);
 * const response = await fetch(chatUrl, { ... });
 */
