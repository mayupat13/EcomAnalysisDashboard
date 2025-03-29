import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import OrderList from '@/components/orders/OrderList';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { OrderType } from '@/types';

interface OrdersPageProps {
  orders: OrderType[];
  totalCount: number;
  statuses: string[];
  error?: string;
}

export default function OrdersPage({ orders, totalCount, statuses, error }: OrdersPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/dashboard/orders',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        page: 1,
      },
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    router.push({
      pathname: '/dashboard/orders',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(e.target.value && { status: e.target.value }),
        page: 1,
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push({
      pathname: '/dashboard/orders',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        page,
      },
    });
  };

  return (
    <Layout>
      <Head>
        <title>Orders | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage customer orders</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by order ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedStatus} onChange={handleStatusChange}>
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            {error}
          </div>
        )}

        <OrderList
          orders={orders}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  // Check for access token in cookies
  const token = req.cookies['access_token'];
  console.log('Server-side token check:', token ? 'Token present' : 'No token found');

  if (!token) {
    console.log('No access token found in cookies, redirecting to login');
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
    console.log('Orders Page - Using API URL:', apiUrl);

    // Fetch orders data
    const ordersResponse = await fetch(`${apiUrl}/api/orders?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Orders Page - API response status:', ordersResponse.status);

    if (!ordersResponse.ok) {
      if (ordersResponse.status === 401) {
        console.log('Orders Page - Authentication failed, redirecting to login');
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      // Log the error but don't throw
      console.error(`Orders Page - Failed to fetch orders: ${ordersResponse.statusText}`);

      // Return empty data instead of throwing an error
      return {
        props: {
          orders: [],
          totalCount: 0,
          statuses: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          error: `Failed to load orders: ${ordersResponse.statusText}`,
        },
      };
    }

    const ordersData = await ordersResponse.json();
    console.log('Orders Page - Successfully loaded orders data');

    // Get unique statuses for filter dropdowns
    const statuses = Array.from(new Set(ordersData.orders.map((order: any) => order.status)));

    return {
      props: {
        orders: ordersData.orders || [],
        totalCount: ordersData.totalCount || 0,
        statuses: statuses || ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        orders: [],
        totalCount: 0,
        statuses: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        error: 'An error occurred while loading orders',
      },
    };
  }
};
