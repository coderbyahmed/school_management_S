import { useState, useCallback } from 'react';
import Modal from '../../common/Modal/Modal';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import Alert from '../../common/Alert/Alert';
import authService from '../../../services/auth/auth.service';
import { CheckCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const validateNewPassword = (password) => {
  if (!password || !password.trim()) {
    return 'New password is required';
  }
  if (/\s/.test(password)) {
    return 'Spaces are not allowed in the password';
  }
  if (password.length > 10) {
    return 'Password cannot be more than 10 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*()_=+{}:;"'|\\,.<>?[\]-]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

const TeacherChangePasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const setFieldError = useCallback((field, message) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
    setGlobalError('');
  };

  const handleVerifyCurrentPassword = async (e) => {
    e.preventDefault();
    clearAllFieldErrors();
    setGlobalError('');

    const currentPassword = formData.currentPassword;
    if (!currentPassword || !currentPassword.trim()) {
      setFieldError('currentPassword', 'Current password is required');
      toast.error('Current password is required');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyTeacherPassword(currentPassword);
      clearFieldError('currentPassword');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Current password is incorrect';
      setFieldError('currentPassword', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    clearAllFieldErrors();
    setGlobalError('');

    const { newPassword, confirmPassword } = formData;

    const newPwError = validateNewPassword(newPassword);
    const confirmPwError = !confirmPassword || !confirmPassword.trim()
      ? 'Confirm password is required'
      : '';

    let hasError = false;

    if (newPwError) {
      setFieldError('newPassword', newPwError);
      hasError = true;
    }

    if (confirmPwError) {
      setFieldError('confirmPassword', confirmPwError);
      hasError = true;
    }

    if (hasError) {
      const messages = [newPwError, confirmPwError].filter(Boolean);
      toast.error(messages[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.teacherChangePassword(
        formData.currentPassword,
        newPassword,
        confirmPassword
      );
      toast.success('Password updated successfully');
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    clearAllFieldErrors();
    setGlobalError('');
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      {step === 1 ? (
        <form onSubmit={handleVerifyCurrentPassword} noValidate>
          {globalError && <Alert message={globalError} type="error" className="mb-4" />}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <KeyIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Verify your current password
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your current password to continue
              </p>
            </div>
          </div>
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            error={fieldErrors.currentPassword}
          />
          <Button type="submit" loading={loading}>
            Verify Password
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmitNewPassword} noValidate>
          {globalError && <Alert message={globalError} type="error" className="mb-4" />}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Password verified
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>
          </div>
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            error={fieldErrors.newPassword}
            maxLength={10}
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            error={fieldErrors.confirmPassword}
            maxLength={10}
          />
          <Button type="submit" loading={loading}>
            Update Password
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default TeacherChangePasswordModal;
