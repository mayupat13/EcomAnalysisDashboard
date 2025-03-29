import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import authService from './authService';

// Types for request parameters
export interface ApiRequestParams {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  responseType?: 'json' | 'blob' | 'text';
}

// Response type
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Centralized API Service for handling all API requests
 */
class ApiService {
  private axios: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    // Determine the base URL based on the environment
    const baseURL =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL || ''
        : process.env.API_URL || 'http://localhost:3000';

    console.log('API Client baseURL:', baseURL);

    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Set up request interceptor
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequestInterceptor(config),
      (error) => Promise.reject(error),
    );

    // Set up response interceptor
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => this.handleResponseError(error),
    );
  }

  /**
   * Handle request interceptor to add auth token if needed
   */
  private async handleRequestInterceptor(
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> {
    // Skip logging for NextAuth session checks
    if (config.url && config.url.includes('/api/auth/session')) {
      return config;
    }

    console.log('Request interceptor - URL:', config.url);

    // Check if we need to add the auth token
    if (
      config.url &&
      !config.url.includes('/auth/login') &&
      !config.url.includes('/auth/refresh')
    ) {
      // Try to get token from cookies first
      const cookies = config.headers?.Cookie;
      let token = null;

      if (cookies) {
        const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
        if (accessTokenMatch) {
          token = accessTokenMatch[1];
          console.log('Found token in cookies');
        }
      }

      // If no token in cookies, try authService
      if (!token) {
        token = authService.getAccessToken();
        console.log('Getting token from authService:', token ? 'Present' : 'Missing');
      }

      if (token) {
        try {
          if (authService.isTokenExpired(token)) {
            console.log('Token expired, attempting refresh');
            // Token is expired, refresh it
            const newToken = await this.refreshToken();
            if (newToken) {
              config.headers.set('Authorization', `Bearer ${newToken}`);
              console.log('Token refreshed successfully');
            } else {
              console.log('Token refresh failed');
              // If refresh failed, handle auth failure
              this.handleAuthFailure();
            }
          } else {
            // Token is valid, include it
            config.headers.set('Authorization', `Bearer ${token}`);
            console.log('Using existing valid token');
          }
        } catch (error) {
          console.error('Error in request interceptor:', error);
          // If any error occurs during token validation, clear tokens and handle failure
          this.handleAuthFailure();
        }
      } else {
        console.log('No token available for request');
      }
    }

    // Skip detailed header logging for NextAuth session checks
    if (!config.url?.includes('/api/auth/session')) {
      console.log('Final request headers:', config.headers);
    }

    return config;
  }

  /**
   * Handle API response errors including auth failures
   */
  private async handleResponseError(error: any): Promise<never> {
    if (error.response) {
      // Special handling for 400 errors on /api/auth/session which appear to be normal
      if (error.response.status === 400 && error.config?.url?.includes('/api/auth/session')) {
        // This is a next-auth internal call that we can gracefully handle
        console.log('CLIENT_FETCH_ERROR', {
          error: {}, // Don't log the full error to avoid noise
          url: error.config.url,
        });

        // Don't treat this as a fatal error
        // Instead return a mock "no session" response to prevent crashes
        return Promise.reject({
          ...error,
          _handled: true,
          _mockSessionError: true,
        });
      }

      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
      });

      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        console.error('Authentication error: Token invalid or expired');

        // Try to refresh token on 401 errors that are not from a refresh request
        if (
          error.config?.url &&
          !error.config.url.includes('/auth/refresh') &&
          !error.config.url.includes('/auth/login')
        ) {
          try {
            console.log('Attempting to refresh token due to 401 error');
            const newToken = await this.refreshToken();
            if (newToken) {
              console.log('Token refreshed, retrying original request');
              // Retry the original request with the new token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.handleAuthFailure();
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error (No Response):', {
        request: error.request,
        url: error.config?.url,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message, {
        url: error.config?.url,
      });
    }

    // Forward the error
    return Promise.reject(error);
  }

  /**
   * Handle authentication failure by clearing tokens and redirecting to login
   */
  private handleAuthFailure(): void {
    authService.clearTokens();

    // Redirect to login page if in browser context
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<string | null> {
    // Ensure only one refresh request happens at a time
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
      console.log('No refresh token available');
      return Promise.resolve(null);
    }

    // Create the refresh token promise
    this.refreshTokenPromise = new Promise<string>(async (resolve, reject) => {
      try {
        console.log('Attempting token refresh');
        // Use a fresh axios instance for token refresh to avoid interceptors
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data?.accessToken && response.data?.refreshToken) {
          console.log('Token refresh successful');
          // Store new tokens
          authService.setTokens(response.data.accessToken, response.data.refreshToken);
          resolve(response.data.accessToken);
        } else {
          console.log('Token refresh failed - invalid response');
          authService.clearTokens();
          reject(new Error('Failed to refresh token'));
        }
      } catch (error) {
        console.error('Error during token refresh:', error);
        // Any error in token refresh should clear tokens
        authService.clearTokens();
        reject(error);
      } finally {
        this.refreshTokenPromise = null;
      }
    });

    return this.refreshTokenPromise;
  }

  /**
   * Main method to make API requests
   */
  async request<T = any>({
    endpoint,
    method = 'GET',
    data,
    params,
    headers,
    requiresAuth = true,
    responseType = 'json',
  }: ApiRequestParams): Promise<ApiResponse<T>> {
    try {
      // Build request config
      const config: AxiosRequestConfig = {
        url: endpoint,
        method,
        params,
        data,
        headers,
        responseType,
      };

      // Make the request
      const response: AxiosResponse<T> = await this.axios(config);

      // Return standardized response
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error: any) {
      // Handle and transform error
      if (error.response) {
        // The request was made and the server responded with a non-2xx status
        const errorMessage = error.response.data?.message || 'An error occurred';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something else happened while setting up the request
        throw new Error(error.message || 'An error occurred while making the request');
      }
    }
  }

  // Convenience methods for common HTTP verbs
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Partial<ApiRequestParams>,
  ): Promise<T> {
    const response = await this.request<T>({
      endpoint,
      method: 'GET',
      params,
      ...config,
    });
    return response.data;
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: Partial<ApiRequestParams>,
  ): Promise<T> {
    const response = await this.request<T>({
      endpoint,
      method: 'POST',
      data,
      ...config,
    });
    return response.data;
  }

  async put<T = any>(endpoint: string, data?: any, config?: Partial<ApiRequestParams>): Promise<T> {
    const response = await this.request<T>({
      endpoint,
      method: 'PUT',
      data,
      ...config,
    });
    return response.data;
  }

  async delete<T = any>(endpoint: string, config?: Partial<ApiRequestParams>): Promise<T> {
    const response = await this.request<T>({
      endpoint,
      method: 'DELETE',
      ...config,
    });
    return response.data;
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: Partial<ApiRequestParams>,
  ): Promise<T> {
    const response = await this.request<T>({
      endpoint,
      method: 'PATCH',
      data,
      ...config,
    });
    return response.data;
  }
}

// Create a singleton instance
const api = new ApiService();
export default api;
