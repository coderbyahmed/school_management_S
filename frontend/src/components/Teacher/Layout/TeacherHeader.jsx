import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import TeacherProfileMenu from './TeacherProfileMenu';
import TeacherChangePasswordModal from './TeacherChangePasswordModal';
import ThemeToggle from '../../common/ThemeToggle/ThemeToggle';
import useSchoolBranding from '../../../hooks/useSchoolBranding';
import useTeacherProfile from '../../../hooks/useTeacherProfile';
import { getImageUrl } from '../../../utils/imageUrl';

const TeacherHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { schoolBranding } = useSchoolBranding();
  const { teacherProfile } = useTeacherProfile();
  const logoUrl = schoolBranding?.logo ? getImageUrl(schoolBranding.logo) : null;
  const schoolName = schoolBranding?.schoolName || '';
  const teacherImageUrl = teacherProfile?.teacherImage ? getImageUrl(teacherProfile.teacherImage) : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="relative flex-shrink-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 z-30">
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6">
        {/* Left Side - School Identity (desktop) / Teacher Image (mobile) */}
        <div className="flex items-center">
          {/* Mobile: teacher profile image - clickable, larger, with green ring */}
          <button
            onClick={() => navigate('/teacher/profile')}
            className="lg:hidden flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex-shrink-0 overflow-hidden ring-[3px] ring-emerald-400 dark:ring-emerald-500 shadow-md cursor-pointer"
            aria-label="Go to profile"
          >
            {teacherImageUrl ? (
              <img src={teacherImageUrl} alt={user?.fullName || 'Teacher'} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-white font-bold text-sm">{(user?.fullName || 'T').charAt(0)}</span>
            )}
          </button>

          {/* Desktop: school logo + name */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-yellow-400/70 flex-shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
              ) : (
                <span>{schoolName.charAt(0)}</span>
              )}
            </div>
            <h1 className="text-sm lg:text-base font-bold text-gray-800 dark:text-white leading-tight whitespace-nowrap">
              {schoolName}
            </h1>
          </div>
        </div>

        {/* Center - Date, Time, Theme Toggle (desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
              {formattedDate}
            </span>
            <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600"></div>
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[11px] font-mono text-gray-600 dark:text-gray-400 font-semibold">
              {formattedTime}
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Right Side - Notifications + Theme Toggle (mobile) + Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile: theme toggle - visible on all mobile widths */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Notifications">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Profile menu"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">{user?.fullName || 'Teacher'}</span>
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {profileOpen && (
              <TeacherProfileMenu
                onClose={() => setProfileOpen(false)}
                onOpenChangePassword={() => {
                  setProfileOpen(false);
                  setChangePasswordOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <TeacherChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
};

export default TeacherHeader;
