import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline';
import SelectInput from '../../common/SelectInput';
import DateInput from '../../common/DateInput';
import eventsService from '../../../services/events.service';

const initialForm = {
  name: '',
  category: '',
  date: '',
  startTime: '',
  endTime: '',
  venue: '',
  organizer: '',
  audience: '',
  description: '',
  color: '#3b82f6',
  status: 'Upcoming',
};

const AddEvent = ({ onDataChange }) => {
  const [form, setForm] = useState({ ...initialForm });
  const [preview, setPreview] = useState(null);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.name || !form.category || !form.date) {
      toast.error('Please fill required fields (Title, Category, Date)');
      return;
    }
    eventsService.addEvent({
      ...form,
      academicYear: eventsService.ACADEMIC_YEARS[0],
      dateDisplay: new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      banner: null,
      createdAt: new Date().toISOString().split('T')[0],
    });
    toast.success('Event added successfully');
    setForm({ ...initialForm });
    onDataChange();
  };

  const handleReset = () => {
    setForm({ ...initialForm });
    setPreview(null);
  };

  const handlePreview = () => {
    if (!form.name || !form.category || !form.date) {
      toast.error('Add at least Title, Category, and Date to preview');
      return;
    }
    setPreview({ ...form, dateDisplay: new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Add New Event</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4" placeholder="Enter event title" />
          </div>
          <SelectInput label="Event Category" name="category" value={form.category} onChange={(e) => update('category', e.target.value)} options={eventsService.EVENT_CATEGORIES} placeholder="Select category" required />
          <SelectInput label="Audience" name="audience" value={form.audience} onChange={(e) => update('audience', e.target.value)} options={eventsService.AUDIENCES} placeholder="Select audience" />
          <DateInput label="Event Date" name="date" value={form.date} onChange={(e) => update('date', e.target.value)} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
            <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time</label>
            <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Venue</label>
            <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Event venue" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organizer</label>
            <input type="text" value={form.organizer} onChange={(e) => update('organizer', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Organizer name" />
          </div>
          <div className="sm:col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Event description" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={(e) => update('color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent p-0.5" />
              <span className="text-xs text-gray-500">{form.color}</span>
            </div>
          </div>
          <SelectInput label="Status" name="status" value={form.status} onChange={(e) => update('status', e.target.value)} options={eventsService.STATUSES} />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Preview</h2>
        {preview ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            <div className="h-24 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: preview.color }}>
              {preview.name.charAt(0)}
            </div>
            <div className="p-4 space-y-2 text-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{preview.name}</h3>
              <p className="text-gray-500">{preview.category}</p>
              <p className="text-gray-500">{preview.dateDisplay} | {preview.startTime || '--'} - {preview.endTime || '--'}</p>
              <p className="text-gray-500">{preview.venue || 'Venue TBD'}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                {preview.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
            <EyeIcon className="h-10 w-10 mb-2" />
            <p className="text-xs">Fill form and click Preview</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="lg:col-span-3 flex flex-wrap gap-3">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
          Save Event
        </button>
        <button onClick={handlePreview}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center gap-2 cursor-pointer">
          <EyeIcon className="h-4 w-4" /> Preview
        </button>
        <button onClick={handleReset}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
          <ArrowPathIcon className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
};

export default AddEvent;
