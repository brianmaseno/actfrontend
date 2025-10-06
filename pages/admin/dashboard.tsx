import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { formsAPI, submissionsAPI } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Eye,
  XCircle,
  PlusCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>({});
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, submissionsResponse] = await Promise.all([
        submissionsAPI.getSubmissionStats(),
        submissionsAPI.getAllSubmissions({ page_size: 5 }),
      ]);
      setStats(statsResponse.data);
      setRecentSubmissions(submissionsResponse.data.results);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  return (
    <AuthGuard requiredRole="admin">
      <Head>
        <title>Admin Dashboard - Onboarding Platform</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Enhanced Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-2 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      Admin Portal
                    </span>
                    <p className="text-xs text-gray-500">Management Dashboard</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/admin/forms" className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Manage Forms</span>
                </Link>
                <Link href="/admin/submissions" className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Submissions</span>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
              <span className="text-3xl">📊</span>
            </h1>
            <p className="text-gray-600 text-lg">Monitor submissions, manage forms, and track activity</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Enhanced Stats Grid with Animations */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
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
                  <div className="mt-4 flex items-center text-xs text-blue-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Active tracking</span>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-100 font-medium">Pending Review</p>
                      <p className="text-4xl font-bold mt-2">{stats.pending || 0}</p>
                      <p className="text-xs text-yellow-100 mt-1">Needs attention</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full animate-pulse">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-yellow-100">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Action required</span>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
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
                  <div className="mt-4 flex items-center text-xs text-purple-100">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    <span>Being processed</span>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100 font-medium">Approved</p>
                      <p className="text-4xl font-bold mt-2">{stats.approved || 0}</p>
                      <p className="text-xs text-green-100 mt-1">
                        Success: {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-green-100">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Completed</span>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-100 font-medium">Rejected</p>
                      <p className="text-4xl font-bold mt-2">{stats.rejected || 0}</p>
                      <p className="text-xs text-red-100 mt-1">Declined</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <XCircle className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-red-100">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Review reasons</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Recent Submissions Table */}
              <div className="card shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Activity className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Recent Submissions</h2>
                  </div>
                  <Link href="/admin/submissions" className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <span>→</span>
                  </Link>
                </div>

                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No submissions yet</p>
                    <p className="text-gray-500 text-sm">Submissions will appear here once clients start filling forms</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300 bg-gray-50">
                          <th className="text-left py-4 px-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Form</th>
                          <th className="text-left py-4 px-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Submitted By</th>
                          <th className="text-left py-4 px-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Status</th>
                          <th className="text-left py-4 px-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Date</th>
                          <th className="text-left py-4 px-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSubmissions.map((submission, index) => (
                          <tr key={submission.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="font-semibold text-gray-900">{submission.form_title}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="bg-primary-100 p-2 rounded-full">
                                  <Users className="h-4 w-4 text-primary-600" />
                                </div>
                                <span className="text-gray-700">{submission.user_name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`badge ${getStatusColor(submission.status)} flex items-center space-x-1 w-fit`}>
                                {submission.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                                {submission.status === 'pending' && <Clock className="h-3 w-3" />}
                                {submission.status === 'under_review' && <Eye className="h-3 w-3" />}
                                {submission.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                <span>{submission.status.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {new Date(submission.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4">
                              <Link
                                href={`/admin/submissions/${submission.id}`}
                                className="btn btn-sm btn-primary flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Review</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Enhanced Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Link href="/admin/forms/new" className="card hover:scale-105 transition-all shadow-lg hover:shadow-2xl text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="bg-blue-500 text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <PlusCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Create New Form</h3>
                  <p className="text-gray-600">Build a custom onboarding form with flexible fields and validation rules</p>
                </Link>

                <Link href="/admin/submissions?status=pending" className="card hover:scale-105 transition-all shadow-lg hover:shadow-2xl text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                  <div className="bg-yellow-500 text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
                    <Clock className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Review Pending ({stats.pending || 0})</h3>
                  <p className="text-gray-600">Review and approve pending form submissions that need attention</p>
                </Link>

                <Link href="/admin/submissions?status=approved" className="card hover:scale-105 transition-all shadow-lg hover:shadow-2xl text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="bg-green-500 text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">View Reports</h3>
                  <p className="text-gray-600">Analyze submission trends and export data for reporting purposes</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
