import { useAuth } from '../../../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const isAdminAccess = sessionStorage.getItem('isAdminAccess') === 'true';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Teacher'}
          </p>
        </div>
        {isAdminAccess && (
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
            Admin View
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Classes', value: '6', color: 'blue' },
          { label: 'Total Students', value: '180', color: 'emerald' },
          { label: 'Today\'s Attendance', value: '92%', color: 'amber' },
          { label: 'Pending Tasks', value: '3', color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Class 10-A - Mathematics</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Next: 9:00 AM - 10:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Attendance Pending - Class 9-B</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due by 10:30 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Parent-Teacher Meeting</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 2:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Name:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.fullName || 'Teacher'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Teacher ID:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.teacherId || 'TCH-001'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Email:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.email || 'teacher@school.com'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Department:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.department || 'Mathematics'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
