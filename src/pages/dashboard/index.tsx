import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import RecentOrders from '@/components/dashboard/RecentOrders';
import SalesChart from '@/components/dashboard/SalesChart';
import StockAlerts from '@/components/dashboard/StockAlerts';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { OrderType, ProductType, SalesDataType, CustomerType, OrderItemType } from '@/types';
import api from '@/lib/api';
import authService from '@/lib/authService';
import { Types } from 'mongoose';
// Import sample data
import { products, customers, orders, salesData as mockSalesData, customerMap } from '@/data';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface DashboardProps {
  stats: DashboardStats;
  recentOrders: OrderType[];
  lowStockProducts: ProductType[];
  salesData: SalesDataType;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardProps>({
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    },
    recentOrders: [],
    lowStockProducts: [],
    salesData: { labels: [], data: [] },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await api.get('/api/dashboard/stats');
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const { stats, recentOrders, lowStockProducts, salesData } = dashboardData;

  return (
    <Layout>
      <Head>
        <title>Dashboard | File Analysis Dashboard</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to your File Analysis Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
            <p className="text-sm mt-1">Using fallback data instead.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Files"
                value={`${stats.totalProducts.toLocaleString()}`}
                change="+5.3%"
                icon={
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
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Processed Files"
                value={stats.totalOrders.toString()}
                change="+8.2%"
                icon={
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
                }
              />
              <StatCard
                title="Storage Used"
                value={`${stats.totalRevenue.toLocaleString()} MB`}
                change="+12.5%"
                icon={
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
                }
              />
              <StatCard
                title="Total Users"
                value={stats.totalCustomers.toString()}
                change="+15.7%"
                icon={
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SalesChart data={salesData} />
              </div>
              <div>
                <StockAlerts products={lowStockProducts} />
              </div>
            </div>

            <div className="mb-6">
              <RecentOrders orders={recentOrders} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check for access token in cookies
  const token = context.req.cookies['access_token'];

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    await dbConnect();

    // Get total stats - try to fetch from DB first or use sample data
    let totalProducts = 0;
    let totalOrders = 0;
    let totalCustomers = 0;
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    let lowStockProducts: any[] = [];

    try {
      // Attempt to get data from the database
      totalProducts = await Product.countDocuments({});
      totalOrders = await Order.countDocuments({});
      totalCustomers = await Customer.countDocuments({});

      // Calculate total revenue
      const dbOrders = await Order.find({}).select('totalAmount');
      totalRevenue = dbOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get recent orders
      const rawOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
        .populate('items.product', 'name price stock')
        .lean();

      // Deep-convert all MongoDB ObjectIds to strings
      recentOrders = JSON.parse(
        JSON.stringify(rawOrders, (key, value) => {
          // Convert any ObjectId to string
          if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
            return value.toString();
          }
          return value;
        }),
      );

      // Get low stock products
      const rawProducts = await Product.find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(5)
        .lean();

      // Convert all ObjectIds to strings
      lowStockProducts = JSON.parse(JSON.stringify(rawProducts));
    } catch (error) {
      console.error('Error fetching data from DB:', error);
      // If error or no data, we'll use the sample data
    }

    // If no data in DB, use sample data
    if (totalProducts === 0) {
      totalProducts = products.length;
      totalOrders = orders.length;
      totalCustomers = customers.length;
      totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      // Create sample data with string IDs - use simpler approach to avoid type errors
      recentOrders = orders.slice(0, 5).map((order) => {
        // Convert everything to plain objects with string IDs
        const plainOrder = JSON.parse(JSON.stringify(order));

        // Handle customer reference
        if (typeof plainOrder.customer === 'string') {
          // Find customer by ID
          const customer = customers.find((c) => c._id === plainOrder.customer);
          plainOrder.customer = customer
            ? JSON.parse(JSON.stringify(customer))
            : {
                _id: 'unknown',
                name: 'Unknown',
                email: 'unknown@example.com',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
        }

        // Ensure items have string IDs
        plainOrder.items = plainOrder.items.map((item: any) => {
          const plainItem = { ...item };

          // Make sure item has an ID
          if (!plainItem._id) {
            plainItem._id = `item_${Math.random().toString(36).substring(2, 9)}`;
          }

          // Handle product reference
          if (plainItem.product && typeof plainItem.product !== 'string') {
            plainItem.product = { ...plainItem.product };
          } else {
            plainItem.product = {
              _id: 'unknown',
              name: 'Unknown Product',
              price: 0,
              stock: 0,
            };
          }

          return plainItem;
        });

        return plainOrder;
      });

      lowStockProducts = products
        .filter((p) => p.stock < 10)
        .slice(0, 5)
        .map((product) => ({
          ...product,
          _id: String(product._id),
        }));
    }

    // Final check to ensure all data is serializable - remove any circular references
    return {
      props: {
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
        },
        recentOrders,
        lowStockProducts,
        salesData: mockSalesData,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
        },
        recentOrders: [],
        lowStockProducts: [],
        salesData: { labels: [], data: [] },
      },
    };
  }
};
