import { useEffect, useState } from 'react';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Custom error handler for NextAuth to prevent console errors
function customErrorHandler(error: Error) {
  // Filter out known NextAuth session errors
  if (
    error.message?.includes('CLIENT_FETCH_ERROR') ||
    error.message?.includes('/api/auth/session')
  ) {
    // Just log a minimal message without the full stack trace
    console.log('NextAuth session check:', error.message.substring(0, 50) + '...');
    return; // Prevent default error handling
  }

  // For all other errors, log them normally
  console.error('Application error:', error);
}

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  // Handle route change loading state
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // Override the default error handler to handle NextAuth session errors
    if (typeof window !== 'undefined') {
      const originalErrorHandler = window.onerror;
      window.onerror = function (msg, src, lineNo, colNo, error) {
        if (error) customErrorHandler(error);
        return originalErrorHandler ? originalErrorHandler(msg, src, lineNo, colNo, error) : false;
      };

      // Also catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason) customErrorHandler(event.reason);
      });
    }

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    // Using SessionProvider to enable use of useSession() hook but with error suppression
    <SessionProvider session={pageProps.session} refetchInterval={0} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="top-right" />
          {loading && (
            <div className="fixed top-0 left-0 w-full h-0.5 bg-blue-500 z-50 animate-pulse" />
          )}
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
