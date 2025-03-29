import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { id } = req.query;
  const orderId = id as string;
  
  await dbConnect();
  
  // GET - Get order details
  if (req.method === 'GET') {
    try {
      const order = await Order.findById(orderId)
        .populate('customer', 'name email phone address')
        .populate('items.product', 'name price sku images')
        .lean();
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.status(200).json({ order });
    } catch (error) {
      console.error('Error getting order:', error);
      return res.status(500).json({ message: 'An error occurred while fetching the order' });
    }
  }
  
  // PUT - Update order
  if (req.method === 'PUT') {
    try {
      const { status, shippingAddress, billingAddress, paymentMethod } = req.body;
      
      const updateData: any = {};
      
      // Only allow specific fields to be updated
      if (status) updateData.status = status;
      if (shippingAddress) updateData.shippingAddress = shippingAddress;
      if (billingAddress) updateData.billingAddress = billingAddress;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      
      // Update order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      ).populate('customer', 'name email').populate('items.product', 'name price');
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.status(200).json({ order: updatedOrder });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ message: 'An error occurred while updating the order' });
    }
  }
  
  // DELETE - Not allowing order deletion, but could implement archive functionality
  if (req.method === 'DELETE') {
    return res.status(405).json({ message: 'Orders cannot be deleted. Use status update instead.' });
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
