import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button/Button';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const isAdminAccess = sessionStorage.getItem('isAdminAccess') === 'true';

  const handleLogout = async () => {
    if (isAdminAccess) {
      sessionStorage.removeItem('isAdminAccess');
      window.close();
      return;
    }
    await logout();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <div className="flex items-center gap-3">
          {isAdminAccess && (
            <div className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
              Admin View
            </div>
          )}
          <Button onClick={handleLogout} className="w-auto" variant="danger">
            {isAdminAccess ? 'Exit Panel' : 'Logout'}
          </Button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Welcome, <span className="font-semibold">{user?.fullName}</span> (Teacher)</p>
        <p className="text-gray-600">Teacher ID: {user?.teacherId}</p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
