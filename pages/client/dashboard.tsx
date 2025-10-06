import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { formsAPI, submissionsAPI } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  PlusCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, formsResponse] = await Promise.all([
        submissionsAPI.getMySubmissions({ page_size: 5 }),
        formsAPI.getPublicForms({ page_size: 4 }),
      ]);
      
      const submissions = submissionsResponse.data.results;
      setMySubmissions(submissions);
      setAvailableForms(formsResponse.data.results);
      
      // Calculate stats
      const stats = {
        total: submissions.length,
        pending: submissions.filter((s: any) => s.status === 'pending').length,
        approved: submissions.filter((s: any) => s.status === 'approved').length,
        rejected: submissions.filter((s: any) => s.status === 'rejected').length,
        under_review: submissions.filter((s: any) => s.status === 'under_review').length,
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'under_review':
        return <Eye className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      under_review: 'badge-info',
    };
    return colors[status] || 'badge-info';
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <AuthGuard requiredRole="client">
      <Head>
        <title>Client Dashboard - Onboarding Platform</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-2 rounded-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      Client Portal
                    </span>
                    <p className="text-xs text-gray-500">Welcome back, {user?.first_name || user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/client/forms" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Browse Forms
                </Link>
                <Link href="/client/submissions" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
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
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {user?.first_name || 'User'}! 👋
                </h1>
                <p className="text-gray-600 text-lg">Track your submissions and complete new forms</p>
              </div>
              <Link 
                href="/client/forms" 
                className="btn btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                <span>New Submission</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 font-medium">Total Submissions</p>
                      <p className="text-4xl font-bold mt-2">{stats.total || 0}</p>
                      <p className="text-xs text-blue-100 mt-1">All time</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-100 font-medium">Pending</p>
                      <p className="text-4xl font-bold mt-2">{stats.pending || 0}</p>
                      <p className="text-xs text-yellow-100 mt-1">Awaiting review</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100 font-medium">Under Review</p>
                      <p className="text-4xl font-bold mt-2">{stats.under_review || 0}</p>
                      <p className="text-xs text-purple-100 mt-1">In progress</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <Eye className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100 font-medium">Approved</p>
                      <p className="text-4xl font-bold mt-2">{stats.approved || 0}</p>
                      <p className="text-xs text-green-100 mt-1">Success rate: {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-100 font-medium">Rejected</p>
                      <p className="text-4xl font-bold mt-2">{stats.rejected || 0}</p>
                      <p className="text-xs text-red-100 mt-1">Needs attention</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <XCircle className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Submissions */}
                <div className="lg:col-span-2">
                  <div className="card shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Submissions</h2>
                      </div>
                      <Link href="/client/submissions" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                        <span>View All</span>
                        <span>→</span>
                      </Link>
                    </div>

                    {mySubmissions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-4">No submissions yet</p>
                        <Link href="/client/forms" className="btn btn-primary">
                          Browse Available Forms
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mySubmissions.map((submission) => (
                          <div 
                            key={submission.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-white"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  {getStatusIcon(submission.status)}
                                  <h3 className="font-bold text-lg text-gray-900">{submission.form_title}</h3>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(submission.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}</span>
                                  </div>
                                  <span className={`badge ${getStatusColor(submission.status)}`}>
                                    {getStatusText(submission.status)}
                                  </span>
                                </div>
                                {submission.admin_notes && (
                                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                                    <p className="text-sm text-blue-900">
                                      <strong>Admin Notes:</strong> {submission.admin_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Link
                                href={`/client/submissions/${submission.id}`}
                                className="btn btn-sm btn-secondary ml-4"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Available Forms Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats Card */}
                  <div className="card shadow-lg bg-gradient-to-br from-primary-600 to-purple-600 text-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="h-6 w-6" />
                      <h3 className="text-xl font-bold">Your Progress</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white text-opacity-90">Completion Rate</span>
                        <span className="text-2xl font-bold">
                          {stats.total ? Math.round(((stats.approved + stats.rejected + stats.under_review) / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${stats.total ? ((stats.approved + stats.rejected + stats.under_review) / stats.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-white text-opacity-80">
                        {stats.pending > 0 && `${stats.pending} submission${stats.pending > 1 ? 's' : ''} pending review`}
                      </p>
                    </div>
                  </div>

                  {/* Available Forms */}
                  <div className="card shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold">Available Forms</h3>
                    </div>
                    {availableForms.length === 0 ? (
                      <p className="text-gray-600 text-center py-6">No forms available</p>
                    ) : (
                      <div className="space-y-3">
                        {availableForms.map((form) => (
                          <Link
                            key={form.id}
                            href={`/client/forms/${form.id}`}
                            className="block border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all bg-white group"
                          >
                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                              {form.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {form.description}
                            </p>
                            {form.category && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {form.category}
                              </span>
                            )}
                          </Link>
                        ))}
                        <Link 
                          href="/client/forms" 
                          className="block text-center text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                        >
                          View All Forms →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Help Card */}
                  <div className="card shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                      <h3 className="text-lg font-bold text-orange-900">Need Help?</h3>
                    </div>
                    <p className="text-sm text-orange-800 mb-3">
                      If you have questions about a form or submission, contact our support team.
                    </p>
                    <button className="btn btn-sm w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
