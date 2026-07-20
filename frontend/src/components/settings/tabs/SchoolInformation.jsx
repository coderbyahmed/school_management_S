import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon, CameraIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import Input from '../../common/Input';
import Spinner from '../../common/Spinner';

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir', 'Islamabad'];

const SchoolInformation = ({ data, onSave, onImageUpload, saving, uploadingField }) => {
  const [form, setForm] = useState(() => ({ ...data }));
  const [tempLogoFile, setTempLogoFile] = useState(null);
  const logoInputRef = useRef(null);
  const isUploading = uploadingField === 'schoolLogo';
  const hasTempFile = tempLogoFile !== null;

  useEffect(() => {
    setForm({ ...data }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [data]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTempLogoFile(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleApplyLogo = () => {
    if (!tempLogoFile) return;
    onImageUpload('schoolLogo', tempLogoFile);
    setTempLogoFile(null);
  };

  const handleRemoveLogo = () => {
    setTempLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!form.schoolName || !form.shortName || !form.registrationNumber || !form.principalName || !form.schoolEmail || !form.contactNumber || !form.city || !form.country) {
      toast.error('Please fill all required fields');
      return;
    }
    onSave(form);
  };

  const handleReset = () => {
    setForm({ ...data });
    setTempLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
    toast.success('Form reset to saved values');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden ring-2 ring-yellow-400/50">
                {form.schoolLogo ? (
                  <img src={form.schoolLogo} alt="School Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {form.schoolName ? form.schoolName.charAt(0).toUpperCase() : 'S'}
                  </span>
                )}
              </div>
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <Spinner size="xs" className="text-white" />
                </div>
              ) : (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <CameraIcon className="h-6 w-6 text-white" />
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              )}
            </div>
            {hasTempFile && !isUploading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyLogo}
                  className="px-3 py-1 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-1 rounded-md text-xs font-medium text-red-600 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form.schoolName || 'School Name'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{form.shortName || 'Short Name'}</p>
          </div>
        </div>
      </div>

      <CardSection title="School Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Input label="School Name" name="schoolName" value={form.schoolName} onChange={handleChange('schoolName')} placeholder="Enter school name" required />
          <Input label="Short Name" name="shortName" value={form.shortName} onChange={handleChange('shortName')} placeholder="e.g. IQRA" required />
          <Input label="School Tagline" name="schoolTagline" value={form.schoolTagline} onChange={handleChange('schoolTagline')} placeholder="Enter tagline" />
          <Input label="Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange('registrationNumber')} placeholder="Enter registration number" required />
          <Input label="Principal Name" name="principalName" value={form.principalName} onChange={handleChange('principalName')} placeholder="Enter principal name" required />
          <Input label="School Email" name="schoolEmail" type="email" value={form.schoolEmail} onChange={handleChange('schoolEmail')} placeholder="info@school.edu.pk" required />
          <Input label="Contact Number" name="contactNumber" type="tel" value={form.contactNumber} onChange={handleChange('contactNumber')} placeholder="+92-XXX-XXXXXXX" required />
          <Input label="WhatsApp Number" name="whatsappNumber" type="tel" value={form.whatsappNumber} onChange={handleChange('whatsappNumber')} placeholder="+92-XXX-XXXXXXX" />
          <Input label="Website" name="website" type="url" value={form.website} onChange={handleChange('website')} placeholder="www.school.edu.pk" />
        </div>
      </CardSection>

      <CardSection title="Address & Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="md:col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Complete Address
            </label>
            <textarea
              name="completeAddress"
              value={form.completeAddress}
              onChange={handleChange('completeAddress')}
              placeholder="Enter complete address"
              rows={3}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <Input label="City" name="city" value={form.city} onChange={handleChange('city')} placeholder="Enter city" required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Province</label>
            <select
              name="province"
              value={form.province}
              onChange={handleChange('province')}
              className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <Input label="Country" name="country" value={form.country} onChange={handleChange('country')} placeholder="Enter country" required />
          <Input label="Google Map Location" name="googleMapLocation" value={form.googleMapLocation} onChange={handleChange('googleMapLocation')} placeholder="Optional: embed URL or coordinates" />
        </div>
      </CardSection>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Information'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default SchoolInformation;
