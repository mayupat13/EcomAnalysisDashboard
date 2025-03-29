import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import SalesChart from '@/components/dashboard/SalesChart';
import Table from '@/components/ui/Table';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

interface AnalyticsPageProps {
  revenueData: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    _id: string;
    name: string;
    totalRevenue: number;
    totalSold: number;
  }[];
  topCustomers: {
    _id: string;
    name: string;
    totalSpent: number;
    orderCount: number;
  }[];
  conversionRate: number;
  averageOrderValue: number;
  error?: string;
}

export default function AnalyticsPage({
  revenueData,
  topProducts,
  topCustomers,
  conversionRate,
  averageOrderValue,
  error,
}: AnalyticsPageProps) {
  return (
    <Layout>
      <Head>
        <title>Analytics | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Overview of your store's performance</p>
          </div>
          {/* Date range selector could go here */}
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue (30 days)</p>
                <h3 className="text-2xl font-bold">
                  ${revenueData.data.reduce((sum, val) => sum + val, 0).toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              ↑ 12.5% from last month
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <h3 className="text-2xl font-bold">{conversionRate.toFixed(2)}%</h3>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">↑ 3.2% from last month</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</p>
                <h3 className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</h3>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">↑ 5.7% from last month</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Repeat Customers</p>
                <h3 className="text-2xl font-bold">42.8%</h3>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">↑ 8.3% from last month</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Revenue (Last 30 Days)</h2>
              </div>
              <div className="p-4">
                <SalesChart data={revenueData} />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Top Selling Products</h2>
            </div>
            <div className="p-4">
              <Table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.totalSold}</td>
                      <td>${product.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Top Customers</h2>
            </div>
            <div className="p-4">
              <Table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.orderCount}</td>
                      <td>${customer.totalSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  // Check for access token in cookies
  const token = req.cookies['access_token'];
  console.log(
    'Analytics Page - Server-side token check:',
    token ? 'Token present' : 'No token found',
  );

  if (!token) {
    console.log('Analytics Page - No access token found, redirecting to login');
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
    console.log('Analytics Page - Using API URL:', apiUrl);

    // Fetch sales analytics data
    const salesResponse = await fetch(`${apiUrl}/api/analytics/sales`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Analytics Page - Sales API response status:', salesResponse.status);

    if (!salesResponse.ok) {
      if (salesResponse.status === 401) {
        console.log('Analytics Page - Authentication failed, redirecting to login');
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      // Log the error but don't throw
      console.error(
        `Analytics Page - Failed to fetch sales analytics: ${salesResponse.statusText}`,
      );

      // Return empty data instead of throwing an error
      return {
        props: {
          revenueData: { labels: [], data: [] },
          topProducts: [],
          topCustomers: [],
          conversionRate: 0,
          averageOrderValue: 0,
          error: `Failed to load analytics data: ${salesResponse.statusText}`,
        },
      };
    }

    const salesData = await salesResponse.json();
    console.log('Analytics Page - Successfully loaded sales data');

    // Prepare revenue data for use
    const revenueData = {
      labels: salesData.labels || [],
      data: salesData.revenue || [],
    };

    // Fetch product analytics data with proper error handling
    const productsResponse = await fetch(`${apiUrl}/api/analytics/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Analytics Page - Products API response status:', productsResponse.status);

    if (!productsResponse.ok) {
      console.error(
        `Analytics Page - Failed to fetch product analytics: ${productsResponse.statusText}`,
      );

      // Continue with sales data but note the product data error
      return {
        props: {
          revenueData,
          topProducts: [],
          topCustomers: salesData.topCustomers || [],
          conversionRate: salesData.conversionRate || 0,
          averageOrderValue: salesData.averageOrderValue || 0,
          error: `Unable to load product analytics: ${productsResponse.statusText}`,
        },
      };
    }

    const productsData = await productsResponse.json();

    // Prepare data for the component
    const topProducts = productsData.topSellingProducts || [];
    const topCustomers = salesData.topCustomers || [];
    const conversionRate = salesData.conversionRate || 0;
    const averageOrderValue = salesData.averageOrderValue || 0;

    return {
      props: {
        revenueData,
        topProducts,
        topCustomers,
        conversionRate,
        averageOrderValue,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        revenueData: { labels: [], data: [] },
        topProducts: [],
        topCustomers: [],
        conversionRate: 0,
        averageOrderValue: 0,
        error: 'An error occurred while loading analytics data',
      },
    };
  }
};
