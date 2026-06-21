import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import CardSection from './CardSection';
import Input from './Input';
import SelectInput from './SelectInput';
import Button from './Button';
import Alert from './Alert';

const statusOptions = ['Active', 'Inactive'];

const EditSubjectModal = ({ subject, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    description: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subject) {
      setFormData({
        subjectName: subject.subjectName || '',
        subjectCode: subject.subjectCode || '',
        description: subject.description || '',
        status: subject.status || '',
      });
      setError('');
    }
  }, [subject]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await onSave(subject.subjectCode, formData);
      toast.success('Subject updated successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update subject';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Subject" maxWidth="max-w-lg">
      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        {error && <Alert message={error} type="error" />}

        <CardSection title="Subject Information">
          <Input
            label="Subject Name"
            name="subjectName"
            value={formData.subjectName}
            onChange={handleChange('subjectName')}
            placeholder="Enter subject name"
          />
          <Input
            label="Subject Code"
            name="subjectCode"
            value={formData.subjectCode}
            onChange={handleChange('subjectCode')}
            placeholder="Enter subject code"
          />
          <SelectInput
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange('status')}
            options={statusOptions}
            placeholder="Select status"
          />
          <div className="mb-4">
            <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              id="editDescription"
              name="description"
              value={formData.description}
              onChange={handleChange('description')}
              rows={3}
              placeholder="Enter description"
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        </CardSection>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} loading={loading}>Update Subject</Button>
      </div>
    </Modal>
  );
};

export default EditSubjectModal;
