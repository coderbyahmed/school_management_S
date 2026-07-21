import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDownIcon, EyeIcon, PencilSquareIcon, TrashIcon,
  XMarkIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import eventsService from '../../../services/events.service';

const initialForm = {
  name: '',
  startDate: '',
  endDate: '',
  type: '',
  appliesTo: '',
  description: '',
};

const getStatusStyle = (status) => {
  const styles = {
    Upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    Ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    Completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  };
  return styles[status] || styles.Upcoming;
};

const HolidayManagement = ({ onDataChange }) => {
  const [holidays, setHolidays] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...initialForm });
  const [academicYear, setAcademicYear] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewHoliday, setViewHoliday] = useState(null);

  useEffect(() => {
    setHolidays(eventsService.getHolidays());
  }, []);

  const filtered = useMemo(() => {
    let list = holidays;
    if (academicYear) list = list.filter((h) => h.academicYear === academicYear);
    if (typeFilter) list = list.filter((h) => h.type === typeFilter);
    return list;
  }, [holidays, academicYear, typeFilter]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const calcDays = (s, e) => {
    if (!s || !e) return 0;
    return Math.floor((new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleAdd = () => {
    if (!form.name || !form.startDate || !form.endDate || !form.type) {
      toast.error('Please fill required fields');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    const totalDays = calcDays(form.startDate, form.endDate);
    eventsService.addHoliday({
      ...form,
      academicYear: eventsService.ACADEMIC_YEARS[0],
      startDateDisplay: new Date(form.startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDateDisplay: new Date(form.endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalDays,
      status: 'Upcoming',
    });
    toast.success('Holiday added successfully');
    setForm({ ...initialForm });
    setShowForm(false);
    setHolidays(eventsService.getHolidays());
    onDataChange();
  };

  const handleDelete = (id) => {
    eventsService.deleteHoliday(id);
    setHolidays(eventsService.getHolidays());
    onDataChange();
    toast.success('Holiday deleted');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Holidays</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer">
            <PlusIcon className="h-4 w-4" /> {showForm ? 'Cancel' : 'Add Holiday'}
          </button>
        </div>

        {showForm && (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">New Holiday</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Holiday Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Enter holiday name" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Holiday Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.type} onChange={(e) => update('type', e.target.value)}
                    className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    <option value="" disabled>Select type</option>
                    {eventsService.HOLIDAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Applies To</label>
                <div className="relative">
                  <select value={form.appliesTo} onChange={(e) => update('appliesTo', e.target.value)}
                    className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    <option value="" disabled>Select</option>
                    {eventsService.AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="mb-4 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => update('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Optional description" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={handleAdd} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer">
                Save Holiday
              </button>
              <button onClick={() => { setForm({ ...initialForm }); setShowForm(false); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Academic Year</label>
            <div className="relative mt-1">
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Years</option>
                {eventsService.ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Holiday Type</label>
            <div className="relative mt-1">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Types</option>
                {eventsService.HOLIDAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Holiday Name</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Start Date</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">End Date</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Total Days</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Holiday Type</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Applies To</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No holidays found</td></tr>
            ) : (
              filtered.map((h) => (
                <tr key={h.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{h.name}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{h.startDateDisplay}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{h.endDateDisplay}</td>
                  <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">{h.totalDays}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700">
                      {h.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{h.appliesTo}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyle(h.status)}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewHoliday(h)} className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer" title="Edit">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Delete">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} holiday{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewHoliday(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Holiday Details</h2>
              <button onClick={() => setViewHoliday(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{viewHoliday.name}</h3>
              <div className="space-y-3">
                {[
                  ['Type', viewHoliday.type],
                  ['Start Date', viewHoliday.startDateDisplay],
                  ['End Date', viewHoliday.endDateDisplay],
                  ['Total Days', viewHoliday.totalDays],
                  ['Applies To', viewHoliday.appliesTo],
                  ['Academic Year', viewHoliday.academicYear],
                  ['Status', viewHoliday.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
                {viewHoliday.description && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{viewHoliday.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
