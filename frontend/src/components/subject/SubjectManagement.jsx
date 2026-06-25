import { useState } from 'react';
import AllSubjects from './tabs/AllSubjects';
import AddSubject from './tabs/AddSubject';
import ClassSubjectAssignment from './tabs/ClassSubjectAssignment';
import TeacherSubjectAssignment from './tabs/TeacherSubjectAssignment';

const tabs = ['All Subjects', 'Add Subject', 'Class Subject Assignment', 'Teacher Subject Assignment'];

const SubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('All Subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const tabComponents = {
    'All Subjects': AllSubjects,
    'Add Subject': AddSubject,
    'Class Subject Assignment': ClassSubjectAssignment,
    'Teacher Subject Assignment': TeacherSubjectAssignment,
  };

  const ActiveComponent = tabComponents[activeTab];

  const handleViewDetails = (subject) => {
    setSelectedSubject(subject);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setActiveTab('Add Subject');
  };

  const handleAddSuccess = () => {
    setEditingSubject(null);
    setActiveTab('All Subjects');
  };

  const componentProps = {};
  if (activeTab === 'All Subjects') {
    componentProps.onViewDetails = handleViewDetails;
    componentProps.onEditSubject = handleEditSubject;
    componentProps.selectedSubject = selectedSubject;
    componentProps.onCloseView = () => setSelectedSubject(null);
  }
  if (activeTab === 'Add Subject') {
    componentProps.editData = editingSubject;
    componentProps.onSuccess = handleAddSuccess;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== 'Add Subject') setEditingSubject(null); if (tab !== 'All Subjects') setSelectedSubject(null); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <ActiveComponent {...componentProps} />
    </div>
  );
};

export default SubjectManagement;
