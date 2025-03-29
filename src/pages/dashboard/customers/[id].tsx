import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import CustomerDetails from '@/components/customers/CustomerDetails';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import { CustomerType, OrderType } from '@/types';

interface CustomerDetailPageProps {
  customer: CustomerType;
  orders: OrderType[];
  totalSpent: number;
  orderCount: number;
  error?: string;
}

export default function CustomerDetailPage({
  customer,
  orders,
  totalSpent,
  orderCount,
  error,
}: CustomerDetailPageProps) {
  return (
    <Layout>
      <Head>
        <title>Customer Details | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Customer Details</h1>
          <p className="text-gray-600 dark:text-gray-300">
            View customer information and order history
          </p>
        </div>

        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <CustomerDetails
            customer={customer}
            orders={orders}
            totalSpent={totalSpent}
            orderCount={orderCount}
          />
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, params } = context;
  const { id } = params as { id: string };

  try {
    // Get token from cookies
    const token = req.cookies['access_token'];
    if (!token) {
      console.log('Customer Details Page - No access token found, redirecting to login');
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Construct the API URL
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000';
    console.log('Customer Details Page - Using API URL:', apiUrl);

    // Fetch customer data
    const response = await fetch(`${apiUrl}/api/customers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Customer Details Page - API response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      if (response.status === 404) {
        return {
          notFound: true,
        };
      }

      // Any other error
      return {
        props: {
          error: `Failed to load customer: ${response.statusText}`,
          customer: null,
          orders: [],
          totalSpent: 0,
          orderCount: 0,
        },
      };
    }

    // Parse the JSON data
    const data = await response.json();
    console.log('Customer Details Page - Successfully loaded customer data');

    return {
      props: {
        customer: data.customer,
        orders: data.orders || [],
        totalSpent: data.totalSpent || 0,
        orderCount: data.orderCount || 0,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        error: 'An error occurred while loading customer details',
        customer: null,
        orders: [],
        totalSpent: 0,
        orderCount: 0,
      },
    };
  }
};
