import { useState } from 'react';
import { PencilSquareIcon, CameraIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import Input from '../common/Input';

const ProfileModal = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@iqraschool.edu',
    phone: '+92-300-1234567',
    role: 'Administrator',
    avatar: null,
  });

  const [editForm, setEditForm] = useState({ ...profile });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  if (!isOpen) return null;

  const handleOpenEdit = () => {
    setEditForm({ ...profile });
    setAvatarPreview(profile.avatar);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setAvatarPreview(profile.avatar);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    setProfile({ ...editForm, avatar: avatarPreview });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderAvatar = (size = 'w-24 h-24', iconSize = 'w-14 h-14', textSize = 'text-3xl') => (
    <div className="relative group">
      <div className={`${size} rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center ring-2 ring-yellow-400/50 shadow-lg overflow-hidden`}>
        {avatarPreview ? (
          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <UserIcon className={`${iconSize} text-gray-400 dark:text-gray-400`} />
        )}
      </div>
      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
        <CameraIcon className="h-6 w-6 text-white" />
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </label>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {isEditing ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center mb-2">
                {renderAvatar('w-20 h-20', 'w-10 h-10')}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click to change photo</p>
              </div>

              <Input
                label="Full Name"
                name="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                icon={UserIcon}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                icon={EnvelopeIcon}
              />
              <Input
                label="Phone Number"
                name="phone"
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                icon={PhoneIcon}
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Update Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {renderAvatar()}

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {profile.fullName}
                </h3>
                <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  {profile.role}
                </span>
              </div>

              <div className="w-full space-y-3 pt-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{profile.phone}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenEdit}
                className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
