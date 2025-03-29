import mongoose, { Schema, Document } from 'mongoose';
import { models, model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  sku?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  category: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    trim: true,
  },
  images: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// Create an index for searching products
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

// Prevent model overwrite during development with Next.js hot reload
const Product = models.Product || model<IProduct>('Product', ProductSchema);
export default Product;
