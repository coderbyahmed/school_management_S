import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, KeyIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { toast } from 'react-hot-toast';

const COUNTDOWN_DURATION = 5 * 60;

const AccountSettingsModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const resetState = () => {
    setActiveSection(null);
    setLoading(false);
    setError('');
    setSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setNewEmail('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
    setResendDisabled(false);
    clearTimeout(timerRef.current);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const startCountdown = (expiresAt) => {
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    setCountdown(remaining);
    setResendDisabled(remaining > 0);
  };

  const handleSendOtp = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (!newEmail) {
      setError('Please enter your new email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authService.sendChangeEmailOtp(currentPassword, newEmail);
      setOtpSent(true);
      setSuccess('');
      toast.success('OTP sent to your current email');
      startCountdown(data.expiresAt);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.verifyChangeEmailOtp(otp);
      setOtpVerified(true);
      setSuccess('Email updated successfully');
      toast.success('Email updated successfully');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Account Settings
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <Alert message={error} type="error" onClose={() => setError('')} />
          <Alert message={success} type="success" onClose={() => setSuccess('')} />

          {!activeSection && (
            <div className="space-y-3">
              <button
                onClick={() => { setActiveSection('password'); setError(''); setSuccess(''); }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <KeyIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Change Password</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your account password</p>
                </div>
              </button>
              <button
                onClick={() => { setActiveSection('email'); setError(''); setSuccess(''); }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <EnvelopeIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Change Email</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">OTP verified email update</p>
                </div>
              </button>
            </div>
          )}

          {activeSection === 'password' && (
            <div className="space-y-4">
              <button
                onClick={() => { setActiveSection(null); setError(''); setSuccess(''); setCurrentPassword(''); setNewPassword(''); }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                &larr; Back
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <KeyIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Change Password</h3>
              </div>
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
              <div className="flex gap-3 pt-1">
                <Button variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
                <Button onClick={handleChangePassword} loading={loading} className="flex-1">Update Password</Button>
              </div>
            </div>
          )}

          {activeSection === 'email' && !otpSent && (
            <div className="space-y-4">
              <button
                onClick={() => { setActiveSection(null); setError(''); setSuccess(''); setCurrentPassword(''); setNewEmail(''); }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                &larr; Back
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <EnvelopeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Change Email</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verify your identity first. An OTP will be sent to your current email.
              </p>
              <Input
                label="Current Password"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Email Address"
                name="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />
              <div className="flex gap-3 pt-1">
                <Button variant="secondary" onClick={handleClose} className="flex-1">Cancel</Button>
                <Button onClick={handleSendOtp} loading={loading} className="flex-1">Send OTP</Button>
              </div>
            </div>
          )}

          {activeSection === 'email' && otpSent && !otpVerified && (
            <div className="space-y-4">
              <button
                onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                &larr; Back
              </button>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <EnvelopeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Verify OTP</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                An OTP has been sent to your current email. Enter it below.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">New email:</span>
                <span className="font-medium text-gray-800 dark:text-white">{newEmail}</span>
              </div>
              <Input
                label="OTP Code"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
              {countdown > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  OTP expires in {formatTime(countdown)}
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="secondary"
                  onClick={handleSendOtp}
                  loading={loading}
                  disabled={resendDisabled}
                  className="flex-1"
                >
                  {resendDisabled ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
                </Button>
                <Button onClick={handleVerifyOtp} loading={loading} className="flex-1">Verify OTP</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;