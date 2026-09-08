import {
  UserGroupIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';

const stats = [
  {
    label: 'Total Students',
    value: '1,250',
    icon: UserGroupIcon,
    color: 'blue',
  },
  {
    label: 'Total Teachers',
    value: '64',
    icon: AcademicCapIcon,
    color: 'green',
  },
  {
    label: 'Total Classes',
    value: '32',
    icon: UsersIcon,
    color: 'yellow',
  },
  {
    label: 'Total Subjects',
    value: '18',
    icon: BookOpenIcon,
    color: 'red',
  },
  {
    label: "Today's Student Attendance",
    value: '92%',
    icon: CheckCircleIcon,
    color: 'green',
  },
  {
    label: "Today's Teacher Attendance",
    value: '95%',
    icon: ClipboardDocumentCheckIcon,
    color: 'blue',
  },
  {
    label: 'Monthly Fee Collection',
    value: 'Rs. 2,450,000',
    icon: CurrencyDollarIcon,
    color: 'green',
  },
  {
    label: 'Outstanding Fee Dues',
    value: 'Rs. 380,000',
    icon: ExclamationTriangleIcon,
    color: 'red',
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
