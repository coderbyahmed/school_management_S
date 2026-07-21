import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SchoolConfigProvider } from './contexts/SchoolConfigContext';
import { LoaderProvider } from './contexts/LoaderContext';
import SplashScreen from './components/common/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/Login';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassManagement from './pages/admin/ClassManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import EventsHolidays from './pages/admin/EventsHolidays';
import FeeManagement from './pages/admin/FeeManagement';
import FeeDashboard from './pages/admin/fee/Dashboard';
import FeeStructure from './pages/admin/fee/Structure';
import StudentFees from './pages/admin/fee/Students';
import FeeReports from './pages/admin/fee/Reports';
import SchoolSettings from './pages/admin/SchoolSettings';

function IndexRedirect() {
  const { user, role, loading, DASHBOARD_ROUTES } = useAuth();
  if (loading) return null;
  if (user && role) {
    return <Navigate to={DASHBOARD_ROUTES[role] || '/login'} replace />;
  }
  return <Navigate to="/login" replace />;
}

function AppContent() {
  const { loading: authLoading } = useAuth();

  return (
    <>
      <SplashScreen visible={authLoading} />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="events" element={<EventsHolidays />} />
            <Route path="fees" element={<FeeManagement />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FeeDashboard />} />
              <Route path="structure" element={<FeeStructure />} />
              <Route path="students" element={<StudentFees />} />
              <Route path="reports" element={<FeeReports />} />
            </Route>
            <Route path="settings" element={<SchoolSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route path="/" element={<IndexRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SchoolConfigProvider>
        <LoaderProvider>
          <AppContent />
        </LoaderProvider>
      </SchoolConfigProvider>
    </AuthProvider>
  );
}

export default App;
