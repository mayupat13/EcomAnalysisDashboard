import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import api from '@/lib/api';
import authService from '@/lib/authService';

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Check if user is already authenticated on client side
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', data, {
        requiresAuth: false, // This request doesn't require authentication
      });

      // Store tokens in cookies
      authService.setTokens(response.accessToken, response.refreshToken);

      // Get the callback URL from query parameters or default to dashboard
      const callbackUrl = (router.query.callbackUrl as string) || '/dashboard';
      router.push(callbackUrl);
    } catch (error: any) {
      setError(error.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Inventory Dashboard</title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              Inventory Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Sign in to your account</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            {error && <Alert type="error" message={error} className="mb-6" />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  error={errors.password?.message}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
