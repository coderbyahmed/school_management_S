import { useState } from 'react';
import AllClasses from './tabs/AllClasses';
import AddClass from './tabs/AddClass';
import ClassDetails from './tabs/ClassDetails';

const tabs = ['All Classes', 'Add Class', 'Class Details'];

const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState('All Classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  const tabComponents = {
    'All Classes': AllClasses,
    'Add Class': AddClass,
    'Class Details': ClassDetails,
  };

  const ActiveComponent = tabComponents[activeTab];

  const handleViewDetails = (classData) => {
    setSelectedClass(classData);
    setActiveTab('Class Details');
  };

  const handleEditClass = (classData) => {
    setEditingClass(classData);
    setActiveTab('Add Class');
  };

  const handleAddSuccess = () => {
    setEditingClass(null);
    setActiveTab('All Classes');
  };

  const handleBackToAll = () => {
    setSelectedClass(null);
    setActiveTab('All Classes');
  };

  const componentProps = {};
  if (activeTab === 'All Classes') {
    componentProps.onViewDetails = handleViewDetails;
    componentProps.onEditClass = handleEditClass;
  }
  if (activeTab === 'Add Class') {
    componentProps.editData = editingClass;
    componentProps.onSuccess = handleAddSuccess;
  }
  if (activeTab === 'Class Details') {
    componentProps.classData = selectedClass;
    componentProps.onBack = handleBackToAll;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== 'Add Class') setEditingClass(null); if (tab !== 'Class Details') setSelectedClass(null); }}
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

      <ActiveComponent key={activeTab === 'Add Class' ? editingClass?._id || 'add-class' : activeTab === 'Class Details' ? selectedClass?._id || 'no-class' : undefined} {...componentProps} />
    </div>
  );
};

export default ClassManagement;
