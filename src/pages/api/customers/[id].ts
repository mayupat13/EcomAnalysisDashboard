import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { id } = req.query;
  const customerId = id as string;
  
  await dbConnect();
  
  // GET - Get customer details
  if (req.method === 'GET') {
    try {
      const customer = await Customer.findById(customerId).lean();
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Get customer orders
      const orders = await Order.find({ customer: customerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      // Calculate total spent and order count
      const allOrders = await Order.find({ customer: customerId }).lean();
      const totalSpent = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderCount = allOrders.length;
      
      return res.status(200).json({ 
        customer, 
        orders: orders || [], 
        totalSpent, 
        orderCount 
      });
    } catch (error) {
      console.error('Error getting customer:', error);
      return res.status(500).json({ message: 'An error occurred while fetching the customer' });
    }
  }
  
  // PUT - Update customer
  if (req.method === 'PUT') {
    try {
      const { name, email, phone, address } = req.body;
      
      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      
      // Check if email already exists for another customer
      const existingCustomer = await Customer.findOne({ email, _id: { $ne: customerId } });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email is already in use by another customer' });
      }
      
      // Update customer
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        { name, email, phone, address },
        { new: true }
      );
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      return res.status(200).json({ customer: updatedCustomer });
    } catch (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json({ message: 'An error occurred while updating the customer' });
    }
  }
  
  // DELETE - Delete customer
  if (req.method === 'DELETE') {
    try {
      // Check if customer has orders
      const hasOrders = await Order.findOne({ customer: customerId });
      if (hasOrders) {
        return res.status(400).json({ 
          message: 'Cannot delete customer with existing orders. Archive the customer instead.' 
        });
      }
      
      const deletedCustomer = await Customer.findByIdAndDelete(customerId);
      
      if (!deletedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ message: 'An error occurred while deleting the customer' });
    }
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
