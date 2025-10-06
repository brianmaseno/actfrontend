import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'client';
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes and redirect unauthorized users
 * 
 * Usage:
 * <AuthGuard requiredRole="admin">
 *   <AdminDashboard />
 * </AuthGuard>
 */
export default function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Wait for initial auth check to complete
    if (!isInitialized || isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      router.replace(redirectTo || '/auth/login');
      return;
    }

    // Check role-based access
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on actual role
      const targetPath = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      router.replace(targetPath);
      return;
    }
  }, [isAuthenticated, user, requiredRole, router, redirectTo, isLoading, isInitialized]);

  // Show loading state while initializing or checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700 text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If initialized but not authenticated, show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700 text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role mismatch
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700 text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
