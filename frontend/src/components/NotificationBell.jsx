import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons for icons

const NotificationBell = () => {
  const hasNotifications = false; // Placeholder for actual notification logic

  return (
    <button className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none transition-colors duration-200">
      <BellIcon className="h-5 w-5" />
      {hasNotifications && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
      )}
    </button>
  );
};

export default NotificationBell;
