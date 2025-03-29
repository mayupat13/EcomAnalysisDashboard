import { GetServerSideProps } from 'next';

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
    // Fetch product data
    const productResponse = await fetch(
      `${process.env.API_URL || 'http://localhost:3000'}/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error('Server-side error response:', errorText);
      throw new Error(`Failed to fetch product: ${productResponse.statusText}`);
    }

    const productData = await productResponse.json();

    // Fetch categories
    const categoriesResponse = await fetch(
      `${process.env.API_URL || 'http://localhost:3000'}/api/products/categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!categoriesResponse.ok) {
      const errorText = await categoriesResponse.text();
      console.error('Server-side error response:', errorText);
      throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
    }

    const categoriesData = await categoriesResponse.json();

    return {
      props: {
        initialProduct: productData.product || null,
        initialCategories: categoriesData.categories || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialProduct: null,
        initialCategories: [],
      },
    };
  }
};
