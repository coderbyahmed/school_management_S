import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon, CameraIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import Input from '../../common/Input';
import Spinner from '../../common/Spinner';

const IMAGE_FIELDS = [
  { key: 'adminPanelLogo', label: 'Admin Panel Logo', apiField: 'adminPanelLogo' },
  { key: 'smallLogo', label: 'Small Logo', apiField: 'smallLogo' },
  { key: 'principalSignature', label: 'Principal Signature', apiField: 'principalSignature' },
  { key: 'schoolStamp', label: 'School Stamp', apiField: 'schoolStamp' },
];

const BrandingDocuments = ({ data, onSave, onImageUpload, saving, uploadingField }) => {
  const [form, setForm] = useState(() => ({ ...data }));
  const [tempFiles, setTempFiles] = useState({});
  const fileInputs = useRef({});

  useEffect(() => {
    setForm({ ...data }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [data]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = (apiField) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTempFiles((prev) => ({ ...prev, [apiField]: file }));
    if (fileInputs.current[apiField]) fileInputs.current[apiField].value = '';
  };

  const handleApply = (apiField) => {
    const file = tempFiles[apiField];
    if (!file) return;
    onImageUpload(apiField, file);
    setTempFiles((prev) => {
      const next = { ...prev };
      delete next[apiField];
      return next;
    });
  };

  const handleRemove = (apiField) => {
    setTempFiles((prev) => {
      const next = { ...prev };
      delete next[apiField];
      return next;
    });
    if (fileInputs.current[apiField]) fileInputs.current[apiField].value = '';
  };

  const handleSave = () => {
    onSave(form);
  };

  const handleReset = () => {
    setForm({ ...data });
    setTempFiles({});
    Object.values(fileInputs.current).forEach((el) => { if (el) el.value = ''; });
    toast.success('Form reset to saved values');
  };

  return (
    <div className="space-y-6">
      <CardSection title="Images & Signatures">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {IMAGE_FIELDS.map(({ key, label, apiField }) => {
            const isUploading = uploadingField === apiField;
            const hasTempFile = tempFiles[apiField] !== undefined;
            return (
              <div key={key} className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {form[key] ? (
                      <img src={form[key]} alt={label} className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <CameraIcon className="h-8 w-8 mb-1" />
                        <span className="text-[10px]">{label}</span>
                      </div>
                    )}
                  </div>
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                      <Spinner size="xs" className="text-white" />
                    </div>
                  ) : (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <CameraIcon className="h-6 w-6 text-white" />
                      <input
                        ref={(el) => { fileInputs.current[apiField] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange(apiField)}
                      />
                    </label>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                {hasTempFile && !isUploading && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApply(apiField)}
                      className="px-2.5 py-1 rounded text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(apiField)}
                      className="px-2.5 py-1 rounded text-[11px] font-medium text-red-600 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardSection>

      <CardSection title="Document Headers & Footers">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Input label="PDF Header" name="pdfHeader" value={form.pdfHeader} onChange={handleChange('pdfHeader')} placeholder="PDF document header" />
          <Input label="PDF Footer" name="pdfFooter" value={form.pdfFooter} onChange={handleChange('pdfFooter')} placeholder="PDF document footer" />
          <Input label="Report Card Header" name="reportCardHeader" value={form.reportCardHeader} onChange={handleChange('reportCardHeader')} placeholder="e.g. Annual Report Card" />
          <Input label="Certificate Header" name="certificateHeader" value={form.certificateHeader} onChange={handleChange('certificateHeader')} placeholder="e.g. Certificate of Achievement" />
          <Input label="ID Card Header" name="idCardHeader" value={form.idCardHeader} onChange={handleChange('idCardHeader')} placeholder="e.g. Student ID Card" />
          <Input label="ID Card Footer" name="idCardFooter" value={form.idCardFooter} onChange={handleChange('idCardFooter')} placeholder="Footer text on ID cards" />
          <Input label="Receipt Header" name="receiptHeader" value={form.receiptHeader} onChange={handleChange('receiptHeader')} placeholder="e.g. Fee Receipt" />
          <Input label="Receipt Footer" name="receiptFooter" value={form.receiptFooter} onChange={handleChange('receiptFooter')} placeholder="Footer text on receipts" />
        </div>
      </CardSection>

      <CardSection title="Footer & Preview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Footer Text
            </label>
            <textarea
              name="footerText"
              value={form.footerText}
              onChange={handleChange('footerText')}
              placeholder="Default footer text for all documents"
              rows={3}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Preview
            </label>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 min-h-[80px] flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-[8px]">
                  {form.adminPanelLogo ? 'L' : 'S'}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Preview</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">{form.footerText || 'Footer text'}</p>
            </div>
          </div>
        </div>
      </CardSection>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Branding'}
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

export default BrandingDocuments;
