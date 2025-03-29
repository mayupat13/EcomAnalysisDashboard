import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import ProductList from '@/components/products/ProductList';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useProductsStore } from '@/store/products';

export default function ProductsPage() {
  const router = useRouter();
  const { q, category, page = '1' } = router.query;
  const [searchTerm, setSearchTerm] = useState((q as string) || '');
  const [selectedCategory, setSelectedCategory] = useState((category as string) || '');
  const currentPage = Number(page) || 1;
  const itemsPerPage = 10;

  const { products, fetchProducts, isLoading, error, categories, fetchCategories } =
    useProductsStore();

  useEffect(() => {
    // Fetch categories on component mount
    fetchCategories();
    // Remove fetchCategories from dependencies - it shouldn't change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch products when the router query parameters change
    const fetchData = async () => {
      await fetchProducts({
        q: q || '',
        category: category || '',
        page: currentPage,
        limit: itemsPerPage,
      });
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, currentPage, itemsPerPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/dashboard/products',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        page: 1,
      },
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    router.push({
      pathname: '/dashboard/products',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(value && { category: value }),
        page: 1,
      },
    });
  };

  const handlePageChange = (page: number) => {
    router.push({
      pathname: '/dashboard/products',
      query: {
        ...(searchTerm && { q: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        page,
      },
    });
  };

  return (
    <Layout>
      <Head>
        <title>Products | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your product inventory</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard/products/new" className="inline-block">
              <Button>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onChange={handleCategoryChange}>
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>
        )}

        <ProductList
          products={products}
          currentPage={currentPage}
          totalPages={Math.ceil(products.length / itemsPerPage)}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check for access token in cookies directly
  const token = context.req.cookies['access_token'];

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
