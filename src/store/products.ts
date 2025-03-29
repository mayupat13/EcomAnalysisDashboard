import { create } from 'zustand';
import api from '@/lib/api';
import { ProductType } from '@/types';
import authService from '@/lib/authService';

interface ProductsState {
  products: ProductType[];
  isLoading: boolean;
  error: string | null;
  categories: string[];

  // Helper methods
  handleApiError: (error: any, defaultMessage: string) => string;
  set: (state: Partial<ProductsState>) => void;

  // Product list actions
  fetchProducts: (params?: Record<string, any>) => Promise<{
    products: ProductType[];
    totalCount: number;
    totalPages: number;
  }>;

  // Single product actions
  getProduct: (id: string) => Promise<ProductType | null>;
  createProduct: (productData: Partial<ProductType>) => Promise<ProductType | null>;
  updateProduct: (id: string, productData: Partial<ProductType>) => Promise<ProductType | null>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Category actions
  fetchCategories: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // State
  products: [],
  isLoading: false,
  error: null,
  categories: [],

  // Helper methods
  handleApiError: (error: any, defaultMessage: string) => {
    console.error(`${defaultMessage}:`, error);

    // Handle different types of errors
    if (error.message) {
      return error.message;
    }

    return defaultMessage;
  },

  // State management
  set: (state: Partial<ProductsState>) => {
    set(state);
  },

  // Product list actions
  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const query = queryParams.toString();
      const url = `/api/products${query ? `?${query}` : ''}`;

      const response = await api.get(url);

      set({
        products: response.products || [],
        isLoading: false,
      });

      return {
        products: response.products || [],
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 0,
      };
    } catch (error: any) {
      const errorMessage = get().handleApiError(error, 'Failed to fetch products');
      set({
        error: errorMessage,
        isLoading: false,
        products: [],
      });
      return {
        products: [],
        totalCount: 0,
        totalPages: 0,
      };
    }
  },

  getProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/products/${id}`);
      set({ isLoading: false });
      return response.product;
    } catch (error: any) {
      const errorMessage = get().handleApiError(error, 'Failed to fetch product');
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  createProduct: async (productData: Partial<ProductType>) => {
    set({ isLoading: true, error: null });
    try {
      // Validate required fields
      if (!productData.name || productData.price === undefined) {
        throw new Error('Product name and price are required');
      }

      const response = await api.post('/api/products', productData);
      set({ isLoading: false });

      // Refetch products to update the list
      await get().fetchProducts();

      return response.product;
    } catch (error: any) {
      const errorMessage = get().handleApiError(error, 'Failed to create product');
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  updateProduct: async (id: string, productData: Partial<ProductType>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      set({ isLoading: false });

      // Refetch products to update the list
      await get().fetchProducts();

      return response.product;
    } catch (error: any) {
      const errorMessage = get().handleApiError(error, 'Failed to update product');
      set({
        error: errorMessage,
        isLoading: false,
      });
      return null;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/products/${id}`);
      set({ isLoading: false });

      // Refetch products to update the list
      await get().fetchProducts();

      return true;
    } catch (error: any) {
      const errorMessage = get().handleApiError(error, 'Failed to delete product');
      set({
        error: errorMessage,
        isLoading: false,
      });
      return false;
    }
  },

  fetchCategories: async () => {
    console.log('=== fetchCategories START ===');
    console.log('Current categories state:', get().categories);

    // If categories are already loaded, don't make another request
    if (get().categories.length > 0) {
      console.log('Categories already loaded, skipping fetch');
      return;
    }

    set({ isLoading: true, error: null });
    console.log('Making API request to /api/products/categories');

    try {
      // Log the current auth state
      const token = authService.getAccessToken();
      console.log('Current auth token:', token ? 'Present' : 'Missing');

      // Get cookies for server-side requests
      const cookies = typeof window !== 'undefined' ? document.cookie : '';

      const response = await api.get('/api/products/categories', undefined, {
        headers: {
          Cookie: cookies,
        },
      });

      console.log('API Response:', response);

      set({
        categories: response.categories || [],
        isLoading: false,
      });
      console.log('Categories updated successfully:', response.categories || []);
    } catch (error: any) {
      console.error('=== fetchCategories ERROR ===');
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      const errorMessage = get().handleApiError(error, 'Failed to fetch categories');
      console.error('Processed error message:', errorMessage);

      set({
        error: errorMessage,
        isLoading: false,
        categories: [], // Reset categories on error
      });
    } finally {
      console.log('=== fetchCategories END ===');
    }
  },
}));
