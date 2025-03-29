import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { useThemeStore } from '@/store/theme';
import axios from 'axios';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface SettingsPageProps {
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

type UserForm = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SettingsPage({ user }: SettingsPageProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<UserForm>({
    defaultValues: {
      name: user.name,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const handleProfileUpdate = async (data: UserForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`/api/users/${user._id}`, {
        name: data.name,
        email: data.email,
      });

      setSuccess('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: UserForm) => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await axios.put(`/api/users/${user._id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordSuccess('Password updated successfully');
      reset({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Layout>
      <Head>
        <title>Settings | eCommerce Control Panel</title>
      </Head>
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Profile Information</h2>
              </div>
              <div className="p-6">
                {error && <Alert type="error" message={error} className="mb-6" />}
                {success && <Alert type="success" message={success} className="mb-6" />}

                <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      error={errors.name?.message}
                    />
                  </div>

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
                    />
                  </div>

                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                </form>
              </div>
            </Card>

            <Card className="mt-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Change Password</h2>
              </div>
              <div className="p-6">
                {passwordError && <Alert type="error" message={passwordError} className="mb-6" />}
                {passwordSuccess && (
                  <Alert type="success" message={passwordSuccess} className="mb-6" />
                )}

                <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register('currentPassword', { required: 'Current password is required' })}
                      error={errors.currentPassword?.message}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters long',
                        },
                      })}
                      error={errors.newPassword?.message}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === newPassword || 'Passwords do not match',
                      })}
                      error={errors.confirmPassword?.message}
                    />
                  </div>

                  <Button type="submit" isLoading={passwordLoading}>
                    Update Password
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Toggle theme</span>
                    <span
                      className={`${
                        theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                      } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">Account Information</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p>{user.email}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account Created
                  </h3>
                  <p>December 12, 2023</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Login
                  </h3>
                  <p>Today, 10:30 AM</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
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

  await dbConnect();

  // Get user data from token instead of session
  try {
    const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const email = tokenData.email;

    if (!email) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Get user data
    const user = await User.findOne({ email }).select('name email').lean();

    if (!user) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
