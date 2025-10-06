import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize authentication state on app load
    // This will validate the token and set proper auth state
    initialize();
  }, [initialize]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
