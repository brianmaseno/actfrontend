import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { formsAPI } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { FileText, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientForms() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchForms();
  }, [categoryFilter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await formsAPI.getPublicForms(params);
      setForms(response.data.results);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchForms();
  };

  return (
    <AuthGuard requiredRole="client">
      <Head>
        <title>Available Forms - Client Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold">Client Portal</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/client/submissions" className="text-gray-700 hover:text-primary-600">
                  My Submissions
                </Link>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="btn btn-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Forms</h1>
            <p className="text-gray-600">Select a form to fill out and submit</p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search forms..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div>
                <select
                  className="input"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="kyc">KYC</option>
                  <option value="loan">Loan Application</option>
                  <option value="investment">Investment</option>
                  <option value="account">Account Opening</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Forms Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No forms available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div key={form.id} className="card hover:scale-105 transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{form.title}</h3>
                    <span className="badge badge-info">{form.category.toUpperCase()}</span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{form.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{form.field_count} fields</span>
                  </div>
                  <Link
                    href={`/client/forms/${form.id}`}
                    className="btn btn-primary w-full"
                  >
                    Fill Form
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
