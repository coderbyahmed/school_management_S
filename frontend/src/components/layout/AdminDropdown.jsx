import { useState } from 'react';
import { ChevronDownIcon, UserCircleIcon, KeyIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-blue-300 dark:bg-blue-600 flex items-center justify-center text-blue-800 dark:text-blue-100 font-bold text-sm">
          A
        </div>
        <span className="hidden md:block">Admin Name</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50">
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => { setIsOpen(false); }}
          >
            <UserCircleIcon className="mr-2 h-4 w-4" /> My Profile
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => { setIsOpen(false); }}
          >
            <KeyIcon className="mr-2 h-4 w-4" /> Change Password
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={handleLogout}
          >
            <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;
