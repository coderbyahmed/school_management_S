import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import { ACADEMIC_YEARS } from '../../../utils/classNames';

const SCHOOL_SHIFTS = ['Morning', 'Evening', 'Both'];

const AcademicConfiguration = ({ data, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [userEdits, setUserEdits] = useState({});

  const form = useMemo(() => {
    if (!editing) return { ...data };
    return { ...data, ...userEdits };
  }, [data, editing, userEdits]);

  const handleChange = (field) => (e) => {
    setUserEdits((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEdit = () => {
    setUserEdits({});
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.currentAcademicYear || !form.schoolShift || !form.schoolStartTime || !form.schoolEndTime) {
      toast.error('Please fill all required fields');
      return;
    }
    await onSave(form);
    setEditing(false);
    setUserEdits({});
  };

  return (
    <div className="space-y-6">
      <CardSection title="Academic Year">
        <div className="max-w-md">
          <SelectInput
            label="Current Academic Year"
            name="currentAcademicYear"
            value={form.currentAcademicYear}
            onChange={handleChange('currentAcademicYear')}
            options={ACADEMIC_YEARS}
            placeholder="Select year"
            required
            disabled={!editing}
          />
        </div>
      </CardSection>

      <CardSection title="School Timing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <SelectInput
            label="School Shift"
            name="schoolShift"
            value={form.schoolShift}
            onChange={handleChange('schoolShift')}
            options={SCHOOL_SHIFTS}
            placeholder="Select shift"
            required
            disabled={!editing}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              School Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="schoolStartTime"
              value={form.schoolStartTime}
              onChange={handleChange('schoolStartTime')}
              disabled={!editing}
              className={`appearance-none block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                !editing ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              School End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="schoolEndTime"
              value={form.schoolEndTime}
              onChange={handleChange('schoolEndTime')}
              disabled={!editing}
              className={`appearance-none block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                !editing ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Attendance Start Time
            </label>
            <input
              type="time"
              name="attendanceStartTime"
              value={form.attendanceStartTime}
              onChange={handleChange('attendanceStartTime')}
              disabled={!editing}
              className={`appearance-none block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                !editing ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'border-gray-300'
              }`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Attendance Closing Time
            </label>
            <input
              type="time"
              name="attendanceClosingTime"
              value={form.attendanceClosingTime}
              onChange={handleChange('attendanceClosingTime')}
              disabled={!editing}
              className={`appearance-none block w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 ${
                !editing ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      </CardSection>

      <div className="flex items-center gap-3">
        {editing ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Information'}
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit Information
          </button>
        )}
      </div>
    </div>
  );
};

export default AcademicConfiguration;
