import { Types } from 'mongoose';

export type AddressType = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type ProductType = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItemType = {
  product: ProductType | Types.ObjectId;
  quantity: number;
  price: number;
};

export type OrderType = {
  _id: string;
  orderNumber: string;
  customer: CustomerType | Types.ObjectId;
  items: OrderItemType[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  shippingAddress?: AddressType;
  billingAddress?: AddressType;
  paymentMethod?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerType = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: AddressType;
  createdAt: string;
  updatedAt: string;
};

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type SalesDataType = {
  labels: string[];
  data: number[];
};

export type TopProductType = {
  _id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
};

export type TopCustomerType = {
  _id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
};

export type CategoryDistributionType = {
  _id: string;
  count: number;
  revenue: number;
};
