import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TeacherHeader from '../../components/Teacher/Layout/TeacherHeader';
import TeacherSidebar from '../../components/Teacher/Layout/TeacherSidebar';
import TeacherBottomNavigation from '../../components/Teacher/Layout/TeacherBottomNavigation';

const TeacherLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Desktop Sidebar - full height on left */}
      <div className="hidden lg:block flex-shrink-0">
        <TeacherSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Right column: Header + Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TeacherHeader />

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <TeacherBottomNavigation />
    </div>
  );
};

export default TeacherLayout;
