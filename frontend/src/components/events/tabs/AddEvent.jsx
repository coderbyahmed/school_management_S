import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowPathIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import SelectInput from '../../common/SelectInput';
import DateInput from '../../common/DateInput';
import ConfirmationModal from '../../common/ConfirmationModal';
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
  status: 'Upcoming',
};

const AddEvent = ({ onDataChange, editEvent, onClearEdit }) => {
  const [form, setForm] = useState({ ...initialForm });
  const [imagePreview, setImagePreview] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editEvent) {
      setForm({
        name: editEvent.name || '',
        category: editEvent.category || '',
        date: editEvent.date || '',
        startTime: editEvent.startTime || '',
        endTime: editEvent.endTime || '',
        venue: editEvent.venue || '',
        organizer: editEvent.organizer || '',
        audience: editEvent.audience || '',
        description: editEvent.description || '',
        status: editEvent.status || 'Upcoming',
      });
      setImagePreview(editEvent.banner || null);
    }
  }, [editEvent]);

  const isEditing = !!editEvent;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setShowRemoveConfirm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.date) {
      toast.error('Please fill required fields (Title, Category, Date)');
      return;
    }
    const eventData = {
      ...form,
      dateDisplay: new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      banner: imagePreview,
    };
    if (isEditing) {
      eventsService.updateEvent(editEvent.id, eventData);
      toast.success('Event updated successfully');
      onClearEdit();
    } else {
      eventsService.addEvent({
        ...eventData,
        academicYear: eventsService.ACADEMIC_YEARS[0],
        createdAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Event added successfully');
    }
    setForm({ ...initialForm });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onDataChange();
  };

  const handleReset = () => {
    if (isEditing) {
      onClearEdit();
    }
    setForm({ ...initialForm });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const dateDisplay = form.date
    ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">{isEditing ? 'Edit Event' : 'Add New Event'}</h2>

        {/* Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-2 ring-blue-400/50 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <CameraIcon className="h-6 w-6 text-white" />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {imagePreview && (
              <button type="button" onClick={() => setShowRemoveConfirm(true)}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer">
                <TrashIcon className="h-3.5 w-3.5" /> Remove
              </button>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">{imagePreview ? 'Click image to replace' : 'Upload event image (JPG, PNG)'}</p>
          </div>
        </div>

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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Place</label>
            <input type="text" value={form.venue} onChange={(e) => update('venue', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter event place" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organizer Name</label>
            <input type="text" value={form.organizer} onChange={(e) => update('organizer', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter organizer name" />
          </div>
          <div className="sm:col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Event description" />
          </div>
          <SelectInput label="Status" name="status" value={form.status} onChange={(e) => update('status', e.target.value)} options={eventsService.STATUSES} />
        </div>
      </div>

      {/* Preview Panel - Always Visible */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Preview</h2>
        {(form.name || form.category || form.date) ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            {imagePreview ? (
              <div className="h-32 overflow-hidden">
                <img src={imagePreview} alt="Event banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg">
                {form.name ? form.name.charAt(0) : 'E'}
              </div>
            )}
            <div className="p-4 space-y-2 text-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{form.name || 'Event Title'}</h3>
              <p className="text-gray-500">{form.category || 'Category'}</p>
              <p className="text-gray-500">{dateDisplay || 'Date'} | {form.startTime || '--'} - {form.endTime || '--'}</p>
              <p className="text-gray-500">{form.venue || 'Place TBD'}</p>
              {form.organizer && <p className="text-gray-500">By: {form.organizer}</p>}
              {form.description && <p className="text-gray-500 line-clamp-2">{form.description}</p>}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                {form.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
            <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-xs">Start filling the form to see preview</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="lg:col-span-3 flex flex-wrap gap-3">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
          {isEditing ? 'Update Event' : 'Save Event'}
        </button>
        <button onClick={handleReset}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 cursor-pointer">
          <ArrowPathIcon className="h-4 w-4" /> {isEditing ? 'Cancel Edit' : 'Reset'}
        </button>
      </div>

      {/* Remove Image Confirmation */}
      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        title="Remove Image"
        message="Are you sure you want to remove this image?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleRemoveImage}
      />
    </div>
  );
};

export default AddEvent;
