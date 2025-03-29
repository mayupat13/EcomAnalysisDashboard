import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import CustomerList from '@/components/customers/CustomerList';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { CustomerType } from '@/types';

interface CustomersPageProps {
  customers: CustomerType[];
  totalCount: number;
}

export default function CustomersPage({ customers, totalCount }: CustomersPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/dashboard/customers',
      query: {
        ...(searchTerm && { q: searchTerm }),
        page: 1
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push({
      pathname: '/dashboard/customers',
      query: {
        ...(searchTerm && { q: searchTerm }),
        page
      }
    });
  };

  return (
    <Layout>
      <Head>
        <title>Customers | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your customer database</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>

        <CustomerList 
          customers={customers} 
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

  const { q, page = 1 } = context.query;
  const itemsPerPage = 10;
  const skip = (Number(page) - 1) * itemsPerPage;

  await dbConnect();

  // Build query
  const query: any = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ];
  }

  // Get customers
  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(itemsPerPage)
    .lean();

  // Get total count
  const totalCount = await Customer.countDocuments(query);

  return {
    props: {
      customers: JSON.parse(JSON.stringify(customers)),
      totalCount,
    },
  };
};
