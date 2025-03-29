import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Header from './Header';
import authService from '@/lib/authService';

// Create an authentication context
export const AuthContext = createContext<{ isAuthenticated: boolean }>({
  isAuthenticated: false,
});

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthPage =
    router.pathname === '/login' || router.pathname === '/register' || router.pathname === '/';

  // Check authentication status on every route change
  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getAccessToken();
      console.log(`Layout auth check - path: ${router.pathname}, token present:`, !!token);

      if (!token) {
        return false;
      }

      try {
        // Verify token is valid
        const tokenData = authService.parseToken(token);
        const isExpired = authService.isTokenExpired(token);
        console.log('Layout auth check - token expired:', isExpired);

        if (!tokenData || isExpired) {
          console.log('Layout auth check - clearing invalid token');
          authService.clearTokens();
          return false;
        }
        console.log('Layout auth check - valid token for:', tokenData.email);
        return true;
      } catch (error) {
        console.error('Error verifying token:', error);
        authService.clearTokens();
        return false;
      }
    };

    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);

    // Redirect to login if not authenticated on protected pages
    if (!authStatus && !isAuthPage && !isRedirecting) {
      console.log(
        `Layout auth check - redirecting to login due to no auth, current path: ${router.pathname}`,
      );
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [router.pathname, isAuthPage, isRedirecting, router]);

  // Show only the children for authentication pages
  if (isAuthPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>;
  }

  // For dashboard and other authenticated pages
  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
