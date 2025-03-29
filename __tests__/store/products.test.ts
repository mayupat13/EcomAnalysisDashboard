import { renderHook, act } from '@testing-library/react-hooks';
import { useProductsStore } from '@/store/products';
import api from '@/lib/api';
import { getSession } from 'next-auth/react';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next-auth/react');

// Fix TypeScript type for mocked API methods
const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Products Store', () => {
  beforeEach(() => {
    // Reset store
    act(() => {
      useProductsStore.setState({
        products: [],
        isLoading: false,
        error: null,
        categories: [],
      });
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession = { user: { id: '123', name: 'Test User' } };
      mockedGetSession.mockResolvedValue(mockSession as any);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const isAuthenticated = await result.current.checkAuthentication();
        expect(isAuthenticated).toBe(true);
      });

      expect(mockedGetSession).toHaveBeenCalled();
    });

    it('should return false when user is not authenticated', async () => {
      mockedGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const isAuthenticated = await result.current.checkAuthentication();
        expect(isAuthenticated).toBe(false);
      });
    });

    it('should handle errors during authentication check', async () => {
      mockedGetSession.mockRejectedValue(new Error('Session check failed'));

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const isAuthenticated = await result.current.checkAuthentication();
        expect(isAuthenticated).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 errors correctly', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      const { result } = renderHook(() => useProductsStore());

      const errorMessage = result.current.handleApiError(error, 'Default message');
      expect(errorMessage).toBe('Your session has expired. Please log in again.');
    });

    it('should use server error message when available', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Product name is required' },
        },
      };

      const { result } = renderHook(() => useProductsStore());

      const errorMessage = result.current.handleApiError(error, 'Default message');
      expect(errorMessage).toBe('Product name is required');
    });

    it('should use default message when no specific error is available', () => {
      const error = new Error('Generic error');

      const { result } = renderHook(() => useProductsStore());

      const errorMessage = result.current.handleApiError(error, 'Default message');
      expect(errorMessage).toBe('Default message');
    });
  });

  describe('Create Product', () => {
    it('should successfully create a product when authenticated', async () => {
      // Mock successful authentication
      mockedGetSession.mockResolvedValue({ user: { id: '123' } } as any);

      // Mock successful API call
      const mockProduct = { _id: '123', name: 'Test Product', price: 9.99 };
      mockedApi.post.mockResolvedValue({ data: { product: mockProduct } } as any);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.createProduct({ name: 'Test Product', price: 9.99 });
        expect(product).toEqual(mockProduct);
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/api/products', expect.any(Object));
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle authentication failure during product creation', async () => {
      // Mock authentication failure
      mockedGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.createProduct({ name: 'Test Product', price: 9.99 });
        expect(product).toBeNull();
      });

      expect(mockedApi.post).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Your session has expired. Please log in again.');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors during product creation', async () => {
      // Mock successful authentication
      mockedGetSession.mockResolvedValue({ user: { id: '123' } } as any);

      // Mock API error
      mockedApi.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      });

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.createProduct({ name: 'Test Product', price: 9.99 });
        expect(product).toBeNull();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should validate required fields before API call', async () => {
      // Mock successful authentication
      mockedGetSession.mockResolvedValue({ user: { id: '123' } } as any);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        // Missing name
        const product = await result.current.createProduct({ price: 9.99 });
        expect(product).toBeNull();
      });

      expect(mockedApi.post).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Product name and price are required');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Update Product', () => {
    it('should successfully update a product when authenticated', async () => {
      // Mock successful authentication
      mockedGetSession.mockResolvedValue({ user: { id: '123' } } as any);

      // Mock successful API call
      const mockProduct = { _id: '123', name: 'Updated Product', price: 19.99 };
      mockedApi.put.mockResolvedValue({ data: { product: mockProduct } } as any);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.updateProduct('123', {
          name: 'Updated Product',
          price: 19.99,
        });
        expect(product).toEqual(mockProduct);
      });

      expect(mockedApi.put).toHaveBeenCalledWith('/api/products/123', expect.any(Object));
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle authentication failure during product update', async () => {
      // Mock authentication failure
      mockedGetSession.mockResolvedValue(null);

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.updateProduct('123', {
          name: 'Updated Product',
          price: 19.99,
        });
        expect(product).toBeNull();
      });

      expect(mockedApi.put).not.toHaveBeenCalled();
      expect(result.current.error).toBe('Your session has expired. Please log in again.');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors during product update', async () => {
      // Mock successful authentication
      mockedGetSession.mockResolvedValue({ user: { id: '123' } } as any);

      // Mock API error
      mockedApi.put.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Product not found' },
        },
      });

      const { result } = renderHook(() => useProductsStore());

      await act(async () => {
        const product = await result.current.updateProduct('123', {
          name: 'Updated Product',
          price: 19.99,
        });
        expect(product).toBeNull();
      });

      expect(result.current.error).toBe('Product not found');
      expect(result.current.isLoading).toBe(false);
    });
  });
});
