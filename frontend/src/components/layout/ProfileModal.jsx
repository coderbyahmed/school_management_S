import { useState, useEffect } from 'react';
import { PencilSquareIcon, CameraIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const UPLOADS_BASE = API_BASE.replace('/api/v1', '');

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const loadProfile = async () => {
    setFetching(true);
    setError('');
    try {
      const data = await authService.getProfile();
      setProfile(data.user);
      setEditForm({ fullName: data.user.fullName, phone: data.user.phone || '' });
      setImagePreview(null);
      setImageFile(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only jpg, jpeg, png, webp files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!editForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('fullName', editForm.fullName.trim());
      formData.append('phone', editForm.phone.trim());
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const data = await authService.updateProfile(formData);
      setProfile(data.user);
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
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
    setEditForm({ fullName: profile?.fullName || '', phone: profile?.phone || '' });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setError('');
  };

  const handleClose = () => {
    handleCancelEdit();
    onClose();
  };

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (profile?.profileImage) return `${UPLOADS_BASE}/${profile.profileImage}`;
    return null;
  };

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
                  <div className="flex flex-col items-center mb-2">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center ring-2 ring-yellow-400/50 shadow-lg overflow-hidden">
                        {getProfileImageUrl() ? (
                          <img src={getProfileImageUrl()} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <CameraIcon className="h-6 w-6 text-white" />
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click to change photo</p>
                  </div>

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

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    icon={PhoneIcon}
                  />

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
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center ring-2 ring-yellow-400/50 shadow-lg overflow-hidden">
                    {getProfileImageUrl() ? (
                      <img src={getProfileImageUrl()} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-14 h-14 text-gray-400" />
                    )}
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
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile?.phone || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditForm({ fullName: profile?.fullName || '', phone: profile?.phone || '' });
                      setImagePreview(null);
                      setImageFile(null);
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
