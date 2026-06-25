import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import Alert from '../../common/Alert';
import classService from '../../../services/class.service';
import { CLASS_NAMES, ACADEMIC_YEARS } from '../../../utils/classNames';

const statusOptions = ['Active', 'Inactive'];

const initialState = {
  className: '',
  academicYear: '',
  status: 'Active',
};

const AddClass = ({ editData, onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        className: editData.className || '',
        academicYear: editData.academicYear || '',
        status: editData.status || 'Active',
      });
    } else {
      setForm(initialState);
    }
    setError('');
  }, [editData]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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
        await classService.updateClass(editData._id, form);
        toast.success('Class updated successfully');
      } else {
        await classService.createClass(form);
        toast.success('Class created successfully');
        resetForm();
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save class';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (editData) {
      setForm({
        className: editData.className || '',
        academicYear: editData.academicYear || '',
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
        <CardSection title={editData ? 'Edit Class' : 'Class Information'}>
          <SelectInput
            label="Class Name"
            name="className"
            value={form.className}
            onChange={handleChange('className')}
            options={CLASS_NAMES}
            placeholder="Select class"
          />
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange('academicYear')}
            options={ACADEMIC_YEARS}
            placeholder="Select academic year"
          />
          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange('status')}
            options={statusOptions}
          />
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
          {loading ? 'Saving...' : editData ? 'Update Class' : 'Save Class'}
        </button>
      </div>
    </div>
  );
};

export default AddClass;
