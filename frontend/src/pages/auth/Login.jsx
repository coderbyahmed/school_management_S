import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { toast } from 'react-hot-toast';

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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        const { user, accessToken, refreshToken } = response;
        const role = user.role;
        login(user, role, accessToken, refreshToken);
        toast.success('Login Successful');
        
        if (role === 'admin') navigate('/admin');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img className="h-16 w-auto" src="/favicon.svg" alt="School Logo" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iqra Anwar ul Quran Sec School
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            {['admin', 'teacher', 'student'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                } capitalize`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Alert message={error} type="error" />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {activeTab === 'admin' && (
              <Input
                label="Email address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@school.com"
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
                placeholder="S-12345"
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
            />

            {activeTab === 'admin' && (
              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link
                    to="/admin/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}

            <div>
              <Button type="submit" loading={loading}>
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
