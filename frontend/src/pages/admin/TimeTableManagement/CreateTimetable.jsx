import { TimetableProvider } from '../../../contexts/TimetableContext';
import CreateTimetable from '../../../components/Admin/TimeTableManagement/CreateTimetable/CreateTimetable';

const CreateTimetablePage = () => {
  return (
    <TimetableProvider>
      <CreateTimetable />
    </TimetableProvider>
  );
};

export default CreateTimetablePage;
