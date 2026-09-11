import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../../hooks/useLocalization';
import CardSection from '../../../common/CardSection/CardSection';
import SelectInput from '../../../common/SelectInput/SelectInput';
import Input from '../../../common/Input/Input';
import Alert from '../../../common/Alert/Alert';
import classService from '../../../../services/class/class.service';
import { CLASS_NAMES } from '../../../../utils/classNames';
import { useSchoolConfig } from '../../../../contexts/SchoolConfigContext';

const getInitialForm = (editData, configYear) => editData ? {
  className: editData.className || '',
  academicYear: editData.academicYear || '',
  monthlyFee: editData.monthlyFee ?? 0,
  admissionFee: editData.admissionFee ?? 0,
  examFee: editData.examFee ?? 0,
  status: editData.status || 'Active',
} : {
  className: '',
  academicYear: configYear || '',
  monthlyFee: 0,
  admissionFee: 0,
  examFee: 0,
  status: 'Active',
};

const AddClass = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const statusOptions = [t('active'), t('inactive')];
  const { academic } = useSchoolConfig();
  const [editData, setEditData] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [form, setForm] = useState(() => getInitialForm(null, academic?.currentYear));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    classService.getClassDetails(editId)
      .then((res) => {
        const data = res?.data?.classInfo || res?.data;
        setEditData(data);
        setForm(getInitialForm(data, academic?.currentYear));
      })
      .catch(() => setError(t('failedToLoad')))
      .finally(() => setLoadingEdit(false));
  }, [editId, academic?.currentYear]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm(getInitialForm(editData, academic?.currentYear));
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      if (editData) {
        await classService.updateClass(editData._id, form);
        toast.success(t('updatedSuccessfully'));
      } else {
        await classService.createClass(form);
        toast.success(t('savedSuccessfully'));
        resetForm();
      }
      navigate('/admin/classes/all');
    } catch (err) {
      const msg = err.response?.data?.message || t('failedToSave');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/classes/all');
  };

  if (loadingEdit) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editId ? t('updateClass') : t('addClass')}</h1>
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <Alert message={error} type="error" />}

      <div className="max-w-2xl">
        <CardSection title={editData ? t('updateClass') : t('addClass')}>
          <SelectInput
            label={t('className')}
            name="className"
            value={form.className}
            onChange={handleChange('className')}
            options={CLASS_NAMES}
            placeholder={t('selectClass')}
          />
          <Input
            label={t('academicYearLabel')}
            name="academicYear"
            value={form.academicYear}
            onChange={handleChange('academicYear')}
            placeholder={t('enterAcademicYear')}
          />
          <Input
            label={t('monthlyFee')}
            type="number"
            name="monthlyFee"
            value={form.monthlyFee}
            onChange={handleChange('monthlyFee')}
            placeholder={t('enterMonthlyFee')}
          />
          <Input
            label={t('admissionFee')}
            type="number"
            name="admissionFee"
            value={form.admissionFee}
            onChange={handleChange('admissionFee')}
            placeholder={t('enterAdmissionFee')}
          />
          <Input
            label={t('examFee')}
            type="number"
            name="examFee"
            value={form.examFee}
            onChange={handleChange('examFee')}
            placeholder={t('enterExamFee')}
          />
          <SelectInput
            label={t('status')}
            name="status"
            value={form.status}
            onChange={handleChange('status')}
            options={statusOptions}
          />
        </CardSection>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('saving') : editData ? t('update') : t('save')}
        </button>
      </div>
    </div>
  );
};

export default AddClass;
