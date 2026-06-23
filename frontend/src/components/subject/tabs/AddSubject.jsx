import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CardSection from '../../common/CardSection';
import Input from '../../common/Input';
import SelectInput from '../../common/SelectInput';
import Alert from '../../common/Alert';
import subjectService from '../../../services/subject.service';

const statusOptions = ['Active', 'Inactive'];

const initialState = {
  subjectName: '',
  subjectCode: '',
  description: '',
  status: 'Active',
};

const AddSubject = ({ editData, onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        subjectName: editData.subjectName || '',
        subjectCode: editData.subjectCode || '',
        description: editData.description || '',
        status: editData.status || 'Active',
      });
    } else {
      setForm(initialState);
    }
    setError('');
  }, [editData]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const resetForm = () => {
    setForm(initialState);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (editData) {
        await subjectService.updateSubject(editData._id, {
          subjectName: form.subjectName,
          description: form.description,
          status: form.status,
        });
        toast.success('Subject updated successfully');
      } else {
        const result = await subjectService.createSubject({
          subjectName: form.subjectName,
          description: form.description,
          status: form.status,
        });
        toast.success('Subject created successfully');
        setForm({ ...initialState, subjectCode: result.data?.subject?.subjectCode || '' });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save subject';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (editData) {
      setForm({
        subjectName: editData.subjectName || '',
        subjectCode: editData.subjectCode || '',
        description: editData.description || '',
        status: editData.status || 'Active',
      });
      setError('');
    } else {
      resetForm();
    }
  };

  return (
    <div className="space-y-5">
      {error && <Alert message={error} type="error" />}

      <div className="max-w-2xl">
        <CardSection title={editData ? 'Edit Subject' : 'Subject Information'}>
          <Input
            label="Subject Name"
            name="subjectName"
            value={form.subjectName}
            onChange={handleChange('subjectName')}
            placeholder="Enter subject name"
          />
          <Input
            label="Subject Code"
            name="subjectCode"
            value={form.subjectCode}
            disabled
            placeholder="Auto-generated"
          />
          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange('status')}
            options={statusOptions}
          />
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange('description')}
              rows={4}
              placeholder="Enter description"
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        </CardSection>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Subject...' : editData ? 'Update Subject' : 'Save Subject'}
        </button>
      </div>
    </div>
  );
};

export default AddSubject;
