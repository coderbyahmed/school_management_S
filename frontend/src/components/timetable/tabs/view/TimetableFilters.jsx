import SelectInput from '../../../common/SelectInput';

const TimetableFilters = ({ filters, onFilterChange, onView, viewDisabled, viewLabel = 'View Timetable' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        {filters.map((filter) => (
          <div key={filter.name} className="w-full sm:w-56">
            <SelectInput
              label={filter.label}
              name={filter.name}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              options={filter.options}
              placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`}
            />
          </div>
        ))}
        <div className="pb-4">
          <button
            onClick={onView}
            disabled={viewDisabled}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {viewLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableFilters;
