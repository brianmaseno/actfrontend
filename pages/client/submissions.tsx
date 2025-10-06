import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { submissionsAPI } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientSubmissions() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await submissionsAPI.getMySubmissions(params);
      setSubmissions(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { color: 'badge-warning', icon: Clock, text: 'Pending' },
      approved: { color: 'badge-success', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'badge-error', icon: XCircle, text: 'Rejected' },
      under_review: { color: 'badge-info', icon: Clock, text: 'Under Review' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`badge ${badge.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <AuthGuard requiredRole="client">
      <Head>
        <title>My Submissions - Client Portal</title>
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
                <Link href="/client/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link href="/client/forms" className="text-gray-700 hover:text-primary-600">
                  Available Forms
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
            <p className="text-gray-600">Track the status of your form submissions</p>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                className="input max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No submissions yet</p>
              <Link href="/client/forms" className="btn btn-primary">
                Browse Forms
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.form?.title || 'Unknown Form'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/client/submissions/${submission.id}`}
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
