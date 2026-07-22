import { Outlet } from 'react-router-dom';

const FeeManagementLayout = () => {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
};

export default FeeManagementLayout;
