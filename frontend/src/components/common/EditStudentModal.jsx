import { useState, useEffect, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import CardSection from './CardSection';
import Input from './Input';
import SelectInput from './SelectInput';
import DateInput from './DateInput';
import Button from './Button';

const classOptions = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const genderOptions = ['Male', 'Female'];
const statusOptions = ['Active', 'Inactive'];
const yearOptions = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const EditStudentModal = ({ student, isOpen, onClose, onSave }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    status: '',
    class: '',
    academicYear: '',
    parentPhone: '',
    alternativePhone: '',
    city: '',
    address: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        fatherName: student.fatherName || '',
        gender: student.gender || '',
        dateOfBirth: student.dateOfBirth || '',
        status: student.status || '',
        class: student.class || '',
        academicYear: student.academicYear || '',
        parentPhone: student.parentPhone || '',
        alternativePhone: student.alternativePhone || '',
        city: student.city || '',
        address: student.address || '',
      });
      setAvatarPreview(student.avatar || null);
    }
  }, [student]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ ...student, ...formData, avatar: avatarPreview });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student" maxWidth="max-w-2xl">
      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <CardSection title="Basic Information">
          <div className="flex flex-col items-center mb-5">
            <div
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl ring-2 ring-yellow-400/50 cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
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
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click to change photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Input label="Student Name" name="name" value={formData.name} onChange={handleChange('name')} placeholder="Enter student name" />
            <Input label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange('fatherName')} placeholder="Enter father name" />
            <SelectInput label="Gender" name="gender" value={formData.gender} onChange={handleChange('gender')} options={genderOptions} placeholder="Select gender" />
            <DateInput label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange('dateOfBirth')} />
            <SelectInput label="Status" name="status" value={formData.status} onChange={handleChange('status')} options={statusOptions} placeholder="Select status" />
          </div>
        </CardSection>

        <div className="mt-4">
          <CardSection title="Academic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <SelectInput label="Class" name="class" value={formData.class} onChange={handleChange('class')} options={classOptions} placeholder="Select class" />
              <SelectInput label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange('academicYear')} options={yearOptions} placeholder="Select year" />
            </div>
          </CardSection>
        </div>

        <div className="mt-4">
          <CardSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Input label="Parent Phone" name="parentPhone" value={formData.parentPhone} onChange={handleChange('parentPhone')} placeholder="Enter phone number" />
              <Input label="Alternative Phone" name="alternativePhone" value={formData.alternativePhone} onChange={handleChange('alternativePhone')} placeholder="Enter alternative phone" />
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
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Update Student</Button>
      </div>
    </Modal>
  );
};

export default EditStudentModal;
