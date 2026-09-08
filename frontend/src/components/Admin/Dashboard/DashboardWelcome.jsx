import { useState } from 'react';
import SearchInput from '../../common/SearchInput/SearchInput';

const DashboardWelcome = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, Admin! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's an overview of your school's latest activities and important statistics.
        </p>
      </div>
      <div className="w-full sm:w-72">
        <SearchInput
          placeholder="Search students, teachers, modules..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export default DashboardWelcome;
