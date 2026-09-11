import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../hooks/useLocalization';
import subjectService from '../../../services/subject/subject.service';
import teacherService from '../../../services/teacher/teacher.service';
import { getImageUrl } from '../../../utils/imageUrl';

const TeacherSubjectAssignment = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [assignedIds, setAssignedIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [dropdownOpen]);

  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      teacher.fullName?.toLowerCase().includes(q) ||
      teacher.teacherId?.toLowerCase().includes(q)
    );
  });

  const selectedTeacherObj = teachers.find((t) => t.teacherId === selectedTeacherId) || null;

  const handleTeacherSelect = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const fetchTeachersAndSubjects = useCallback(async () => {
    setFetchingSubjects(true);
    try {
      const [teachersResult, subjectsResult] = await Promise.all([
        teacherService.getAllTeachers({ limit: 100 }),
        subjectService.getAllSubjects(),
      ]);
      setTeachers(teachersResult.data?.teachers || []);
      setAllSubjects(subjectsResult.data?.subjects || []);
    } catch (err) {
      const msg = err.response?.data?.message || t('failedToLoad');
      toast.error(msg);
    } finally {
      setFetchingSubjects(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    if (selectedTeacherId) {
      setLoading(true);
      try {
        const result = await subjectService.getTeacherAssignments(selectedTeacherId);
        const assigned = result.data?.assignedSubjects || [];
        const ids = assigned.map((s) => s._id);
        setAssignedIds(ids);
        setSelectedIds([...ids]);
      } catch (err) {
        const msg = err.response?.data?.message || t('failedToLoad');
        toast.error(msg);
        setAssignedIds([]);
        setSelectedIds([]);
      } finally {
        setLoading(false);
      }
    } else {
      setAssignedIds([]);
      setSelectedIds([]);
    }
  }, [selectedTeacherId]);

  useEffect(() => {
    Promise.resolve().then(() => fetchTeachersAndSubjects());
  }, [fetchTeachersAndSubjects]);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (selectedTeacherId) {
        const teacher = teachers.find((t) => t.teacherId === selectedTeacherId);
        setSelectedTeacher(teacher || null);
        fetchAssignments();
      } else {
        setSelectedTeacher(null);
        setAssignedIds([]);
        setSelectedIds([]);
      }
    });
  }, [selectedTeacherId, teachers, fetchAssignments]);

  const handleToggle = (subjectId) => {
    setSelectedIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const handleUpdate = async () => {
    if (!selectedTeacherId) return;

    setAssigning(true);
    try {
      await subjectService.assignSubjectsToTeacher(selectedTeacherId, selectedIds);
      toast.success(t('updatedSuccessfully'));
      await Promise.all([fetchTeachersAndSubjects(), fetchAssignments()]);
    } catch (err) {
      const msg = err.response?.data?.message || t('failedToSave');
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleReset = () => {
    setSelectedIds([...assignedIds]);
  };

  const hasChanges = (() => {
    if (selectedIds.length !== assignedIds.length) return true;
    const assignedSet = new Set(assignedIds);
    return selectedIds.some((id) => !assignedSet.has(id));
  })();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('teacherSubjectAssignment')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('teacherLabel')}
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => { setDropdownOpen((prev) => !prev); setSearchQuery(''); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer text-left"
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                {selectedTeacherObj ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-[10px] ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
                      {getImageUrl(selectedTeacherObj.teacherImage) ? (
                        <img
                          src={getImageUrl(selectedTeacherObj.teacherImage)}
                          alt={selectedTeacherObj.fullName}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <span className={`${getImageUrl(selectedTeacherObj.teacherImage) ? 'hidden' : ''} select-none`}>
                        {selectedTeacherObj.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'T'}
                      </span>
                    </div>
                    <span className="truncate font-medium">{selectedTeacherObj.fullName}</span>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">{t('select')}</span>
                )}
                <svg className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-72 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={`${t('search')}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                  <ul className="overflow-y-auto max-h-60 p-1" role="listbox">
                    <li
                      role="option"
                      aria-selected={!selectedTeacherId}
                      onClick={() => handleTeacherSelect('')}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        !selectedTeacherId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-11">{t('select')}</span>
                    </li>
                    {filteredTeachers.length === 0 && (
                      <li className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                        {t('noData')}
                      </li>
                    )}
                    {filteredTeachers.map((teacher) => {
                      const isSelected = teacher.teacherId === selectedTeacherId;
                      const imgSrc = getImageUrl(teacher.teacherImage);
                      const initials = teacher.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'T';
                      return (
                        <li
                          key={teacher._id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleTeacherSelect(teacher.teacherId)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-[11px] ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={teacher.fullName}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null}
                            <span className={`${imgSrc ? 'hidden' : ''} select-none`}>
                              {initials}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                              {teacher.fullName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {teacher.teacherId}
                            </p>
                          </div>
                          {isSelected && (
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {selectedTeacher && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
                  {getImageUrl(selectedTeacher.teacherImage) ? (
                    <img
                      src={getImageUrl(selectedTeacher.teacherImage)}
                      alt={selectedTeacher.fullName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className={`${getImageUrl(selectedTeacher.teacherImage) ? 'hidden' : ''} select-none`}>
                    {selectedTeacher.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTeacher.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTeacher.teacherId}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">{`${t('subject')}s ${t('assigned').toLowerCase()}`}: <span className="font-medium text-gray-700 dark:text-gray-200">{selectedIds.length}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedTeacherId ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <svg className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('teacherLabel')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('noData')}</p>
            </div>
          ) : fetchingSubjects || loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('loading')}</p>
            </div>
          ) : allSubjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
              <svg className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('noSubjects')}</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                {`${t('subject')}s ${t('of')} ${selectedTeacher?.fullName}`}
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allSubjects.map((subject) => {
                  const isAssigned = assignedIds.includes(subject._id);
                  const isSelected = selectedIds.includes(subject._id);

                  return (
                    <div
                      key={subject._id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(subject._id)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm ${isSelected ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {subject.subjectName}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{subject.subjectCode}</span>
                      {isAssigned ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {t('assigned')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          {t('unassigned')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 pt-5 mt-5 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleUpdate}
                  disabled={assigning || !hasChanges}
                  className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? t('saving') : t('update')}
                </button>
                <button
                  onClick={handleReset}
                  disabled={assigning || !hasChanges}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('reset')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherSubjectAssignment;
