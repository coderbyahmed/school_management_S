
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Button onClick={logout} className="w-auto" variant="danger">Logout</Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Welcome, <span className="font-semibold">{user?.fullName}</span> (Student)</p>
        <p className="text-gray-600">Student ID: {user?.studentId}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
