import mongoose, { Schema, Document } from 'mongoose';
import { models, model } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
}, { _id: false });

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a customer name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: AddressSchema,
  },
}, {
  timestamps: true,
});

// Create indexes for searching customers
CustomerSchema.index({ name: 'text', email: 'text', phone: 'text' });

// Prevent model overwrite during development with Next.js hot reload
const Customer = models.Customer || model<ICustomer>('Customer', CustomerSchema);
export default Customer;
