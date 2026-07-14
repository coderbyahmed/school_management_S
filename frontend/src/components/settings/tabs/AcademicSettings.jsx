import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';

const ACADEMIC_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'];
const SCHOOL_SHIFTS = ['Morning', 'Evening', 'Both'];
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LANGUAGES = ['English', 'Urdu', 'Arabic', 'French'];
const TIMEZONES = ['Asia/Karachi', 'Asia/Lahore', 'Asia/Islamabad', 'UTC', 'GMT'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
const TIME_FORMATS = ['12', '24'];

const AcademicSettings = ({ data, onSave, saving }) => {
  const [form, setForm] = useState(() => ({ ...data }));

  useEffect(() => {
    setForm({ ...data }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [data]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const holidays = prev.weeklyHolidays.includes(day)
        ? prev.weeklyHolidays.filter((d) => d !== day)
        : [...prev.weeklyHolidays, day];
      return { ...prev, weeklyHolidays: holidays };
    });
  };

  const handleSave = () => {
    if (!form.currentAcademicYear || !form.schoolShift || !form.schoolStartTime || !form.schoolEndTime) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  const handleReset = () => {
    setForm({ ...data });
    toast.success('Form reset to saved values');
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
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Weekly Holidays
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const isHoliday = form.weeklyHolidays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      isHoliday
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Click to toggle holidays</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              School Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="schoolStartTime"
              value={form.schoolStartTime}
              onChange={handleChange('schoolStartTime')}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
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
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
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
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
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
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </CardSection>

      <CardSection title="Regional Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <SelectInput
            label="Default Language"
            name="defaultLanguage"
            value={form.defaultLanguage}
            onChange={handleChange('defaultLanguage')}
            options={LANGUAGES}
            placeholder="Select language"
          />
          <SelectInput
            label="Time Zone"
            name="timeZone"
            value={form.timeZone}
            onChange={handleChange('timeZone')}
            options={TIMEZONES}
            placeholder="Select timezone"
          />
          <SelectInput
            label="Date Format"
            name="dateFormat"
            value={form.dateFormat}
            onChange={handleChange('dateFormat')}
            options={DATE_FORMATS}
            placeholder="Select format"
          />
          <SelectInput
            label="Time Format"
            name="timeFormat"
            value={form.timeFormat}
            onChange={handleChange('timeFormat')}
            options={TIME_FORMATS}
            placeholder="Select format"
          />
        </div>
      </CardSection>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default AcademicSettings;
