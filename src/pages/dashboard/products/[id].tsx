import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductForm from '@/components/products/ProductForm';
import { useProductsStore } from '@/store/products';
import api from '@/lib/api';
import { ProductType } from '@/types';

interface ProductPageProps {
  productId: string;
  categories: string[];
}

export default function ProductPage({ productId, categories }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getProduct, updateProduct, isLoading } = useProductsStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(productId);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      }
    };

    fetchProduct();
  }, [productId, getProduct]);

  const handleSubmit = async (productData: Partial<ProductType>) => {
    try {
      setError(null);
      const updatedProduct = await updateProduct(productId, productData);

      if (updatedProduct) {
        router.push('/dashboard/products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    }
  };

  if (!product && !error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{product ? `Edit ${product.name}` : 'Edit Product'} | Inventory Dashboard</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {product ? `Edit ${product.name}` : 'Edit Product'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            {error}
          </div>
        )}

        {product && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <ProductForm
              initialData={product}
              onSubmit={handleSubmit}
              categories={categories}
              isLoading={isLoading}
              buttonText="Update Product"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  try {
    // Fetch categories for the form
    const categoriesData = await api.get('/api/products/categories');

    return {
      props: {
        productId: id,
        categories: categoriesData.categories || [],
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    return {
      props: {
        productId: id,
        categories: [],
      },
    };
  }
};
