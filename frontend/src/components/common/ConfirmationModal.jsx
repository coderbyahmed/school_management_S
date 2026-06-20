import Modal from './Modal';

const ConfirmationModal = ({ isOpen, onClose, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, variant = 'primary', children, maxWidth }) => {
  const confirmStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth || 'max-w-sm'}>
      {children || (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          {message}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer ${confirmStyles[variant]}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
