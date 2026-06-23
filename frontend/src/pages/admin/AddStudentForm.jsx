import { useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CardSection from '../../components/common/CardSection';
import Input from '../../components/common/Input';
import SelectInput from '../../components/common/SelectInput';
import DateInput from '../../components/common/DateInput';
import Alert from '../../components/common/Alert';
import studentService from '../../services/student.service';
import { CLASS_NAMES, ACADEMIC_YEARS } from '../../utils/classNames';

const genderOptions = ['Male', 'Female'];
const statusOptions = ['Active', 'Inactive'];
const today = new Date().toISOString().split('T')[0];

const initialFormState = {
  photo: null,
  fullName: '',
  fatherName: '',
  gender: '',
  dob: '',
  status: 'Active',
  admissionDate: today,
  class: '',
  academicYear: '2026',
  fatherPhone: '',
  altPhone: '',
  city: '',
  address: '',
  password: '',
};

const AddStudentForm = ({ onSuccess }) => {
  const [form, setForm] = useState(initialFormState);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({ ...initialFormState, admissionDate: new Date().toISOString().split('T')[0] });
    setPhotoPreview(null);
    setError('');
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (form.photo) {
        formData.append('studentImage', form.photo);
      }
      formData.append('fullName', form.fullName.trim());
      formData.append('fatherName', form.fatherName.trim());
      formData.append('gender', form.gender);
      formData.append('dateOfBirth', form.dob);
      formData.append('status', form.status);
      formData.append('admissionDate', form.admissionDate);
      formData.append('class', form.class);
      formData.append('academicYear', form.academicYear);
      formData.append('fatherPhone', form.fatherPhone);
      if (form.altPhone) {
        formData.append('alternatePhone', form.altPhone);
      }
      formData.append('city', form.city.trim());
      formData.append('address', form.address.trim());
      formData.append('password', form.password);

      await studentService.createStudent(formData);

      toast.success('Student created successfully');
      resetForm();
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && <Alert message={error} type="error" />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CardSection title="Student Information">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center ring-2 ring-yellow-400/50 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <CameraIcon className="h-6 w-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Student Photo</p>
          </div>

          <Input
            label="Student ID"
            name="studentId"
            value="Auto Generated"
            disabled
          />
          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange('fullName')}
            placeholder="Enter full name"
          />
          <Input
            label="Father Name"
            name="fatherName"
            value={form.fatherName}
            onChange={handleChange('fatherName')}
            placeholder="Enter father name"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-3">
            <SelectInput
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange('gender')}
              options={genderOptions}
            />
            <DateInput
              label="Date of Birth"
              name="dob"
              value={form.dob}
              onChange={handleChange('dob')}
            />
          </div>
          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange('status')}
            options={statusOptions}
          />
        </CardSection>

        <CardSection title="Academic Information">
          <DateInput
            label="Admission Date"
            name="admissionDate"
            value={form.admissionDate}
            onChange={handleChange('admissionDate')}
          />
          <Input
            label="Admission Number"
            name="admissionNumber"
            value="Auto Generated"
            disabled
          />
          <SelectInput
            label="Class"
            name="class"
            value={form.class}
            onChange={handleChange('class')}
            options={CLASS_NAMES}
          />
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange('academicYear')}
            options={ACADEMIC_YEARS}
          />
        </CardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CardSection title="Contact Information">
          <Input
            label="Father Phone Number"
            name="fatherPhone"
            value={form.fatherPhone}
            onChange={handleChange('fatherPhone')}
            placeholder="Enter phone number"
          />
          <Input
            label="Alternative Phone Number"
            name="altPhone"
            value={form.altPhone}
            onChange={handleChange('altPhone')}
            placeholder="Enter alternative phone"
          />
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange('city')}
            placeholder="Enter city"
          />
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange('address')}
              placeholder="Enter full address"
              rows={4}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        </CardSection>

        <CardSection title="Login Information">
          <Input
            label="Student Login ID"
            name="loginId"
            value="Auto Generated"
            disabled
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Enter Default Password"
          />
        </CardSection>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving Student...' : 'Save Student'}
        </button>
      </div>
    </div>
  );
};

export default AddStudentForm;
