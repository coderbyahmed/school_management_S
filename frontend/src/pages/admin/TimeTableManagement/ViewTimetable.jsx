import { TimetableProvider } from '../../../contexts/TimetableContext';
import ViewTimetable from '../../../components/Admin/TimeTableManagement/ViewTimetable/ViewTimetable';

const ViewTimetablePage = () => {
  return (
    <TimetableProvider>
      <ViewTimetable />
    </TimetableProvider>
  );
};

export default ViewTimetablePage;
