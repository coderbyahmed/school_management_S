import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { CameraIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import CardSection from './CardSection';
import Input from './Input';
import SelectInput from './SelectInput';
import DateInput from './DateInput';
import Button from './Button';
import Alert from './Alert';

const genderOptions = ['Male', 'Female'];
const statusOptions = ['Active', 'Inactive'];
const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const qualificationOptions = ['B.Ed', 'M.Ed', 'BS Education', 'MA Education', 'PhD Education', 'Other'];
const experienceOptions = ['Fresher', '1 Year', '2 Years', '3 Years', '5 Years', '10+ Years'];

const getImageUrl = (path) => {
  if (!path) return null;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
  return `${base}/${path}`;
};

const EditTeacherModal = ({ teacher, isOpen, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    cnic: '',
    maritalStatus: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    status: '',
    phone: '',
    alternatePhone: '',
    email: '',
    city: '',
    address: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacher) {
      setFormData({
        fullName: teacher.fullName || '',
        fatherName: teacher.fatherName || '',
        gender: teacher.gender || '',
        dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.slice(0, 10) : '',
        cnic: teacher.cnic || '',
        maritalStatus: teacher.maritalStatus || '',
        qualification: teacher.qualification || '',
        experience: teacher.experience || '',
        joiningDate: teacher.joiningDate ? teacher.joiningDate.slice(0, 10) : '',
        status: teacher.status || '',
        phone: teacher.phone || '',
        alternatePhone: teacher.alternatePhone || '',
        email: teacher.email || '',
        city: teacher.city || '',
        address: teacher.address || '',
      });
      setPhotoPreview(getImageUrl(teacher.teacherImage));
      setPhotoFile(null);
      setError('');
    }
  }, [teacher]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      if (photoFile) fd.append('teacherImage', photoFile);
      if (formData.fullName) fd.append('fullName', formData.fullName.trim());
      if (formData.fatherName) fd.append('fatherName', formData.fatherName.trim());
      if (formData.gender) fd.append('gender', formData.gender);
      if (formData.dateOfBirth) fd.append('dateOfBirth', formData.dateOfBirth);
      if (formData.cnic) fd.append('cnic', formData.cnic.trim());
      if (formData.maritalStatus) fd.append('maritalStatus', formData.maritalStatus);
      if (formData.qualification) fd.append('qualification', formData.qualification);
      if (formData.experience) fd.append('experience', formData.experience);
      if (formData.joiningDate) fd.append('joiningDate', formData.joiningDate);
      if (formData.status) fd.append('status', formData.status);
      if (formData.phone) fd.append('phone', formData.phone.trim());
      if (formData.alternatePhone) fd.append('alternatePhone', formData.alternatePhone.trim());
      if (formData.email) fd.append('email', formData.email.trim());
      if (formData.city) fd.append('city', formData.city.trim());
      if (formData.address) fd.append('address', formData.address.trim());

      await onSave(teacher.teacherId, fd);
      toast.success('Teacher updated successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update teacher';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const initials = teacher?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Teacher" maxWidth="max-w-2xl">
      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        {error && <Alert message={error} type="error" />}

        <CardSection title="Personal Information">
          <div className="flex flex-col items-center mb-5">
            <div
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl ring-2 ring-yellow-400/50 cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click to change photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange('fullName')} placeholder="Enter full name" />
            <Input label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange('fatherName')} placeholder="Enter father name" />
            <SelectInput label="Gender" name="gender" value={formData.gender} onChange={handleChange('gender')} options={genderOptions} placeholder="Select gender" />
            <DateInput label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange('dateOfBirth')} />
            <Input label="CNIC" name="cnic" value={formData.cnic} onChange={handleChange('cnic')} placeholder="XXXXX-XXXXXXX-X" />
            <SelectInput label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange('maritalStatus')} options={maritalOptions} placeholder="Select marital status" />
          </div>
        </CardSection>

        <div className="mt-4">
          <CardSection title="Professional Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <SelectInput label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange('qualification')} options={qualificationOptions} placeholder="Select qualification" />
              <SelectInput label="Experience" name="experience" value={formData.experience} onChange={handleChange('experience')} options={experienceOptions} placeholder="Select experience" />
              <DateInput label="Joining Date" name="joiningDate" value={formData.joiningDate} onChange={handleChange('joiningDate')} />
              <SelectInput label="Status" name="status" value={formData.status} onChange={handleChange('status')} options={statusOptions} placeholder="Select status" />
            </div>
          </CardSection>
        </div>

        <div className="mt-4">
          <CardSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange('phone')} placeholder="Enter phone number" />
              <Input label="Alternate Phone" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange('alternatePhone')} placeholder="Enter alternate phone" />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange('email')} placeholder="Enter email address" />
              <Input label="City" name="city" value={formData.city} onChange={handleChange('city')} placeholder="Enter city" />
            </div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange('address')}
                rows={3}
                placeholder="Enter address"
                className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white resize-none"
              />
            </div>
          </CardSection>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} loading={loading}>Update Teacher</Button>
      </div>
    </Modal>
  );
};

export default EditTeacherModal;
