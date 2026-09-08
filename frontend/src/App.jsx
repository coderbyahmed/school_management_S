import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  SchoolConfigProvider,
  useSchoolConfig,
} from "./contexts/SchoolConfigContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import SplashScreen from "./components/common/SplashScreen/SplashScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { ADMIN_MODULES } from "./constants/adminModules";

import AdminLoginPage from "./pages/auth/AdminAuth/AdminLogin";
import AdminForgotPasswordPage from "./pages/auth/AdminAuth/ForgotPassword";
import AdminVerifyOTPPage from "./pages/auth/AdminAuth/VerifyOTP";
import AdminResetPasswordPage from "./pages/auth/AdminAuth/ResetPassword";
import TeacherLoginPage from "./pages/auth/TeacherAuth/TeacherLogin";
import StudentLoginPage from "./pages/auth/StudentAuth/StudentLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import AllStudentsPage from "./pages/admin/StudentManagement/AllStudents";
import AddStudentPage from "./pages/admin/StudentManagement/AddStudent";
import StudentPromotionPage from "./pages/admin/StudentManagement/StudentPromotion";
import PromotionHistoryPage from "./pages/admin/StudentManagement/PromotionHistory";
import AllTeachersPage from "./pages/admin/TeacherManagement/AllTeachers";
import AddTeacherPage from "./pages/admin/TeacherManagement/AddTeacher";
import TeacherSubjectAssignmentPage from "./pages/admin/TeacherManagement/TeacherSubjectAssignment";
import ClassManagement from "./pages/admin/ClassManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import TimetableManagement from "./pages/admin/TimetableManagement";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import EventsHolidays from "./pages/admin/EventsHolidays";
import FeeStructurePage from "./pages/admin/FeeManagement/FeeStructure";
import CollectFeePage from "./pages/admin/FeeManagement/CollectFee";
import StudentFeeDetailsPage from "./pages/admin/FeeManagement/StudentFeeDetails";
import FeeReportsPage from "./pages/admin/FeeManagement/Reports";
import OutstandingDuesPage from "./pages/admin/FeeManagement/OutstandingDues";
import SchoolSettings from "./pages/admin/SchoolSettings";
import AllAccountsPage from "./pages/admin/UserAccounts/AllAccounts";
import PasswordManagementPage from "./pages/admin/UserAccounts/PasswordManagement";
import AccountDetailsPage from "./pages/admin/UserAccounts/AccountDetails";

function IndexRedirect() {
  const { user, role, loading: authLoading } = useAuth();
  const { preferences } = useSchoolConfig();

  if (authLoading) return null;
  if (!user || !role) return <Navigate to="/admin/login" replace />;

  if (role === "admin") {
    const landingPage = preferences?.defaultLandingPage;
    const route = ADMIN_MODULES[landingPage] || "/admin";
    return <Navigate to={route} replace />;
  }

  return null;
}
function AppContent() {
  const { loading: authLoading } = useAuth();
  const { loaded: configLoaded, login: loginConfig } = useSchoolConfig();
  const splashEnabled = configLoaded
    ? (loginConfig?.splashEnabled ?? true)
    : true;
  const loaderStyle = configLoaded ? loginConfig?.loaderStyle || "" : "";

  const [splashTimerExpired, setSplashTimerExpired] = useState(false);

  useEffect(() => {
    if (authLoading || !splashEnabled) return;
    const resetId = setTimeout(() => setSplashTimerExpired(false), 0);
    const timerId = setTimeout(() => setSplashTimerExpired(true), 1200);
    return () => {
      clearTimeout(resetId);
      clearTimeout(timerId);
    };
  }, [authLoading, splashEnabled]);

  const splashVisible = authLoading || (splashEnabled && !splashTimerExpired);

  return (
    <>
      <SplashScreen visible={splashVisible} loaderStyle={loaderStyle} />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/forgot-password"
          element={<AdminForgotPasswordPage />}
        />
        <Route path="/admin/verify-otp" element={<AdminVerifyOTPPage />} />
        <Route
          path="/admin/reset-password"
          element={<AdminResetPasswordPage />}
        />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/student/login" element={<StudentLoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route
              path="students"
              element={<Navigate to="/admin/students/all" replace />}
            />
            <Route path="students/all" element={<AllStudentsPage />} />
            <Route path="students/add" element={<AddStudentPage />} />
            <Route
              path="students/promotion"
              element={<StudentPromotionPage />}
            />
            <Route
              path="students/promotion-history"
              element={<PromotionHistoryPage />}
            />
            <Route
              path="teachers"
              element={<Navigate to="/admin/teachers/all" replace />}
            />
            <Route path="teachers/all" element={<AllTeachersPage />} />
            <Route path="teachers/add" element={<AddTeacherPage />} />
            <Route
              path="teachers/subject-assignment"
              element={<TeacherSubjectAssignmentPage />}
            />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="timetable" element={<TimetableManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="events" element={<EventsHolidays />} />
            <Route path="fees/fee-structure" element={<FeeStructurePage />} />
            <Route path="fees/collect-fee" element={<CollectFeePage />} />
            <Route
              path="fees/student-fee-details"
              element={<StudentFeeDetailsPage />}
            />
            <Route path="fees/reports" element={<FeeReportsPage />} />
            <Route
              path="fees/outstanding-dues"
              element={<OutstandingDuesPage />}
            />
            <Route path="user-accounts/all" element={<AllAccountsPage />} />
            <Route path="user-accounts/password-management" element={<PasswordManagementPage />} />
            <Route path="user-accounts/:loginId" element={<AccountDetailsPage />} />
            <Route path="settings" element={<SchoolSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route path="/" element={<IndexRedirect />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
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
