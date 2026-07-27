import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CameraIcon, EyeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronDownIcon, PlusIcon, TrashIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import SearchInput from '../../common/SearchInput';
import ConfirmationModal from '../../common/ConfirmationModal';
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

  const [previewImage, setPreviewImage] = useState(null);

  const [manageEvent, setManageEvent] = useState(null);
  const [manageImages, setManageImages] = useState([]);
  const [manageCover, setManageCover] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const manageFileRef = useRef(null);

  useEffect(() => {
    const data = eventsService.getGalleryData({ academicYear, category, month, search });
    setItems(data);
  }, [academicYear, category, month, search, onDataChange]);

  const filtered = useMemo(() => items, [items]);

  const getAllImages = useCallback((item) => {
    const imgs = [];
    if (item.banner) imgs.push(item.banner);
    if (item.galleryImages && item.galleryImages.length > 0) imgs.push(...item.galleryImages);
    return imgs;
  }, []);

  const openViewer = (item) => {
    setSelected(item);
    setPhotoIndex(0);
  };

  const openManageGallery = (item) => {
    const fullEvent = eventsService.getEvents().find((e) => e.id === item.id);
    setManageEvent(fullEvent || item);
    setManageCover(fullEvent?.banner || item.banner || null);
    setManageImages(fullEvent?.galleryImages || item.galleryImages || []);
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const newImages = [];
    let processed = 0;
    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image (JPG, PNG only)`);
        processed++;
        if (processed === files.length) {
          setManageImages((prev) => [...prev, ...newImages]);
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImages.push(ev.target.result);
        processed++;
        if (processed === files.length) {
          setManageImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (manageFileRef.current) manageFileRef.current.value = '';
  };

  const handleRemoveGalleryImage = (idx) => {
    setManageImages((prev) => prev.filter((_, i) => i !== idx));
    setRemoveConfirm(null);
  };

  const handleSaveGallery = () => {
    eventsService.updateEventGallery(manageEvent.id, manageImages);
    eventsService.updateEvent(manageEvent.id, { banner: manageCover });
    setManageEvent(null);
    setManageImages([]);
    setManageCover(null);
    onDataChange();
    toast.success('Gallery updated successfully');
  };

  useEffect(() => {
    if (!selected) return;
    const imgs = getAllImages(selected);
    if (imgs.length === 0) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { setSelected(null); return; }
      if (e.key === 'ArrowLeft') setPhotoIndex((p) => (p > 0 ? p - 1 : imgs.length - 1));
      if (e.key === 'ArrowRight') setPhotoIndex((p) => (p < imgs.length - 1 ? p + 1 : 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, getAllImages]);

  useEffect(() => {
    if (!previewImage) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewImage]);

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
            const photoCount = item.numPhotos;
            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => openViewer(item)}>
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
                  {photoCount > 0 && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                      {photoCount} Photo{photoCount !== 1 ? 's' : ''}
                    </div>
                  )}
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
                  {/* Manage Gallery Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openManageGallery(item); }}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    <PhotoIcon className="h-3.5 w-3.5" />
                    Manage Gallery
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gallery Viewer Modal */}
      {selected && (() => {
        const allImages = getAllImages(selected);
        const hasImages = allImages.length > 0;
        return (
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
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">{allImages.length} photo{allImages.length !== 1 ? 's' : ''}</span>
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
                {hasImages ? (
                  <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-4">
                    <div
                      className="h-64 flex items-center justify-center cursor-pointer"
                      onClick={() => setPreviewImage(allImages[photoIndex])}
                    >
                      <img
                        src={allImages[photoIndex]}
                        alt={`${selected.name} - Photo ${photoIndex + 1}`}
                        className="max-h-64 max-w-full object-contain rounded-lg"
                      />
                    </div>
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setPhotoIndex((p) => (p > 0 ? p - 1 : allImages.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setPhotoIndex((p) => (p < allImages.length - 1 ? p + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                      {photoIndex + 1} / {allImages.length}
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-4">
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <CameraIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">No photos yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click &quot;Manage Gallery&quot; to add photos</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          i === photoIndex
                            ? 'border-blue-500 ring-1 ring-blue-500/30'
                            : 'border-gray-200 dark:border-gray-600 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  {hasImages ? (
                    <p>{allImages.length > 1 ? 'Use arrow buttons or click image to preview' : 'Click image to preview'}</p>
                  ) : (
                    <p>Use &quot;Manage Gallery&quot; to add photos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Manage Gallery Modal */}
      {manageEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setManageEvent(null); setManageImages([]); setManageCover(null); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Manage Gallery</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{manageEvent.name}</p>
              </div>
              <button
                onClick={() => { setManageEvent(null); setManageImages([]); setManageCover(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5 max-h-[75vh] overflow-y-auto space-y-5">
              {/* Cover Image Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">Cover Image</h3>
                <div className="relative group w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {manageCover ? (
                    <>
                      <img src={manageCover} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setManageCover(null)}
                          className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-red-500 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <CameraIcon className="h-8 w-8 mb-1" />
                      <p className="text-xs">No cover image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Images Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Gallery Images ({manageImages.length})
                  </h3>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all cursor-pointer">
                    <PlusIcon className="h-3.5 w-3.5" />
                    Upload Images
                    <input
                      ref={manageFileRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                </div>

                {manageImages.length === 0 ? (
                  <div className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <PhotoIcon className="h-8 w-8 mb-1" />
                    <p className="text-xs">No gallery images yet</p>
                    <p className="text-[10px] mt-0.5">Click &quot;Upload Images&quot; to add photos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {manageImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setRemoveConfirm({ type: 'gallery', idx })}
                            className="p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-red-500 hover:bg-white dark:hover:bg-gray-800 shadow transition-all cursor-pointer"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setManageEvent(null); setManageImages([]); setManageCover(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGallery}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Remove Gallery Image Confirmation */}
      <ConfirmationModal
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        title="Remove Image"
        message="Are you sure you want to remove this image from the gallery?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => handleRemoveGalleryImage(removeConfirm?.idx)}
      />
    </div>
  );
};

export default EventGallery;
