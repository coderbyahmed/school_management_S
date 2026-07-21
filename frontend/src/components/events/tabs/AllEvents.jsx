import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, ChevronDownIcon, EyeIcon, PencilSquareIcon,
  TrashIcon, XMarkIcon, CalendarDaysIcon, ClockIcon, MapPinIcon,
} from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput';
import eventsService from '../../../services/events.service';

const getStatusStyle = (status) => {
  const styles = {
    Upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    Ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    Completed: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  return styles[status] || styles.Upcoming;
};

const AllEvents = ({ onDataChange }) => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [viewEvent, setViewEvent] = useState(null);

  useEffect(() => {
    const data = eventsService.getEvents();
    setEvents(data);
  }, []);

  const filtered = useMemo(() => {
    let list = events;
    if (search) { const q = search.toLowerCase(); list = list.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)); }
    if (academicYear) list = list.filter((e) => e.academicYear === academicYear);
    if (category) list = list.filter((e) => e.category === category);
    if (month) list = list.filter((e) => new Date(e.date).getMonth() === eventsService.MONTHS.indexOf(month));
    return list;
  }, [events, search, academicYear, category, month]);

  const handleDelete = (id) => {
    eventsService.deleteEvent(id);
    setEvents(eventsService.getEvents());
    onDataChange();
    toast.success('Event deleted');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Category</label>
            <div className="relative mt-1">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Categories</option>
                {eventsService.EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Month</label>
            <div className="relative mt-1">
              <select value={month} onChange={(e) => setMonth(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Months</option>
                {eventsService.MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">&nbsp;</label>
            <SearchInput placeholder="Search events..." value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Banner</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Event Name</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Category</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Time</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Venue</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Audience</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No events found</td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id} className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-3 py-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: event.color }}>
                      {event.name.charAt(0)}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">{event.name}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{event.dateDisplay}</td>
                  <td className="px-3 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{event.startTime} - {event.endTime}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{event.venue}</td>
                  <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">{event.audience}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewEvent(event)} className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer" title="Edit">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Delete">
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
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewEvent(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Event Details</h2>
              <button onClick={() => setViewEvent(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: viewEvent.color }}>
                  {viewEvent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{viewEvent.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusStyle(viewEvent.status)}`}>
                    {viewEvent.status}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Date</p><p className="text-xs font-medium text-gray-800 dark:text-gray-200">{viewEvent.dateDisplay}</p></div>
                </div>
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Time</p><p className="text-xs font-medium text-gray-800 dark:text-gray-200">{viewEvent.startTime} - {viewEvent.endTime}</p></div>
                </div>
                <div className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <div><p className="text-xs text-gray-500">Venue</p><p className="text-xs font-medium text-gray-800 dark:text-gray-200">{viewEvent.venue}</p></div>
                </div>
                {[
                  ['Category', viewEvent.category],
                  ['Audience', viewEvent.audience],
                  ['Organizer', viewEvent.organizer],
                  ['Academic Year', viewEvent.academicYear],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
              {viewEvent.description && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{viewEvent.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;
