import { NavLink } from 'react-router-dom';
import { XMarkIcon, Bars3Icon, UserGroupIcon, AcademicCapIcon, BookOpenIcon, ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-3 z-30 md:hidden p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-40
          md:relative md:top-0 md:bottom-auto md:min-h-full md:z-0
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-16'}
          flex flex-col flex-shrink-0
        `}
      >
        <div className="h-16 flex items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {isOpen ? (
            <div className="flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/70 flex-shrink-0">
                  IQ
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  Admin Panel
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li className="flex justify-center">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isOpen && (
                  <span className="text-sm font-medium">Dashboard</span>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center">
              <NavLink
                to="/admin/students"
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <UserGroupIcon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Student Management</span>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center">
              <NavLink
                to="/admin/teachers"
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <AcademicCapIcon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Teacher Management</span>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center">
              <NavLink
                to="/admin/classes"
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <BookOpenIcon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Class Management</span>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center">
              <NavLink
                to="/admin/subjects"
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <ClipboardDocumentListIcon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Subject Management</span>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center">
              <NavLink
                to="/admin/timetable"
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  } ${isOpen ? 'px-3 py-2.5 gap-3 w-[calc(100%-16px)]' : 'w-10 h-10 justify-center'}`
                }
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <CalendarDaysIcon className="h-5 w-5 flex-shrink-0" />
                {isOpen && (
                  <span className="text-sm font-medium">Timetable Management</span>
                )}
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
