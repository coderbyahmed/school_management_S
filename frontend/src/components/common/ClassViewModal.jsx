import Modal from './Modal';
import StatusBadge from './StatusBadge';

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value || '-'}</span>
  </div>
);

const ClassViewModal = ({ classData, isOpen, onClose }) => {
  if (!classData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Class Details" maxWidth="max-w-lg">
      <div className="flex flex-col items-center pb-5 border-b border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg ring-2 ring-yellow-400/50 mb-3">
          {classData.className?.slice(0, 2).toUpperCase() || 'CL'}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{classData.className}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{classData.academicYear}</p>
        <div className="mt-2">
          <StatusBadge status={classData.status} />
        </div>
      </div>

      <div className="mt-4">
        <InfoRow label="Total Students" value={classData.totalStudents || 0} />
        <InfoRow label="Total Subjects" value={classData.totalSubjects || 0} />
        <InfoRow label="Description" value={classData.description} />
      </div>
    </Modal>
  );
};

export default ClassViewModal;
