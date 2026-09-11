import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import useTeacherProfile from '../../../hooks/useTeacherProfile';
import { getImageUrl } from '../../../utils/imageUrl';

const navItems = [
  {
    label: 'Dashboard',
    path: '/teacher/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: 'My Classes',
    path: '/teacher/classes',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
  },
  {
    label: 'Attendance',
    path: '/teacher/attendance',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    label: 'Students',
    path: '/teacher/students',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    label: 'Timetable',
    path: '/teacher/timetable',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
];

const TeacherSidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const { teacherProfile } = useTeacherProfile();
  const navigate = useNavigate();
  const teacherImageUrl = teacherProfile?.teacherImage ? getImageUrl(teacherProfile.teacherImage) : null;

  return (
    <aside
      className={`h-screen flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Top Section - Teacher Profile (fixed) */}
      <div className={`relative flex-shrink-0 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
        {collapsed ? (
          <>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/teacher/profile')}
                className="relative flex-shrink-0 cursor-pointer"
                title="View profile"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-lg transition-all duration-300 overflow-hidden">
                  {teacherImageUrl ? (
                    <img src={teacherImageUrl} alt={user?.fullName || 'Teacher'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.fullName?.charAt(0) || 'T'}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800"></div>
              </button>
            </div>
            <button
              onClick={onToggle}
              className="mt-2 mx-auto flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-white transition-all duration-200"
              title="Expand sidebar"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 pr-8">
            <button
              onClick={() => navigate('/teacher/profile')}
              className="relative flex-shrink-0 cursor-pointer"
              title="View profile"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 overflow-hidden">
                {teacherImageUrl ? (
                  <img src={teacherImageUrl} alt={user?.fullName || 'Teacher'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.fullName?.charAt(0) || 'T'}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800"></div>
            </button>
            <button
              onClick={() => navigate('/teacher/profile')}
              className="min-w-0 flex-1 text-left cursor-pointer"
            >
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                {user?.fullName || 'Teacher'}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                </svg>
                {user?.teacherId || 'TCH-001'}
              </div>
            </button>
            <button
              onClick={onToggle}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-white transition-all duration-200"
              title="Collapse sidebar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Section (scrollable) */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className={`space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                  collapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Section (fixed, for future use) */}
      <div className={`flex-shrink-0 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">v1.0</div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">School Management</span>
            <span className="text-[10px] text-gray-300 dark:text-gray-600">v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TeacherSidebar;
