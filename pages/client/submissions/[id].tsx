import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { submissionsAPI } from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import { FileText, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getSubmission(id as string);
      setSubmission(response.data);
    } catch (error) {
      toast.error('Failed to load submission');
      router.push('/client/submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      pending: {
        color: 'text-yellow-600 bg-yellow-50',
        icon: Clock,
        text: 'Pending Review',
        description: 'Your submission is waiting to be reviewed by an administrator.'
      },
      under_review: {
        color: 'text-blue-600 bg-blue-50',
        icon: AlertCircle,
        text: 'Under Review',
        description: 'An administrator is currently reviewing your submission.'
      },
      approved: {
        color: 'text-green-600 bg-green-50',
        icon: CheckCircle,
        text: 'Approved',
        description: 'Your submission has been approved!'
      },
      rejected: {
        color: 'text-red-600 bg-red-50',
        icon: XCircle,
        text: 'Rejected',
        description: 'Your submission was not approved. See admin notes below for details.'
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="client">
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
      <AuthGuard requiredRole="client">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Submission not found</p>
            <Link href="/client/submissions" className="btn btn-primary">
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
    <AuthGuard requiredRole="client">
      <Head>
        <title>Submission Details - Client Portal</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/client/submissions" className="flex items-center text-gray-700 hover:text-primary-600">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Submissions
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Banner */}
          <div className={`rounded-lg p-6 mb-6 ${statusInfo.color}`}>
            <div className="flex items-start">
              <StatusIcon className="h-6 w-6 mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold mb-1">{statusInfo.text}</h3>
                <p className="text-sm opacity-90">{statusInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {submission.form?.title || 'Form Submission'}
              </h1>
              <p className="text-gray-600">
                Submitted on {new Date(submission.created_at).toLocaleString()}
              </p>
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
                    <p className="text-gray-900">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value?.toString() || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes (if rejected or reviewed) */}
            {submission.admin_notes && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.admin_notes}</p>
                </div>
                {submission.reviewed_by && (
                  <p className="text-sm text-gray-500 mt-2">
                    Reviewed by {submission.reviewed_by.username} on{' '}
                    {new Date(submission.reviewed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Files (if any) */}
          {submission.files && submission.files.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8">
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
    </AuthGuard>
  );
}
