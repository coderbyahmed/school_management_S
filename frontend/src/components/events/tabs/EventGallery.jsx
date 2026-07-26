import { useState, useEffect, useMemo } from 'react';
import { CameraIcon, EyeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput';
import eventsService from '../../../services/events.service';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const EventGallery = ({ onDataChange }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [selected, setSelected] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const data = eventsService.getGalleryData({ academicYear, category, month, search });
    setItems(data);
  }, [academicYear, category, month, search, onDataChange]);

  const filtered = useMemo(() => items, [items]);

  const openViewer = (item) => {
    setSelected(item);
    setPhotoIndex(0);
  };

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Event Gallery</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Browse events and their photos</p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
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
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Event Type</label>
            <div className="relative mt-1">
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="appearance-none w-full px-3 py-2.5 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">All Types</option>
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

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <CameraIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No Events Available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            {search || academicYear || category || month
              ? 'No events match your filters. Try adjusting your selections.'
              : 'Events will appear here once they are added.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, idx) => {
            const color = COLORS[idx % COLORS.length];
            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer flex flex-col"
                onClick={() => openViewer(item)}
              >
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden">
                  {item.banner ? (
                    <img
                      src={item.banner}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <CameraIcon className="h-12 w-12 text-white/70" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Photo Count Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {item.numPhotos} Photos
                  </div>
                  {/* Hover View Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <EyeIcon className="h-5 w-5 text-gray-800 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gallery Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelected(null)}>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{selected.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selected.date}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer flex-shrink-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              {/* Event Info Bar */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                {selected.banner ? (
                  <img src={selected.banner} alt={selected.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: COLORS[filtered.indexOf(selected) % COLORS.length] }}
                  >
                    <CameraIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selected.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      {selected.category || 'General'}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{selected.numPhotos} photos</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{selected.description}</p>
                </div>
              )}

              {/* Photo Viewer */}
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-4">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <CameraIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">Photo {photoIndex + 1} of {selected.numPhotos}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{selected.name} — Event Photos</p>
                  </div>
                </div>
                <button
                  onClick={() => setPhotoIndex((p) => (p > 0 ? p - 1 : selected.numPhotos - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPhotoIndex((p) => (p < selected.numPhotos - 1 ? p + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                <p>Use arrow buttons to browse photos</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
