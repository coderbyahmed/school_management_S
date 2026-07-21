import { useState, useEffect, useMemo } from 'react';
import { CameraIcon, EyeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput';
import eventsService from '../../../services/events.service';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const EventGallery = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setItems(eventsService.getGalleryData());
  }, []);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const openViewer = (item) => {
    setSelected(item);
    setPhotoIndex(0);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Event Gallery</h2>
          <SearchInput placeholder="Search events..." value={search} onChange={setSearch} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <CameraIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No gallery items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, idx) => {
            const color = COLORS[idx % COLORS.length];
            return (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="h-40 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: color }}>
                  <div className="text-white text-center p-4">
                    <CameraIcon className="h-10 w-10 mx-auto mb-2 opacity-80" />
                    <p className="text-lg font-bold">{item.name.charAt(0)}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {item.numPhotos} Photos
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.date}</p>
                  <button
                    onClick={() => openViewer(item)}
                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <EyeIcon className="h-3.5 w-3.5" /> View Gallery
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gallery Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelected(null)}>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer flex-shrink-0">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: COLORS[filtered.indexOf(selected) % COLORS.length] }}>
                  <CameraIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selected.date}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selected.numPhotos} Photos</p>
                </div>
              </div>

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
