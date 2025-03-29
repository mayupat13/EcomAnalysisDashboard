import { useState, useEffect } from 'react';
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
  initialCustomers: CustomerType[];
  totalCount: number;
  error?: string;
}

export default function CustomersPage({ initialCustomers, totalCount, error }: CustomersPageProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerType[]>(initialCustomers || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initialize customers from props
  useEffect(() => {
    if (initialCustomers?.length > 0) {
      setCustomers(initialCustomers);
    }
  }, [initialCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/dashboard/customers',
      query: {
        ...(searchTerm && { q: searchTerm }),
        page: 1,
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push({
      pathname: '/dashboard/customers',
      query: {
        ...(searchTerm && { q: searchTerm }),
        page,
      },
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
          <p className="text-gray-600 dark:text-gray-300">Manage your customers</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
  const { req } = context;

  // Check for access token in cookies
  const token = req.cookies['access_token'];
  console.log(
    'Customers Page - Server-side token check:',
    token ? 'Token present' : 'No token found',
  );

  if (!token) {
    console.log('Customers Page - No access token found, redirecting to login');
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
    console.log('Customers Page - Using API URL:', apiUrl);

    // Fetch customers data
    const customersResponse = await fetch(`${apiUrl}/api/customers?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '',
      },
      credentials: 'include',
    });

    console.log('Customers Page - API response status:', customersResponse.status);

    if (!customersResponse.ok) {
      if (customersResponse.status === 401) {
        console.log('Customers Page - Authentication failed, redirecting to login');
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      // Log the error but don't throw
      console.error(`Customers Page - Failed to fetch customers: ${customersResponse.statusText}`);

      // Return empty data instead of throwing an error
      return {
        props: {
          initialCustomers: [],
          totalCount: 0,
          error: `Failed to load customers: ${customersResponse.statusText}`,
        },
      };
    }

    const customersData = await customersResponse.json();
    console.log('Customers Page - Successfully loaded customers data');

    return {
      props: {
        initialCustomers: customersData.customers || [],
        totalCount: customersData.totalCount || 0,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialCustomers: [],
        totalCount: 0,
        error: 'An error occurred while loading customers',
      },
    };
  }
};
