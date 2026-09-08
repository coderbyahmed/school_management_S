import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Alert = ({ message, type = 'success', className = '', dismissible = false, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const Icon = icons[type];

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`flex items-start gap-3 border px-4 py-3 rounded-lg mb-5 ${styles[type]} ${className}`} role="alert">
      {Icon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
      <span className="text-sm flex-1">{message}</span>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
