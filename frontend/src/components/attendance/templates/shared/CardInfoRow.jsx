const CardInfoRow = ({ label, value, muted = false, detailsFontSize = 12, fontWeight = 600, textColor = '#1f2937' }) => (
  <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: detailsFontSize }}>{label}</span>
    <span className={`${muted ? 'text-gray-400 dark:text-gray-500' : ''}`}
      style={{ fontSize: detailsFontSize, fontWeight, color: muted ? undefined : textColor }}>
      {value || '—'}
    </span>
  </div>
);

export default CardInfoRow;
