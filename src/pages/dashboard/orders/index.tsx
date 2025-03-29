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
}

export default function OrdersPage({ orders, totalCount, statuses }: OrdersPageProps) {
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
        page: 1
      }
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    router.push({
      pathname: '/dashboard/orders',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(e.target.value && { status: e.target.value }),
        page: 1
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push({
      pathname: '/dashboard/orders',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        page
      }
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
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
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
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { q, status, page = 1 } = context.query;
  const itemsPerPage = 10;
  const skip = (Number(page) - 1) * itemsPerPage;

  await dbConnect();

  // Build query
  const query: any = {};
  if (q) {
    query.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'customerDetails.name': { $regex: q, $options: 'i' } },
      { 'customerDetails.email': { $regex: q, $options: 'i' } }
    ];
  }
  if (status) {
    query.status = status;
  }

  // Get orders
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(itemsPerPage)
    .populate('customer', 'name email')
    .lean();

  // Get total count
  const totalCount = await Order.countDocuments(query);

  // Get all statuses
  const allStatuses = await Order.distinct('status');

  return {
    props: {
      orders: JSON.parse(JSON.stringify(orders)),
      totalCount,
      statuses: allStatuses,
    },
  };
};
