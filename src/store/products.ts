import { create } from 'zustand';
import api from '@/lib/api';
import { ProductType } from '@/types';

interface ProductsState {
  products: ProductType[];
  isLoading: boolean;
  error: string | null;

  // Helper methods
  handleApiError: (error: any, defaultMessage: string) => string;

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
  categories: string[];
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
    // If categories are already loaded, don't make another request
    if (get().categories.length > 0) {
      return;
    }

    try {
      const response = await api.get('/api/products/categories');
      set({ categories: response.categories || [] });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Don't set error state here to avoid UI disruption for category fetch failures
    }
  },
}));
