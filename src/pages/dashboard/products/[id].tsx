import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductForm from '@/components/products/ProductForm';
import { useProductsStore } from '@/store/products';
import api from '@/lib/api';
import { ProductType } from '@/types';
import authService from '@/lib/authService';

interface ProductPageProps {
  initialProduct: ProductType | null;
  initialCategories: string[];
}

export default function ProductPage({ initialProduct, initialCategories }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductType | null>(initialProduct);
  const [error, setError] = useState<string | null>(null);
  const { updateProduct, isLoading } = useProductsStore();

  useEffect(() => {
    // Initialize product from server-side props
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }

    // Check if we're authenticated before fetching data
    const token = authService.getAccessToken();
    if (!token) {
      console.log('No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    // Fetch product data if not provided by server
    const fetchProduct = async () => {
      try {
        const productId = router.query.id as string;
        if (!productId) {
          setError('Product ID is required');
          return;
        }

        const response = await fetch(`/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include', // Include cookies in the request
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('Unauthorized, redirecting to login');
            router.push('/login');
            return;
          }
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      }
    };

    fetchProduct();
  }, [initialProduct, router.query.id]);

  const handleSubmit = async (productData: Partial<ProductType>) => {
    try {
      setError(null);
      const productId = router.query.id as string;
      if (!productId) {
        setError('Product ID is required');
        return;
      }

      const token = authService.getAccessToken();
      if (!token) {
        console.log('No auth token found, redirecting to login');
        router.push('/login');
        return;
      }

      const updatedProduct = await updateProduct(productId, productData);

      if (updatedProduct) {
        router.push('/dashboard/products');
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
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
              categories={initialCategories}
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
  const { req, params } = context;
  const id = params?.id as string;

  if (!id) {
    return {
      notFound: true,
    };
  }

  // Check for access token in cookies
  const token = req.cookies['access_token'];
  console.log('Server-side token check:', token ? 'Token present' : 'No token found');

  if (!token) {
    console.log('No access token found in cookies, redirecting to login');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Create a new axios instance for server-side requests
    const response = await fetch(
      `${process.env.API_URL || 'http://localhost:3000'}/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      },
    );

    console.log('Server-side response status:', response.status);
    console.log('Server-side response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server-side error response:', errorText);

      // If unauthorized, redirect to login
      if (response.status === 401) {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Server-side product data:', data);

    // Also fetch categories
    const categoriesResponse = await fetch(
      `${process.env.API_URL || 'http://localhost:3000'}/api/products/categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      },
    );

    if (!categoriesResponse.ok) {
      console.error('Failed to fetch categories:', categoriesResponse.statusText);
    }

    const categoriesData = await categoriesResponse.json();

    return {
      props: {
        initialProduct: data.product || null,
        initialCategories: categoriesData.categories || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    // If there's an error, redirect to the products list
    return {
      redirect: {
        destination: '/dashboard/products',
        permanent: false,
      },
    };
  }
};
