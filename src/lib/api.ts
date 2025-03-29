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
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
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
    // Check if we need to add the auth token
    if (
      config.url &&
      !config.url.includes('/auth/login') &&
      !config.url.includes('/auth/refresh')
    ) {
      const token = authService.getAccessToken();

      if (token) {
        try {
          if (authService.isTokenExpired(token)) {
            // Token is expired, refresh it
            const newToken = await this.refreshToken();
            if (newToken) {
              config.headers.set('Authorization', `Bearer ${newToken}`);
            } else {
              // If refresh failed, handle auth failure
              this.handleAuthFailure();
            }
          } else {
            // Token is valid, include it
            config.headers.set('Authorization', `Bearer ${token}`);
          }
        } catch (error) {
          // If any error occurs during token validation, clear tokens and handle failure
          console.error('Error validating token:', error);
          this.handleAuthFailure();
        }
      }
    }

    return config;
  }

  /**
   * Handle API response errors including auth failures
   */
  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config;

    // Check if the error is a 401 Unauthorized
    if (error.response?.status === 401 && originalRequest) {
      // Don't retry if already attempted or it's a refresh token request
      if ((originalRequest as any)._retry || originalRequest.url?.includes('/auth/refresh')) {
        // Handle auth failure and logout
        this.handleAuthFailure();
        return Promise.reject(error);
      }

      // Mark as retry attempt
      (originalRequest as any)._retry = true;

      try {
        // Try to refresh the token
        const newToken = await this.refreshToken();

        if (newToken && originalRequest.headers) {
          // Update the auth header with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request with new token
          return this.axios(originalRequest);
        } else {
          // If refresh failed, handle auth failure
          this.handleAuthFailure();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh throws, handle auth failure
        this.handleAuthFailure();
        return Promise.reject(error);
      }
    }

    // Return the original error for other error types
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
      // No refresh token available
      return Promise.resolve(null);
    }

    // Create the refresh token promise
    this.refreshTokenPromise = new Promise<string>(async (resolve, reject) => {
      try {
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
          // Store new tokens
          authService.setTokens(response.data.accessToken, response.data.refreshToken);
          resolve(response.data.accessToken);
        } else {
          authService.clearTokens();
          reject(new Error('Failed to refresh token'));
        }
      } catch (error) {
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
