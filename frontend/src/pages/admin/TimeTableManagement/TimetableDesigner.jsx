import { TimetableProvider } from '../../../contexts/TimetableContext';
import TimetableDesigner from '../../../components/Admin/TimeTableManagement/TimetableDesigner/TimetableDesigner';

const TimetableDesignerPage = () => {
  return (
    <TimetableProvider>
      <TimetableDesigner />
    </TimetableProvider>
  );
};

export default TimetableDesignerPage;
