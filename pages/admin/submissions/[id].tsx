import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthGuard from '../../../components/AuthGuard';
import { submissionsAPI } from '../../../lib/api';
import { ArrowLeft, FileText, User, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubmissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getAdminSubmission(id as string);
      setSubmission(response.data);
      setStatus(response.data.status);
      setAdminNotes(response.data.admin_notes || '');
    } catch (error) {
      toast.error('Failed to load submission');
      router.push('/admin/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmission = async () => {
    try {
      setUpdating(true);
      await submissionsAPI.updateSubmissionStatus(id as string, {
        status,
        admin_notes: adminNotes,
      });
      toast.success('Submission updated successfully');
      fetchSubmission();
    } catch (error) {
      toast.error('Failed to update submission');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (statusValue: string) => {
    const statusMap: any = {
      pending: {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock,
        text: 'Pending Review',
        description: 'This submission is waiting to be reviewed.'
      },
      under_review: {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: AlertCircle,
        text: 'Under Review',
        description: 'This submission is currently being reviewed.'
      },
      approved: {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle,
        text: 'Approved',
        description: 'This submission has been approved.'
      },
      rejected: {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: XCircle,
        text: 'Rejected',
        description: 'This submission has been rejected.'
      },
    };
    return statusMap[statusValue] || statusMap.pending;
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading submission...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!submission) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Submission not found</p>
            <Link href="/admin/submissions" className="btn btn-primary">
              Back to Submissions
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const statusInfo = getStatusInfo(submission.status);
  const StatusIcon = statusInfo.icon;

  return (
    <AuthGuard requiredRole="admin">
      <Head>
        <title>Review Submission - Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/admin/submissions" className="flex items-center text-gray-700 hover:text-primary-600">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Submissions
                </Link>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleUpdateSubmission}
                  disabled={updating}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submission Info */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {submission.form?.title || 'Form Submission'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {submission.user?.username || submission.user?.email || 'Unknown User'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(submission.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Form Data */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Information</h2>
                  <div className="space-y-4">
                    {submission.data && Object.entries(submission.data).map(([key, value]: [string, any]) => (
                      <div key={key} className="border-b pb-4 last:border-b-0">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value?.toString() || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Files (if any) */}
                {submission.files && submission.files.length > 0 && (
                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Attached Files</h2>
                    <div className="space-y-3">
                      {submission.files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{file.original_filename}</p>
                            <p className="text-sm text-gray-500">{file.file_size_mb} MB</p>
                          </div>
                          <a
                            href={file.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Review Panel */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className={`rounded-lg p-6 border-2 ${statusInfo.color}`}>
                <div className="flex items-start">
                  <StatusIcon className="h-6 w-6 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold mb-1">{statusInfo.text}</h3>
                    <p className="text-sm opacity-90">{statusInfo.description}</p>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Review Submission</h2>
                
                {/* Status Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Admin Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                    placeholder="Add notes about this submission (visible to the user)..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    These notes will be visible to the user who submitted the form.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setStatus('approved');
                      setTimeout(handleUpdateSubmission, 100);
                    }}
                    disabled={updating}
                    className="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setStatus('rejected');
                      setTimeout(handleUpdateSubmission, 100);
                    }}
                    disabled={updating}
                    className="w-full btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>

              {/* Submission History */}
              {submission.reviewed_by && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Review History</h2>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-600">Reviewed by:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {submission.reviewed_by.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reviewed at:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(submission.reviewed_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
