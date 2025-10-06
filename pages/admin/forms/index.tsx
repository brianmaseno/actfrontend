import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../components/AuthGuard';
import { formsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Form {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  submission_count: number;
}

export default function AdminFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchForms();
  }, [filter]);

  const fetchForms = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await formsAPI.getAllForms(params);
      setForms(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await formsAPI.deleteForm(Number(id));
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await formsAPI.activateForm(Number(id));
      toast.success('Form activated successfully');
      fetchForms();
    } catch (error) {
      toast.error('Failed to activate form');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await formsAPI.archiveForm(Number(id));
      toast.success('Form archived successfully');
      fetchForms();
    } catch (error) {
      toast.error('Failed to archive form');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Forms Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Create and manage onboarding forms
                </p>
              </div>
              <Link
                href="/admin/forms/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Form
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="sm:hidden">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Forms</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex space-x-4">
                {['all', 'active', 'draft', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-2 font-medium text-sm rounded-md ${
                      filter === status
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Forms List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-500">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new form.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/forms/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create New Form
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {forms.map((form) => (
                  <li key={form.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {form.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {form.description}
                          </p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                form.status
                              )}`}
                            >
                              {form.status}
                            </span>
                            <span className="ml-4">
                              Category: {form.category}
                            </span>
                            <span className="ml-4">
                              Submissions: {form.submission_count || 0}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          {form.status === 'draft' && (
                            <button
                              onClick={() => handleActivate(form.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Activate
                            </button>
                          )}
                          {form.status === 'active' && (
                            <button
                              onClick={() => handleArchive(form.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Archive
                            </button>
                          )}
                          <Link
                            href={`/admin/forms/${form.id}/edit`}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(form.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
