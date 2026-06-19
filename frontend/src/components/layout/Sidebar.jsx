import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons for icons

const Sidebar = ({ isOpen }) => { // Accept isOpen as prop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile drawer

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // When opening mobile menu, ensure the main sidebar is also considered open visually if it's not already
    // This part of logic might need refinement based on exact UX desired
    // For now, let's keep it simple: mobile menu toggle is separate from main sidebar collapse
  };

  return (
    <>
      {/* Mobile Hamburger Icon (controls mobile menu) */}
      <div className="md:hidden fixed top-0 left-0 p-4 z-50">
        <button onClick={toggleMobileMenu} className="text-gray-800 dark:text-white focus:outline-none">
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? 'translate-x-0 w-64' // Mobile menu is open
              : '-translate-x-full' // Mobile menu is closed
          }
          md:relative md:translate-x-0 // Always visible on desktop relative to its parent
          ${isOpen ? 'md:w-64' : 'md:w-20'} // Desktop width controlled by isOpen prop
        `}
      >
        <div className="p-4 flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          {(isOpen || isMobileMenuOpen) ? ( // Show full content if desktop sidebar open or mobile menu open
            <div className="text-center">
              {/* Circular School Logo Placeholder */}
              <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-700 mx-auto mb-2 flex items-center justify-center text-blue-800 dark:text-blue-100 font-bold text-lg">
                S
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Admin Panel</h2>
            </div>
          ) : (
            <div className="text-center">
              {/* Circular School Logo Placeholder (collapsed) */}
              <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-100 font-bold text-md">
                S
              </div>
            </div>
          )}
        </div>

        <nav className="mt-5">
          <ul>
            <li>
              <NavLink
                to="/admin"
                end // Ensures this link is only active when path is exactly /admin
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-lg mx-3 transition-colors duration-200 ${
                    isActive ? 'bg-blue-500 text-white shadow-md' : ''
                  }`
                }
                onClick={() => isMobileMenuOpen && toggleMobileMenu()} // Close mobile menu on nav
              >
                {/* Dashboard Icon Placeholder */}
                <svg
                  className={`h-6 w-6 ${isOpen || isMobileMenuOpen ? 'mr-3' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                <span className={`${isOpen || isMobileMenuOpen ? 'block' : 'hidden'}`}>Dashboard</span>
              </NavLink>
            </li>
            {/* Space for future modules */}
            <li className="mt-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {(isOpen || isMobileMenuOpen) && 'Future Modules'}
            </li>
            <li className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
              {(isOpen || isMobileMenuOpen) && 'Coming Soon...'}
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
