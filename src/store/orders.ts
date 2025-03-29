import { create } from 'zustand';
import axios from 'axios';
import { OrderType } from '@/types';

interface OrdersState {
  orders: OrderType[];
  isLoading: boolean;
  error: string | null;
  
  // Order list actions
  fetchOrders: (params?: Record<string, any>) => Promise<void>;
  
  // Single order actions
  getOrder: (id: string) => Promise<OrderType | null>;
  updateOrderStatus: (id: string, status: string) => Promise<OrderType | null>;
  
  // Order statistics
  recentOrders: OrderType[];
  fetchRecentOrders: () => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  recentOrders: [],
  isLoading: false,
  error: null,
  
  fetchOrders: async (params = {}) => {
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
      const url = `/api/orders${query ? `?${query}` : ''}`;
      
      const response = await axios.get(url);
      set({ orders: response.data.orders, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false
      });
    }
  },
  
  getOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/orders/${id}`);
      set({ isLoading: false });
      return response.data.order;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch order',
        isLoading: false
      });
      return null;
    }
  },
  
  updateOrderStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`/api/orders/${id}`, { status });
      
      // Update order in the local state
      set((state) => ({
        orders: state.orders.map(o => 
          o._id === id ? { ...o, status } : o
        ),
        isLoading: false
      }));
      
      return response.data.order;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update order status',
        isLoading: false
      });
      return null;
    }
  },
  
  fetchRecentOrders: async () => {
    try {
      const response = await axios.get('/api/orders?limit=5&sortBy=createdAt&sortOrder=desc');
      set({ recentOrders: response.data.orders });
    } catch (error: any) {
      console.error('Failed to fetch recent orders:', error);
      // Don't set error state here to avoid UI disruption
    }
  }
}));
