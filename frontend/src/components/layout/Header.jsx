import { Bars3Icon } from '@heroicons/react/24/outline'; // Assuming Heroicons for icons
import DateTime from './DateTime';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import AdminDropdown from './AdminDropdown';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 shadow-md px-6">
      {/* Left section: Hamburger Menu, School Logo, School Name */}
      <div className="flex items-center">
        {/* Hamburger menu to toggle sidebar */}
        <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 focus:outline-none mr-4">
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Circular School Logo Placeholder */}
        <div className="w-10 h-10 rounded-full bg-yellow-200 dark:bg-yellow-700 flex items-center justify-center text-yellow-800 dark:text-yellow-100 font-bold text-md mr-3">
          S
        </div>

        {/* School Name */}
        <span className="text-xl font-semibold text-gray-800 dark:text-white">
          Iqra Anwar-ul-Quran Secondary School
        </span>
      </div>

      {/* Right section: Live Date & Time, Theme Toggle, Notification Bell, Admin Profile Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Live Date & Time */}
        <DateTime />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Admin Profile Dropdown */}
        <AdminDropdown />
      </div>
    </header>
  );
};

export default Header;
