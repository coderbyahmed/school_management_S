import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';

const CURRENCIES = [
  'Pakistani Rupee', 'US Dollar', 'Euro', 'Pound Sterling', 'Indian Rupee',
  'Saudi Riyal', 'UAE Dirham', 'Bangladeshi Taka',
];
const CURRENCY_SYMBOLS = ['Rs.', '$', '€', '£', '₹', '﷼', 'د.إ', '৳'];
const THEMES = ['Light', 'Dark', 'System'];
const LANDING_PAGES = ['Dashboard', 'Student Management', 'Teacher Management', 'Attendance Management'];

const Toggle = ({ label, checked, onChange }) => (
  <div className="mb-4">
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  </div>
);

const SystemPreferences = ({ data, onSave, saving }) => {
  const [form, setForm] = useState(() => ({ ...data }));

  useEffect(() => {
    setForm({ ...data }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [data]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (e) => {
    const currency = e.target.value;
    const index = CURRENCIES.indexOf(currency);
    setForm((prev) => ({
      ...prev,
      currency,
      currencySymbol: index >= 0 ? CURRENCY_SYMBOLS[index] : prev.currencySymbol,
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  const handleReset = () => {
    setForm({ ...data });
    toast.success('Form reset to saved values');
  };

  return (
    <div className="space-y-6">
      <CardSection title="Currency & Display">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <SelectInput
            label="Currency"
            name="currency"
            value={form.currency}
            onChange={handleCurrencyChange}
            options={CURRENCIES}
            placeholder="Select currency"
          />
          <SelectInput
            label="Currency Symbol"
            name="currencySymbol"
            value={form.currencySymbol}
            onChange={handleChange('currencySymbol')}
            options={CURRENCY_SYMBOLS}
            placeholder="Select symbol"
          />
        </div>
      </CardSection>

      <CardSection title="Theme & Colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <SelectInput
            label="Default Theme"
            name="defaultTheme"
            value={form.defaultTheme}
            onChange={handleChange('defaultTheme')}
            options={THEMES}
            placeholder="Select theme"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primaryColor"
                value={form.primaryColor}
                onChange={handleChange('primaryColor')}
                className="h-10 w-14 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                name="primaryColor"
                value={form.primaryColor}
                onChange={handleChange('primaryColor')}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="secondaryColor"
                value={form.secondaryColor}
                onChange={handleChange('secondaryColor')}
                className="h-10 w-14 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                name="secondaryColor"
                value={form.secondaryColor}
                onChange={handleChange('secondaryColor')}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </CardSection>

      <CardSection title="Session & Security">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              value={form.sessionTimeout}
              onChange={handleChange('sessionTimeout')}
              min={1}
              max={999}
              className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <SelectInput
            label="Default Landing Page"
            name="defaultLandingPage"
            value={form.defaultLandingPage}
            onChange={handleChange('defaultLandingPage')}
            options={LANDING_PAGES}
            placeholder="Select page"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Toggle label="Auto Logout" checked={form.autoLogout} onChange={() => setForm((p) => ({ ...p, autoLogout: !p.autoLogout }))} />
          <Toggle label="Maintenance Mode" checked={form.maintenanceMode} onChange={() => setForm((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
        </div>
      </CardSection>

      <CardSection title="Login Page">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Toggle label="Show School Logo on Login" checked={form.showSchoolLogoOnLogin} onChange={() => setForm((p) => ({ ...p, showSchoolLogoOnLogin: !p.showSchoolLogoOnLogin }))} />
          <Toggle label="Show School Name on Login" checked={form.showSchoolNameOnLogin} onChange={() => setForm((p) => ({ ...p, showSchoolNameOnLogin: !p.showSchoolNameOnLogin }))} />
        </div>
      </CardSection>

      <CardSection title="Notifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Toggle label="Enable Notifications" checked={form.enableNotifications} onChange={() => setForm((p) => ({ ...p, enableNotifications: !p.enableNotifications }))} />
          <Toggle label="Email Notifications" checked={form.enableEmailNotifications} onChange={() => setForm((p) => ({ ...p, enableEmailNotifications: !p.enableEmailNotifications }))} />
          <Toggle label="SMS Notifications" checked={form.enableSmsNotifications} onChange={() => setForm((p) => ({ ...p, enableSmsNotifications: !p.enableSmsNotifications }))} />
          <Toggle label="WhatsApp Notifications" checked={form.enableWhatsAppNotifications} onChange={() => setForm((p) => ({ ...p, enableWhatsAppNotifications: !p.enableWhatsAppNotifications }))} />
        </div>
      </CardSection>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
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

export default SystemPreferences;
