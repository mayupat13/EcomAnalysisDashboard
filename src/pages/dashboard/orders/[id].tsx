import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import OrderDetails from '@/components/orders/OrderDetails';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import { OrderType } from '@/types';
import axios from 'axios';

interface OrderDetailPageProps {
  order: OrderType;
  orderStatuses: string[];
}

export default function OrderDetailPage({ order, orderStatuses }: OrderDetailPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState(order.status);

  const handleStatusChange = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`/api/orders/${order._id}`, { status });
      setSuccess('Order status updated successfully');
      
      // Refresh the page after a delay
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setError(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Order Details | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Order #{order.orderNumber} - {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-48">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {orderStatuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleStatusChange} isLoading={isLoading}>
              Update Status
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}
        {success && <Alert type="success" message={success} className="mb-6" />}

        <OrderDetails order={order} />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { id } = context.params as { id: string };

  await dbConnect();

  // Get order with populated data
  const order = await Order.findById(id)
    .populate('customer', 'name email phone address')
    .populate('items.product', 'name price images')
    .lean();

  if (!order) {
    return {
      notFound: true,
    };
  }

  // Get all possible order statuses
  const orderStatuses = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded'
  ];

  return {
    props: {
      order: JSON.parse(JSON.stringify(order)),
      orderStatuses,
    },
  };
};
