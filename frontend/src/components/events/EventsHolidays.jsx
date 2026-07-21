import { useState, useMemo } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import StatCard from '../common/StatCard';
import eventsService from '../../services/events.service';
import AllEvents from './tabs/AllEvents';
import AddEvent from './tabs/AddEvent';
import HolidayManagement from './tabs/HolidayManagement';
import CalendarView from './tabs/CalendarView';
import EventGallery from './tabs/EventGallery';

const tabs = ['All Events', 'Add Event', 'Holiday Management', 'Calendar View', 'Event Gallery'];

const tabComponents = {
  'All Events': AllEvents,
  'Add Event': AddEvent,
  'Holiday Management': HolidayManagement,
  'Calendar View': CalendarView,
  'Event Gallery': EventGallery,
};

const EventsHolidays = () => {
  const [activeTab, setActiveTab] = useState('All Events');
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => eventsService.getStats(), [refreshKey]);

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events & Holidays</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage school events, holidays, and activities</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={SparklesIcon} label="Total Events" value={stats.totalEvents} color="blue" />
        <StatCard icon={SparklesIcon} label="Total Holidays" value={stats.totalHolidays} color="green" />
        <StatCard icon={SparklesIcon} label="Upcoming Events" value={stats.upcomingEvents} color="yellow" />
        <StatCard icon={SparklesIcon} label="Upcoming Holidays" value={stats.upcomingHolidays} color="purple" />
      </div>

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

      <ActiveComponent key={refreshKey} onDataChange={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
};

export default EventsHolidays;
