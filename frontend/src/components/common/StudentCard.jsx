import { UserIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

const StudentCard = ({ student, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg ring-2 ring-yellow-400/50 mb-3">
        {student.avatar ? (
          <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{student.id}</p>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
          {student.class}
        </span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
          {student.gender}
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{student.parentPhone}</p>

      <div className="mt-2">
        <StatusBadge status={student.status} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 w-full flex justify-center">
        <ActionButtons onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default StudentCard;
