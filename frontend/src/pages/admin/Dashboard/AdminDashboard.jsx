import DashboardWelcome from '../../../components/Admin/Dashboard/DashboardWelcome';
import DashboardStats from '../../../components/Admin/Dashboard/DashboardStats';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <DashboardWelcome />
      <DashboardStats />
    </div>
  );
};

export default AdminDashboard;
