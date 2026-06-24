import { useState } from 'react';
import AllClassesTimetable from './tabs/AllClassesTimetable';
import CreateTimetable from './tabs/CreateTimetable';
import ViewTimetable from './tabs/ViewTimetable';
import PrintTimetable from './tabs/PrintTimetable';

const tabs = ['All Classes Timetable', 'Create Timetable', 'View Timetable', 'Print Timetable'];

const tabComponents = {
  'All Classes Timetable': AllClassesTimetable,
  'Create Timetable': CreateTimetable,
  'View Timetable': ViewTimetable,
  'Print Timetable': PrintTimetable,
};

const TimetableManagement = () => {
  const [activeTab, setActiveTab] = useState('All Classes Timetable');

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <ActiveComponent />
    </div>
  );
};

export default TimetableManagement;
