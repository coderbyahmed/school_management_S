import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import schoolSettingsService from '../../services/schoolSettings.service';
import { getImageUrl } from '../../utils/imageUrl';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, IdentificationIcon, LockClosedIcon, UserGroupIcon, AcademicCapIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    teacherId: '',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [schoolBranding, setSchoolBranding] = useState(null);
  const { user, role, login, DASHBOARD_ROUTES } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role && DASHBOARD_ROUTES[role]) {
      navigate(DASHBOARD_ROUTES[role], { replace: true });
    }
  }, [user, role, navigate, DASHBOARD_ROUTES]);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await schoolSettingsService.getPublicSchoolSettings();
        setSchoolBranding(res.data);
      } catch {
        // fallback to defaults
      }
    };
    fetchBranding();
  }, []);

  const schoolName = schoolBranding?.schoolName || 'School Name';
  const schoolLogoUrl = schoolBranding?.logo ? getImageUrl(schoolBranding.logo) : null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (activeTab === 'admin') {
        response = await authService.adminLogin(formData.email, formData.password);
      } else if (activeTab === 'teacher') {
        response = await authService.teacherLogin(formData.teacherId, formData.password);
      } else {
        response = await authService.studentLogin(formData.studentId, formData.password);
      }

      if (response.success) {
        const { user: userData, accessToken, refreshToken } = response;
        login(userData, userData.role, accessToken, refreshToken);
        toast.success('Login Successful');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      const errMap = {
        'Email not found': 'email',
        'Incorrect password': 'password',
        'Teacher ID not found': 'teacherId',
        'Student ID not found': 'studentId',
      };
      const targetField = errMap[message];
      if (targetField) {
        setFieldErrors({ [targetField]: message });
        setError('');
      } else {
        setError(message);
        setFieldErrors({});
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'admin', label: 'Admin', icon: ShieldCheckIcon },
    { id: 'teacher', label: 'Teacher', icon: UserGroupIcon },
    { id: 'student', label: 'Student', icon: AcademicCapIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg ring-4 ring-yellow-400/50 overflow-hidden">
            {schoolLogoUrl ? (
              <img src={schoolLogoUrl} alt={schoolName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white">{schoolName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2 className="mt-3 text-xl md:text-2xl font-bold text-gray-900 text-center leading-tight">
            {schoolName}
          </h2>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 px-5 py-6 sm:px-8">
          <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-xl mb-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === id
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } capitalize`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Alert message={error} type="error" />

          <form className="space-y-3" onSubmit={handleSubmit}>
            {activeTab === 'admin' && (
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@school.com"
                icon={EnvelopeIcon}
                error={fieldErrors.email}
              />
            )}

            {activeTab === 'teacher' && (
              <Input
                label="Teacher ID"
                name="teacherId"
                type="text"
                required
                value={formData.teacherId}
                onChange={handleChange}
                placeholder="T-12345"
                icon={IdentificationIcon}
                error={fieldErrors.teacherId}
              />
            )}

            {activeTab === 'student' && (
              <Input
                label="Student ID"
                name="studentId"
                type="text"
                required
                value={formData.studentId}
                onChange={handleChange}
                placeholder="STD-000001"
                icon={IdentificationIcon}
                error={fieldErrors.studentId}
              />
            )}

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={LockClosedIcon}
              error={fieldErrors.password}
            />

            {activeTab === 'admin' && (
              <div className="flex items-center justify-end">
                <Link
                  to="/admin/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            <Button type="submit" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
