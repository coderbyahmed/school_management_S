import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={logout} className="w-auto" variant="danger">Logout</Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Welcome, <span className="font-semibold">{user?.fullName}</span> (Admin)</p>
        <p className="text-gray-600">Email: {user?.email}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
