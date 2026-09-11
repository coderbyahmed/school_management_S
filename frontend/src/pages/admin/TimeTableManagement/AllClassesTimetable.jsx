import { TimetableProvider } from '../../../contexts/TimetableContext';
import AllClassesTimetable from '../../../components/Admin/TimeTableManagement/AllClassesTimetable/AllClassesTimetable';

const AllClassesTimetablePage = () => {
  return (
    <TimetableProvider>
      <AllClassesTimetable />
    </TimetableProvider>
  );
};

export default AllClassesTimetablePage;
