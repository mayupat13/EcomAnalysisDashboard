import { ProductType } from '@/types';

export const products: ProductType[] = [
  // Fruits
  {
    _id: 'p001',
    name: 'Fresh Apples',
    description: 'Crisp and juicy red apples, perfect for snacking or baking.',
    price: 2.99,
    stock: 150,
    category: 'Fruits',
    sku: 'FRT-APL-001',
    images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce'],
    createdAt: new Date(2023, 1, 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p002',
    name: 'Organic Bananas',
    description: 'Sweet and ripe organic bananas, sourced from sustainable farms.',
    price: 1.49,
    stock: 200,
    category: 'Fruits',
    sku: 'FRT-BAN-002',
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e'],
    createdAt: new Date(2023, 2, 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p003',
    name: 'Juicy Oranges',
    description: 'Sweet and tangy oranges, rich in vitamin C.',
    price: 3.49,
    stock: 120,
    category: 'Fruits',
    sku: 'FRT-ORG-003',
    images: ['https://images.unsplash.com/photo-1582979512210-99b6a53386f9'],
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p004',
    name: 'Fresh Strawberries',
    description: 'Sweet and fragrant strawberries, perfect for desserts.',
    price: 4.99,
    stock: 80,
    category: 'Fruits',
    sku: 'FRT-STR-004',
    images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6'],
    createdAt: new Date(2023, 3, 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p005',
    name: 'Ripe Mangoes',
    description: 'Sweet and aromatic mangoes, ready to eat.',
    price: 5.99,
    stock: 60,
    category: 'Fruits',
    sku: 'FRT-MNG-005',
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078'],
    createdAt: new Date(2023, 3, 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // FMCG Products
  {
    _id: 'p006',
    name: 'Premium Shampoo',
    description: 'Nourishing shampoo for all hair types.',
    price: 7.99,
    stock: 100,
    category: 'Personal Care',
    sku: 'PC-SHP-001',
    images: ['https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8'],
    createdAt: new Date(2023, 1, 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p007',
    name: 'Toothpaste Fresh Mint',
    description: 'Cavity protection toothpaste with mint flavor.',
    price: 3.49,
    stock: 150,
    category: 'Personal Care',
    sku: 'PC-TPT-002',
    images: ['https://images.unsplash.com/photo-1559674813-89cc58de69e9'],
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p008',
    name: 'Laundry Detergent',
    description: 'High-efficiency laundry detergent, removes tough stains.',
    price: 12.99,
    stock: 85,
    category: 'Household',
    sku: 'HH-LDT-001',
    images: ['https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c'],
    createdAt: new Date(2023, 2, 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p009',
    name: 'Dish Washing Liquid',
    description: 'Effective dish soap that cuts through grease.',
    price: 4.99,
    stock: 120,
    category: 'Household',
    sku: 'HH-DWL-002',
    images: ['https://images.unsplash.com/photo-1622398925373-3f91b1a52213'],
    createdAt: new Date(2023, 2, 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p010',
    name: 'Breakfast Cereal',
    description: 'Healthy whole grain breakfast cereal.',
    price: 4.29,
    stock: 90,
    category: 'Food',
    sku: 'FD-CRL-001',
    images: ['https://images.unsplash.com/photo-1613769049987-b31b641f25b1'],
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p011',
    name: 'Instant Coffee',
    description: 'Premium instant coffee, rich aroma and flavor.',
    price: 8.99,
    stock: 75,
    category: 'Beverages',
    sku: 'BV-CFE-001',
    images: ['https://images.unsplash.com/photo-1559526323-cb2f2fe2591b'],
    createdAt: new Date(2023, 3, 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p012',
    name: 'Chocolate Cookies',
    description: 'Delicious chocolate chip cookies, perfect with milk.',
    price: 3.99,
    stock: 6,
    category: 'Snacks',
    sku: 'SK-CKS-001',
    images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e'],
    createdAt: new Date(2023, 3, 20).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p013',
    name: 'Potato Chips',
    description: 'Crunchy potato chips, lightly salted.',
    price: 2.49,
    stock: 8,
    category: 'Snacks',
    sku: 'SK-CHP-002',
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b'],
    createdAt: new Date(2023, 4, 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p014',
    name: 'Cooking Oil',
    description: 'Pure vegetable cooking oil, perfect for frying and cooking.',
    price: 6.99,
    stock: 4,
    category: 'Food',
    sku: 'FD-OIL-001',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5'],
    createdAt: new Date(2023, 4, 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'p015',
    name: 'Body Lotion',
    description: 'Moisturizing body lotion for soft and smooth skin.',
    price: 9.99,
    stock: 70,
    category: 'Personal Care',
    sku: 'PC-BLN-003',
    images: ['https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec'],
    createdAt: new Date(2023, 4, 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
