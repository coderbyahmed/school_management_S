import { useState } from 'react';
import { KeyIcon, EnvelopeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../common/Modal';
import Input from '../common/Input';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    currentEmail: '',
    newEmail: '',
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleCancel = () => {
    setForm({ currentPassword: '', newPassword: '', currentEmail: '', newEmail: '' });
    onClose();
  };

  const handleSave = () => {
    setForm({ currentPassword: '', newPassword: '', currentEmail: '', newEmail: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Account Settings">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <KeyIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Change Password</h3>
          </div>
          <div className="space-y-1">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange('currentPassword')}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder="Enter new password"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700" />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <EnvelopeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Change Email</h3>
          </div>
          <div className="space-y-1">
            <Input
              label="Current Email"
              name="currentEmail"
              type="email"
              value={form.currentEmail}
              onChange={handleChange('currentEmail')}
              placeholder="Enter current email"
              icon={EnvelopeIcon}
            />
            <Input
              label="New Email"
              name="newEmail"
              type="email"
              value={form.newEmail}
              onChange={handleChange('newEmail')}
              placeholder="Enter new email"
              icon={EnvelopeIcon}
            />
          </div>
          <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-lg">
            <InformationCircleIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
              OTP verification will be implemented by backend later.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
