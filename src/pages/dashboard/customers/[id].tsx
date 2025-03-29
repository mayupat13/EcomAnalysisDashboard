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
}

export default function CustomerDetailPage({ 
  customer, 
  orders, 
  totalSpent,
  orderCount
}: CustomerDetailPageProps) {
  return (
    <Layout>
      <Head>
        <title>Customer Details | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Customer Details</h1>
          <p className="text-gray-600 dark:text-gray-300">View customer information and order history</p>
        </div>

        <CustomerDetails 
          customer={customer} 
          orders={orders} 
          totalSpent={totalSpent}
          orderCount={orderCount}
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

  const { id } = context.params as { id: string };

  await dbConnect();

  // Get customer
  const customer = await Customer.findById(id).lean();

  if (!customer) {
    return {
      notFound: true,
    };
  }

  // Get customer's orders
  const orders = await Order.find({ customer: id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Calculate total spent and order count
  const allOrders = await Order.find({ customer: id }).lean();
  const totalSpent = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const orderCount = allOrders.length;

  return {
    props: {
      customer: JSON.parse(JSON.stringify(customer)),
      orders: JSON.parse(JSON.stringify(orders)),
      totalSpent,
      orderCount,
    },
  };
};
