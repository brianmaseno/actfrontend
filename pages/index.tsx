import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    // Wait for initialization to complete
    if (!isInitialized) return;
    
    if (isAuthenticated && user) {
      const targetPath = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      router.push(targetPath);
    }
  }, [isAuthenticated, user, router, isInitialized]);

  return (
    <>
      <Head>
        <title>Onboarding Platform - Financial Services</title>
        <meta name="description" content="Dynamic onboarding form system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Show loading while initializing */}
      {!isInitialized ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
            <p className="text-gray-700 text-lg">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Onboarding Platform
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-gray-700">
                      Welcome, {user?.first_name || user?.username}!
                    </span>
                    <Link
                      href={user?.role === 'admin' ? '/admin/dashboard' : '/client/forms'}
                      className="btn btn-primary"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn btn-secondary">
                      Login
                    </Link>
                    <Link href="/auth/register" className="btn btn-primary">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
              Streamline Your <span className="text-primary-600">Onboarding Process</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A flexible, scalable platform for financial services onboarding. Create custom forms,
              manage submissions, and streamline your KYC, loan, and investment processes.
            </p>
            {!isAuthenticated && (
              <div className="flex justify-center space-x-4">
                <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                <Link href="/auth/login" className="btn btn-secondary text-lg px-8 py-3">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center animate-slide-up">
              <FileText className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Dynamic Forms</h3>
              <p className="text-gray-600">
                Create unlimited custom forms with flexible field types and validation rules
              </p>
            </div>

            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure admin and client portals with appropriate permissions
              </p>
            </div>

            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CheckCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Validation</h3>
              <p className="text-gray-600">
                Conditional field requirements and real-time validation
              </p>
            </div>

            <div className="card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Notifications</h3>
              <p className="text-gray-600">
                Asynchronous email notifications for admins and clients
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-10">Perfect For</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                <h3 className="text-xl font-bold mb-3 text-blue-900">KYC Processes</h3>
                <p className="text-blue-800">
                  Know Your Customer forms with document uploads and identity verification
                </p>
              </div>
              <div className="card bg-gradient-to-br from-green-50 to-green-100">
                <h3 className="text-xl font-bold mb-3 text-green-900">Loan Applications</h3>
                <p className="text-green-800">
                  Complex loan forms with conditional fields based on loan amount and type
                </p>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                <h3 className="text-xl font-bold mb-3 text-purple-900">Investment Declarations</h3>
                <p className="text-purple-800">
                  Secure investment onboarding with multi-step forms and document management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white mt-20 py-8 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
            <p>&copy; 2024 Onboarding Platform. Developed by Brian Mayoga</p>
          </div>
        </footer>
      </div>
      )}
    </>
  );
}
