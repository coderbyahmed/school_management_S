import { UserIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</span>
  </div>
);

const StudentViewModal = ({ student, isOpen, onClose }) => {
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Details" maxWidth="max-w-lg">
      <div className="flex flex-col items-center pb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl ring-2 ring-yellow-400/50 mb-3">
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{student.id}</p>
        <div className="mt-2">
          <StatusBadge status={student.status} />
        </div>
      </div>

      <div className="mt-4">
        <InfoRow label="Father Name" value={student.fatherName} />
        <InfoRow label="Class" value={student.class} />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Parent Phone" value={student.parentPhone} />
      </div>
    </Modal>
  );
};

export default StudentViewModal;
