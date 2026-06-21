const StudentProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>

      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-lg font-semibold">No Student Selected</p>
        <p className="text-sm mt-1">Select a student from the list to view their profile.</p>
      </div>
    </div>
  );
};

export default StudentProfile;
