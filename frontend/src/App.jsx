import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SchoolConfigProvider, useSchoolConfig } from './contexts/SchoolConfigContext';
import { LoaderProvider } from './contexts/LoaderContext';
import SplashScreen from './components/common/SplashScreen';
import FullPageLoader from './components/common/FullPageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import { ADMIN_MODULES } from './constants/adminModules';

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
  const { user, role, loading: authLoading, DASHBOARD_ROUTES } = useAuth();
  const { loading: configLoading, preferences } = useSchoolConfig();

  if (authLoading) return null;
  if (!user || !role) return <Navigate to="/login" replace />;

  if (role !== 'admin') {
    return <Navigate to={DASHBOARD_ROUTES[role] || '/login'} replace />;
  }

  if (configLoading) return <FullPageLoader />;

  const landingPage = preferences?.defaultLandingPage;
  const route = ADMIN_MODULES[landingPage] || '/admin';
  return <Navigate to={route} replace />;
}
function AppContent() {
  const { loading: authLoading } = useAuth();
  const { loaded: configLoaded, login: loginConfig } = useSchoolConfig();
  const splashEnabled = configLoaded ? (loginConfig?.splashEnabled ?? true) : true;
  const loaderStyle = configLoaded ? (loginConfig?.loaderStyle || '') : '';

  const [splashTimerExpired, setSplashTimerExpired] = useState(false);

  useEffect(() => {
    if (authLoading || !splashEnabled) return;
    const resetId = setTimeout(() => setSplashTimerExpired(false), 0);
    const timerId = setTimeout(() => setSplashTimerExpired(true), 1200);
    return () => { clearTimeout(resetId); clearTimeout(timerId); };
  }, [authLoading, splashEnabled]);

  const splashVisible = authLoading || (splashEnabled && !splashTimerExpired);

  return (
    <>
      <SplashScreen visible={splashVisible} loaderStyle={loaderStyle} />
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
