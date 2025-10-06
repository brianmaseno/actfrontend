import { useState } from 'react';
import { useRouter } from 'next/router';
import AuthGuard from '../../../components/AuthGuard';
import { formsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

interface FormField {
  label: string;
  field_type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

const fieldTypes = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
];

const categories = [
  'general',
  'employment',
  'customer',
  'vendor',
  'partner',
  'other',
];

export default function NewFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    status: 'draft',
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [currentField, setCurrentField] = useState<FormField>({
    label: '',
    field_type: 'text',
    required: false,
    order: 0,
  });

  const handleAddField = () => {
    if (!currentField.label) {
      toast.error('Please enter a field label');
      return;
    }

    const newField = {
      ...currentField,
      order: fields.length,
    };

    setFields([...fields, newField]);
    setCurrentField({
      label: '',
      field_type: 'text',
      required: false,
      options: undefined,
      placeholder: '',
      order: 0,
    });
  };

  const handleRemoveField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields.map((field, i) => ({ ...field, order: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Please enter a form title');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    setLoading(true);
    try {
      await formsAPI.createForm({
        ...formData,
        fields,
      });
      toast.success('Form created successfully!');
      router.push('/admin/forms');
    } catch (error: any) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
            <p className="mt-2 text-sm text-gray-700">
              Design your onboarding form by adding fields
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Form Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Form Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Add Field Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add Form Fields
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      value={currentField.label}
                      onChange={(e) =>
                        setCurrentField({ ...currentField, label: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Field Type
                    </label>
                    <select
                      value={currentField.field_type}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          field_type: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={currentField.placeholder || ''}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        placeholder: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter placeholder text..."
                  />
                </div>

                {['select', 'radio', 'checkbox'].includes(
                  currentField.field_type
                ) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Option 1, Option 2, Option 3"
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          options: e.target.value
                            .split(',')
                            .map((o) => o.trim())
                            .filter((o) => o),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentField.required}
                    onChange={(e) =>
                      setCurrentField({
                        ...currentField,
                        required: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Required field
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddField}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Add Field
                </button>
              </div>
            </div>

            {/* Fields List */}
            {fields.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Form Preview ({fields.length} fields)
                </h2>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {field.field_type}
                          {field.options &&
                            ` • Options: ${field.options.join(', ')}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
