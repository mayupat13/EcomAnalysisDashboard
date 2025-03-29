import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useState, useEffect, useContext } from 'react';
import authService from '@/lib/authService';
import { AuthContext } from './Layout';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Get user info from token if available
    const token = authService.getAccessToken();
    if (token) {
      try {
        const tokenData = authService.parseToken(token);
        if (tokenData) {
          setUser({
            name: tokenData.name || 'User',
            email: tokenData.email || 'user@example.com',
          });
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [router.pathname]);

  // Check if a route is active
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard' && router.pathname === '/dashboard') {
      return true;
    }
    // Special case for nested routes like /dashboard/orders/[id]
    if (route !== '/dashboard' && router.pathname.startsWith(route)) {
      return true;
    }
    return false;
  };

  // Handle link navigation with authentication check
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    console.log(`Sidebar - Navigation attempt to: ${href}`);

    if (!isAuthenticated) {
      console.log('Sidebar - Not authenticated, redirecting to login');
      authService.clearTokens();
      router.push('/login');
    } else {
      // Close sidebar on mobile if needed
      if (onClose) onClose();

      console.log(`Sidebar - Navigating to: ${href}`);

      // Extract base path and potential ID for better navigation
      const parts = href.split('/');
      const hasId = parts.length > 3 && parts[3] !== '';

      if (hasId) {
        console.log(`Sidebar - Path has ID: ${parts[3]}`);
        // Use router.push with proper Next.js route pattern for dynamic routes
        router.push(
          {
            pathname: `/${parts[1]}/${parts[2]}/[id]`,
            query: { id: parts[3] },
          },
          href,
        );
      } else {
        // Use simple path for non-dynamic routes
        router.push(href);
      }
    }
  };

  const handleSignOut = async () => {
    // Clear tokens and redirect to login
    authService.clearTokens();
    router.push('/login');
  };

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Close button for mobile */}
      {onClose && (
        <div className="absolute top-0 right-0 p-2 md:hidden">
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center justify-center py-6">
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">eCommerce</span>
      </div>

      {/* Nav items */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href="#"
              onClick={(e) => handleLinkClick(e, item.href)}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer
                ${
                  isActiveRoute(item.href)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* User and theme section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleSignOut}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
