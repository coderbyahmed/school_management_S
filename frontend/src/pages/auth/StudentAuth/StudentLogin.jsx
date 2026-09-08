import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/auth/auth.service';
import AuthLayout from '../../../components/Auth/AuthLayout';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Alert from '../../../components/common/Alert/Alert';
import { toast } from 'react-hot-toast';
import { IdentificationIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { user, role, login } = useAuth();
  const navigate = useNavigate();
  const [inactiveError, setInactiveError] = useState('');

  useEffect(() => {
    if (user && role) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, role, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
    if (error) setError('');
    if (inactiveError) setInactiveError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.studentLogin(formData.studentId, formData.password);
      if (response.success) {
        const { user: userData, accessToken, refreshToken } = response;
        login(userData, userData.role, accessToken, refreshToken);
        toast.success('Login Successful');
      } else if (response.message === 'Account deactivated') {
        setInactiveError('Your account has been deactivated by the administrator. You cannot access your account at this time. Please contact the administrator for further assistance.');
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const statusCode = err.response?.status;
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';

      if (statusCode === 403) {
        setInactiveError('Your account has been deactivated by the administrator. You cannot access your account at this time. Please contact the administrator for further assistance.');
      } else {
        const errMap = {
          'Student ID not found': 'studentId',
          'Incorrect password': 'password',
        };
        const targetField = errMap[message];
        if (targetField) {
          setFieldErrors({ [targetField]: message });
        } else {
          setError(message);
          toast.error(message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role="student"
      title="Student Sign In"
      subtitle="Enter your credentials to access the student portal"
    >
      <Alert message={error} type="error" dismissible onDismiss={() => setError('')} />
      {inactiveError && (
        <div className="border border-red-300 bg-red-50 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h3 className="text-sm font-semibold text-red-800">Account Deactivated</h3>
          </div>
          <p className="text-sm text-red-700">{inactiveError}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <Button type="submit" loading={loading} disabled={!!inactiveError}>
          Sign In
        </Button>
      </form>
    </AuthLayout>
  );
};

export default StudentLogin;
