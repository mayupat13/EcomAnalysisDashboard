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
}

export default function AnalyticsPage({
  revenueData,
  topProducts,
  topCustomers,
  conversionRate,
  averageOrderValue,
}: AnalyticsPageProps) {
  return (
    <Layout>
      <Head>
        <title>Analytics | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">View insights and performance metrics</p>
        </div>

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
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  await dbConnect();

  // Generate revenue data for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const revenueData = {
    labels: last30Days.map((date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    data: await Promise.all(
      last30Days.map(async (date) => {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const dailyOrders = await Order.find({
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        }).select('totalAmount');

        return dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      }),
    ),
  };

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $project: {
        _id: 1,
        name: '$productDetails.name',
        totalSold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  // Get top customers
  const topCustomers = await Order.aggregate([
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerDetails',
      },
    },
    { $unwind: '$customerDetails' },
    {
      $project: {
        _id: 1,
        name: '$customerDetails.name',
        orderCount: 1,
        totalSpent: 1,
      },
    },
  ]);

  // Calculate conversion rate (simplified, normally would use visitor data)
  const totalOrders = await Order.countDocuments({});
  const totalVisitors = 5000; // Example value for demonstration
  const conversionRate = (totalOrders / totalVisitors) * 100;

  // Calculate average order value
  const allOrders = await Order.find({}).select('totalAmount');
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    props: {
      revenueData,
      topProducts: JSON.parse(JSON.stringify(topProducts)),
      topCustomers: JSON.parse(JSON.stringify(topCustomers)),
      conversionRate,
      averageOrderValue,
    },
  };
};
