import Cookies from 'js-cookie';

// Constants for token storage
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token expiry time constants
const TOKEN_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Authentication Service for JWT token management
 */
class AuthService {
  /**
   * Set tokens in cookies with secure settings
   */
  setTokens(accessToken: string, refreshToken: string) {
    // Store tokens in cookies (more secure than localStorage)
    const secure = process.env.NODE_ENV === 'production';
    const sameSite = 'strict';

    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1 / 96, // 15 minutes in days
      secure,
      sameSite,
    });

    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 7, // 7 days
      secure,
      sameSite,
    });
  }

  /**
   * Get the access token from cookies
   */
  getAccessToken(): string | null {
    return Cookies.get(ACCESS_TOKEN_KEY) || null;
  }

  /**
   * Get the refresh token from cookies
   */
  getRefreshToken(): string | null {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Clear all authentication tokens
   */
  clearTokens() {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Parse JWT token to get payload - works in both browser and Node.js
   */
  parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Universal base64 decoding that works in both browser and Node.js
      let jsonPayload;

      if (typeof window !== 'undefined') {
        // Browser environment
        jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join(''),
        );
      } else {
        // Server environment (Node.js)
        const buff = Buffer.from(base64, 'base64');
        jsonPayload = buff.toString('utf-8');
      }

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseToken(token);
      if (!payload || !payload.exp) return true;

      // Get expiration time and convert to milliseconds
      const expiryTime = payload.exp * 1000;
      // Add a small buffer (30 seconds) to account for network latency
      return Date.now() >= expiryTime - 30000;
    } catch (e) {
      console.error('Error checking token expiry:', e);
      return true;
    }
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;
