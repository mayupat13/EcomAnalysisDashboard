import { OrderType, OrderItemType } from '@/types';
import { Types } from 'mongoose';
import { customers } from './customers';
import { products } from './products';

// Create sample orders with proper MongoDB ObjectId references
const sampleOrders: Omit<OrderType, 'customer' | 'items'>[] = [
  {
    _id: 'o001',
    orderNumber: 'ORD-2023-0001',
    subtotal: 16.96,
    tax: 1.36,
    shipping: 5.99,
    totalAmount: 24.31,
    shippingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: new Date(2023, 4, 1).toISOString(),
    updatedAt: new Date(2023, 4, 1).toISOString(),
  },
  {
    _id: 'o002',
    orderNumber: 'ORD-2023-0002',
    subtotal: 16.46,
    tax: 1.32,
    shipping: 5.99,
    totalAmount: 23.77,
    shippingAddress: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    billingAddress: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    paymentMethod: 'PayPal',
    status: 'completed',
    createdAt: new Date(2023, 4, 2).toISOString(),
    updatedAt: new Date(2023, 4, 2).toISOString(),
  },
  {
    _id: 'o003',
    orderNumber: 'ORD-2023-0003',
    subtotal: 22.97,
    tax: 1.84,
    shipping: 5.99,
    totalAmount: 30.8,
    shippingAddress: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60007',
      country: 'USA',
    },
    billingAddress: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60007',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    status: 'processing',
    createdAt: new Date(2023, 4, 3).toISOString(),
    updatedAt: new Date(2023, 4, 3).toISOString(),
  },
  {
    _id: 'o004',
    orderNumber: 'ORD-2023-0004',
    subtotal: 16.97,
    tax: 1.36,
    shipping: 5.99,
    totalAmount: 24.32,
    shippingAddress: {
      street: '101 Maple Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
    },
    billingAddress: {
      street: '101 Maple Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    status: 'processing',
    createdAt: new Date(2023, 4, 4).toISOString(),
    updatedAt: new Date(2023, 4, 4).toISOString(),
  },
  {
    _id: 'o005',
    orderNumber: 'ORD-2023-0005',
    subtotal: 23.94,
    tax: 1.92,
    shipping: 5.99,
    totalAmount: 31.85,
    shippingAddress: {
      street: '202 Cedar Lane',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
    },
    billingAddress: {
      street: '202 Cedar Lane',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
    },
    paymentMethod: 'PayPal',
    status: 'completed',
    createdAt: new Date(2023, 4, 5).toISOString(),
    updatedAt: new Date(2023, 4, 5).toISOString(),
  },
  {
    _id: 'o006',
    orderNumber: 'ORD-2023-0006',
    subtotal: 13.48,
    tax: 1.08,
    shipping: 5.99,
    totalAmount: 20.55,
    shippingAddress: {
      street: '303 Birch Boulevard',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
    },
    billingAddress: {
      street: '303 Birch Boulevard',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    status: 'shipped',
    createdAt: new Date(2023, 4, 6).toISOString(),
    updatedAt: new Date(2023, 4, 6).toISOString(),
  },
  {
    _id: 'o007',
    orderNumber: 'ORD-2023-0007',
    subtotal: 18.27,
    tax: 1.46,
    shipping: 5.99,
    totalAmount: 25.72,
    shippingAddress: {
      street: '404 Elm Street',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA',
    },
    billingAddress: {
      street: '404 Elm Street',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA',
    },
    paymentMethod: 'PayPal',
    status: 'pending',
    createdAt: new Date(2023, 4, 7).toISOString(),
    updatedAt: new Date(2023, 4, 7).toISOString(),
  },
  {
    _id: 'o008',
    orderNumber: 'ORD-2023-0008',
    subtotal: 20.96,
    tax: 1.68,
    shipping: 5.99,
    totalAmount: 28.63,
    shippingAddress: {
      street: '505 Willow Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA',
    },
    billingAddress: {
      street: '505 Willow Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA',
    },
    paymentMethod: 'Credit Card',
    status: 'pending',
    createdAt: new Date(2023, 4, 8).toISOString(),
    updatedAt: new Date(2023, 4, 8).toISOString(),
  },
];

// Customer mapping for sample display
export const customerMap = {
  o001: 'c001',
  o002: 'c002',
  o003: 'c003',
  o004: 'c004',
  o005: 'c005',
  o006: 'c006',
  o007: 'c007',
  o008: 'c008',
};

// Order items mapping for sample display
export const orderItemsMap = {
  o001: [
    { product: 'p001', quantity: 3, price: 2.99 },
    { product: 'p006', quantity: 1, price: 7.99 },
  ],
  o002: [
    { product: 'p003', quantity: 2, price: 3.49 },
    { product: 'p004', quantity: 1, price: 4.99 },
    { product: 'p010', quantity: 1, price: 4.29 },
  ],
  o003: [
    { product: 'p008', quantity: 1, price: 12.99 },
    { product: 'p009', quantity: 2, price: 4.99 },
  ],
  o004: [
    { product: 'p011', quantity: 1, price: 8.99 },
    { product: 'p012', quantity: 2, price: 3.99 },
  ],
  o005: [
    { product: 'p002', quantity: 3, price: 1.49 },
    { product: 'p005', quantity: 2, price: 5.99 },
    { product: 'p013', quantity: 1, price: 2.49 },
  ],
  o006: [
    { product: 'p007', quantity: 1, price: 3.49 },
    { product: 'p015', quantity: 1, price: 9.99 },
  ],
  o007: [
    { product: 'p014', quantity: 2, price: 6.99 },
    { product: 'p010', quantity: 1, price: 4.29 },
  ],
  o008: [
    { product: 'p004', quantity: 2, price: 4.99 },
    { product: 'p012', quantity: 1, price: 3.99 },
    { product: 'p006', quantity: 1, price: 7.99 },
  ],
};

// Extend the sample orders with customer and items references
export const orders: OrderType[] = sampleOrders.map((order) => {
  return {
    ...order,
    // Use a string for the customer ID which will be resolved in the component
    customer: customerMap[order._id as keyof typeof customerMap] as any,
    // Use a simple array for the items which will be resolved in the component
    items: orderItemsMap[order._id as keyof typeof orderItemsMap] as any[],
  };
});
