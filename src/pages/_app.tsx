import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useThemeStore } from '@/store/theme';
import '../styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const { theme, initializeTheme } = useThemeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Handle router events for loading states
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {loading && (
        <div className="fixed top-0 left-0 w-full h-0.5 bg-blue-500 z-50 animate-pulse" />
      )}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
