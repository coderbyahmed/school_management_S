import { useState } from 'react';
import { ArrowTrendingUpIcon, AcademicCapIcon, ClockIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SelectInput from '../../common/SelectInput';
import SearchInput from '../../common/SearchInput';
import Table from '../../common/Table';
import ActionButtons from '../../common/ActionButtons';
import ConfirmationModal from '../../common/ConfirmationModal';

const dummyPromotionsData = [
  { id: 1, studentName: 'Ahmed Hassan', prevClass: 'Class 4', newClass: 'Class 5', prevYear: '2025', newYear: '2026', date: '2026-03-15', status: 'Completed' },
  { id: 2, studentName: 'Fatima Tariq', prevClass: 'Class 2', newClass: 'Class 3', prevYear: '2025', newYear: '2026', date: '2026-03-15', status: 'Completed' },
  { id: 3, studentName: 'Ayesha Khan', prevClass: 'Class 7', newClass: 'Class 8', prevYear: '2025', newYear: '2026', date: '2026-03-16', status: 'Completed' },
  { id: 4, studentName: 'Hassan Rizvi', prevClass: 'Class 9', newClass: 'Class 10', prevYear: '2025', newYear: '2026', date: '2026-03-16', status: 'Completed' },
  { id: 5, studentName: 'Hira Batool', prevClass: 'Class 6', newClass: 'Class 7', prevYear: '2025', newYear: '2026', date: '2026-03-17', status: 'Pending' },
  { id: 6, studentName: 'Haider Abbas', prevClass: 'Class 8', newClass: 'Class 9', prevYear: '2025', newYear: '2026', date: '2026-03-17', status: 'Pending' },
];

const PromotionHistory = () => {
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [nameSearch, setNameSearch] = useState('');
  const [promotions, setPromotions] = useState(dummyPromotionsData);
  const [deletingPromotion, setDeletingPromotion] = useState(null);

  const filteredPromotions = promotions.filter((p) => {
    if (yearFilter !== 'All' && p.newYear !== yearFilter) return false;
    if (classFilter !== 'All Classes' && p.newClass !== classFilter) return false;
    if (nameSearch && !p.studentName.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    return true;
  });

  const totalPromotions = promotions.length;
  const thisYearPromotions = promotions.filter((p) => p.newYear === '2026').length;
  const prevYearPromotions = promotions.filter((p) => p.newYear === '2025').length;
  const pendingPromotions = promotions.filter((p) => p.status === 'Pending').length;

  const columns = [
    { key: 'student', label: 'Student' },
    { key: 'prevClass', label: 'Previous Class' },
    { key: 'newClass', label: 'Promoted Class' },
    { key: 'prevYear', label: 'Previous Year' },
    { key: 'newYear', label: 'New Year' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderRow = (promotion) => (
    <>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {promotion.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{promotion.studentName}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.prevClass}</td>
      <td className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400">{promotion.newClass}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.prevYear}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.newYear}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{promotion.date}</td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          promotion.status === 'Completed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${promotion.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {promotion.status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right">
        <ActionButtons onDelete={() => setDeletingPromotion(promotion)} />
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotion History</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ArrowTrendingUpIcon} label="Total Promotions" value={totalPromotions} color="blue" />
        <StatCard icon={AcademicCapIcon} label="This Year Promotions" value={thisYearPromotions} color="green" />
        <StatCard icon={ClockIcon} label="Previous Year Promotions" value={prevYearPromotions} color="yellow" />
        <StatCard icon={EllipsisHorizontalCircleIcon} label="Pending Promotions" value={pendingPromotions} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full sm:w-44">
          <SelectInput
            label="Academic Year"
            name="yearFilter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            options={['All', '2025', '2026', '2027']}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectInput
            label="Class"
            name="classFilter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={['All Classes', 'Montessori', 'Nursery', 'KG 1', 'KG 2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']}
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Search Student
          </label>
          <SearchInput
            placeholder="Search student name"
            value={nameSearch}
            onChange={setNameSearch}
          />
        </div>
      </div>

      <Table columns={columns} data={filteredPromotions} renderRow={renderRow} />

      <ConfirmationModal
        isOpen={!!deletingPromotion}
        onClose={() => setDeletingPromotion(null)}
        title="Delete Promotion Record"
        message="Are you sure you want to delete this promotion record?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setPromotions((prev) => prev.filter((p) => p.id !== deletingPromotion.id));
          setDeletingPromotion(null);
        }}
      />
    </div>
  );
};

export default PromotionHistory;
