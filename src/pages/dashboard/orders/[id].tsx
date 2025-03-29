import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import OrderDetails from '@/components/orders/OrderDetails';
import OrderDetailsWrapper from '@/components/orders/OrderDetailsWrapper';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Select from '@/components/ui/Select';
import { OrderType } from '@/types';
import axios from 'axios';
import authService from '@/lib/authService';

interface OrderDetailPageProps {
  order: OrderType;
  orderStatuses: string[];
}

// Format date in a consistent way for both server and client
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Use a date format that's consistent regardless of locale
  return date.toISOString().split('T')[0].split('-').reverse().join('/');
};

export default function OrderDetailPage({ order, orderStatuses }: OrderDetailPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState(order?.status || '');

  // Log the order ID for debugging
  useEffect(() => {
    console.log('OrderDetailPage - Component mounted with order ID:', order?._id);
    console.log('OrderDetailPage - Router query ID:', id);
  }, [order, id]);

  // If the ID from router doesn't match the order ID (or ID is missing), try to refetch
  useEffect(() => {
    if (id && order && id !== order._id) {
      console.warn('OrderDetailPage - ID mismatch, details:', {
        routerId: id,
        orderIdFromProps: order._id,
        routerIdType: typeof id,
        orderIdType: typeof order._id,
        stringsEqual: String(id) === String(order._id),
      });

      // Only reload if the string representations are different
      if (String(id) !== String(order._id)) {
        console.warn(
          'OrderDetailPage - ID mismatch even when converted to strings, reloading page',
        );
        router.replace(`/dashboard/orders/${id}`);
      } else {
        console.log('OrderDetailPage - IDs match when converted to strings, no reload needed');
      }
    }
  }, [id, order, router]);

  // If the order is not available, show a loading state or error
  if (!order || !order._id) {
    return (
      <Layout>
        <Head>
          <title>Order Not Found | eCommerce Control Panel</title>
        </Head>
        <div className="px-4 py-6">
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
            <p className="text-gray-500 mb-6">The requested order could not be found.</p>
            <Button onClick={() => router.push('/dashboard/orders')}>Back to Orders</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleStatusChange = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = authService.getAccessToken();

      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log(`Order Update - Updating order ${order._id} status to: ${status}`);

      await axios.put(
        `/api/orders/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Order Update - Status updated successfully');
      setSuccess('Order status updated successfully');

      // Refresh the page after a delay
      setTimeout(() => {
        router.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Order Update - Error updating order status:', error);

      if (error.response?.status === 401) {
        // Handle authentication error
        authService.clearTokens();
        router.push('/login');
        return;
      }

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
              Order #{order.orderNumber} - {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-48">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
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

        <OrderDetailsWrapper order={order} />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, params } = context;
  const id = params?.id as string;

  if (!id) {
    console.log('Order Details - No order ID provided in params');
    return {
      notFound: true,
    };
  }

  console.log(`Order Details - Beginning server-side props for order ID: ${id}`);
  console.log('Order Details - ID param type:', typeof id);

  // Check for access token in cookies
  const token = req.cookies['access_token'];
  console.log(
    'Order Details - Server-side token check:',
    token ? 'Token present' : 'No token found',
  );

  if (!token) {
    console.log('Order Details - No access token found in cookies, redirecting to login');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Construct the API URL properly
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000';
    const orderApiUrl = `${apiUrl}/api/orders/${id}`;

    console.log(`Order Details - Fetching order data from: ${orderApiUrl}`);

    // Create a new fetch request for server-side
    const response = await fetch(orderApiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Order Details - Server-side response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Order Details - Server-side error response:', errorText);

      if (response.status === 401) {
        console.log('Order Details - Authentication failed, redirecting to login');
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      if (response.status === 404) {
        console.log(`Order Details - Order ID ${id} not found`);
        return {
          notFound: true,
        };
      }

      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.order) {
      console.log('Order Details - No order data in response');
      return {
        notFound: true,
      };
    }

    console.log(
      `Order Details - Server-side order data loaded successfully for ID: ${data.order._id}`,
    );

    // Verify the returned order ID matches the requested ID
    if (data.order._id !== id) {
      console.warn(`Order Details - ID mismatch: requested ${id}, received ${data.order._id}`);
      console.warn('Order Details - ID types:', {
        requestedIdType: typeof id,
        receivedIdType: typeof data.order._id,
        stringsEqual: String(id) === String(data.order._id),
      });

      // Always ensure the order ID is a string to avoid type mismatches on the client
      data.order._id = String(data.order._id);
    }

    // Get all possible order statuses
    const orderStatuses = [
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Refunded',
    ];

    return {
      props: {
        order: data.order,
        orderStatuses,
      },
    };
  } catch (error) {
    console.error('Order Details - Error in getServerSideProps:', error);
    return {
      notFound: true,
    };
  }
};
