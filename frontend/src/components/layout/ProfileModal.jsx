import { useState, useEffect } from 'react';
import { PencilSquareIcon, EnvelopeIcon, ShieldCheckIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { toast } from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({ fullName: '' });

  const loadProfile = async () => {
    setFetching(true);
    setError('');
    try {
      const data = await authService.getProfile();
      setProfile(data.user);
      setEditForm({ fullName: data.user.fullName });
      setIsEditing(false);
    } catch {
      setError('Failed to load profile');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadProfile();
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!editForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authService.updateProfile({ fullName: editForm.fullName.trim() });
      setProfile(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ fullName: profile?.fullName || '' });
    setIsEditing(false);
    setError('');
  };

  const handleClose = () => {
    handleCancelEdit();
    onClose();
  };

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const roleLabel = profile?.role === 'admin' ? 'Administrator' : profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {fetching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <Alert message={error} type="error" />

              {isEditing ? (
                <div className="space-y-5">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    icon={UserIcon}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                      <EnvelopeIcon className="h-4 w-4" />
                      {profile?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400">
                      <ShieldCheckIcon className="h-4 w-4" />
                      {roleLabel}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={handleCancelEdit} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleUpdate} loading={loading} className="flex-1">
                      Update Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-yellow-400/50 shadow-lg">
                    {initials}
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {profile?.fullName}
                    </h3>
                    <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      {roleLabel}
                    </span>
                  </div>

                  <div className="w-full space-y-3 pt-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile?.email}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditForm({ fullName: profile?.fullName || '' });
                      setIsEditing(true);
                      setError('');
                    }}
                    className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
