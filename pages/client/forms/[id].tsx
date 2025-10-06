import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { formsAPI, submissionsAPI } from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import { FileText, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FillForm() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [files, setFiles] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchForm();
    }
  }, [id]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await formsAPI.getPublicForm(id as string);
      setForm(response.data);
      
      // Initialize form data with empty values
      const initialData: any = {};
      response.data.schema.forEach((field: any) => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    } catch (error) {
      toast.error('Failed to load form');
      router.push('/client/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileChange = (fieldName: string, file: File) => {
    setFiles((prev: any) => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields: string[] = [];
    form.schema.forEach((field: any) => {
      if (field.required && !formData[field.name]) {
        missingFields.push(field.label);
      }
    });
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('form', id as string);
      submitData.append('data', JSON.stringify(formData));
      
      // Append files
      Object.keys(files).forEach(key => {
        submitData.append(key, files[key]);
      });
      
      await submissionsAPI.createSubmission(submitData);
      toast.success('Form submitted successfully!');
      router.push('/client/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            className="input"
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            className="input"
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            className="input"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            className="input"
            placeholder={field.placeholder}
            rows={4}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      
      case 'dropdown':
        return (
          <select
            className="input"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.choices?.map((option: string, idx: number) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 text-primary-600 rounded"
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              required={field.required}
            />
            <label className="ml-2 text-gray-700">{field.label}</label>
          </div>
        );
      
      case 'file':
        return (
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id={`file-${field.name}`}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(field.name, e.target.files[0]);
                }
              }}
              required={field.required}
            />
            <label
              htmlFor={`file-${field.name}`}
              className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500"
            >
              <Upload className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {files[field.name] ? files[field.name].name : 'Choose file...'}
              </span>
            </label>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            className="input"
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="client">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!form) {
    return (
      <AuthGuard requiredRole="client">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Form not found</p>
            <Link href="/client/forms" className="btn btn-primary">
              Back to Forms
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="client">
      <Head>
        <title>{form.title} - Fill Form</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/client/forms" className="flex items-center text-gray-700 hover:text-primary-600">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Forms
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
                <span className="badge badge-info">{form.category.toUpperCase()}</span>
              </div>
              {form.description && (
                <p className="text-gray-600 mt-2">{form.description}</p>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {form.schema.map((field: any, index: number) => (
                  <div key={field.id || index}>
                    {field.type !== 'checkbox' && (
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <Link href="/client/forms" className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
