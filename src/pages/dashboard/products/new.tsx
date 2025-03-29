import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductForm from '@/components/products/ProductForm';
import { useProductsStore } from '@/store/products';
import api from '@/lib/api';
import { ProductType } from '@/types';

export default function NewProductPage({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { createProduct, isLoading } = useProductsStore();

  const handleSubmit = async (productData: Partial<ProductType>) => {
    try {
      setError(null);
      const product = await createProduct(productData);

      if (product) {
        router.push('/dashboard/products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product. Please try again.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Add New Product | Inventory Dashboard</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Product</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <ProductForm
            onSubmit={handleSubmit}
            categories={categories}
            isLoading={isLoading}
            buttonText="Create Product"
          />
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;

  try {
    // Forward cookies from the client request
    const cookies = req.headers.cookie || '';

    // Fetch categories for the form
    const categoriesData = await api.get('/api/products/categories', undefined, {
      headers: {
        Cookie: cookies,
      },
    });

    return {
      props: {
        categories: categoriesData.categories || [],
      },
    };
  } catch (error) {
    console.error('Error fetching categories:', error);

    return {
      props: {
        categories: [],
      },
    };
  }
};
