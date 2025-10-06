import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '../../store/authStore';
import { LogIn } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state: any) => state.login);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/client/forms');
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <>
      <Head>
        <title>Login - Onboarding Platform</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card animate-fade-in">
            <div className="text-center mb-8">
              <LogIn className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  className="input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-gray-600 hover:text-gray-700 text-sm">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
