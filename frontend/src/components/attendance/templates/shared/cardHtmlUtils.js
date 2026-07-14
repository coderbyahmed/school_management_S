export function getInitials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function formatClassName(cls) {
  return cls.replace('KG ', 'KG-');
}

export function headerHtml(schoolName, primaryColor = '#2563eb', secondaryColor = '#1e40af', nameFontSize = 16, fontWeight = 700) {
  return `<div style="background:linear-gradient(135deg,${primaryColor},${secondaryColor});padding:10px 16px;text-align:center;"><h3 style="color:white;font-size:${nameFontSize}px;font-weight:${fontWeight};margin:0;">${schoolName}</h3></div>`;
}

export function photoHtml(initials, photoSize = 60, photoShape = 'circle') {
  const br = photoShape === 'circle' ? '50%' : photoShape === 'rounded' ? '12px' : '0';
  return `<div style="width:${photoSize}px;height:${photoSize}px;border-radius:${br};background:linear-gradient(135deg,#3b82f6,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${Math.round(photoSize * 0.3)}px;border:2px solid #fbbf24;margin:0 auto 6px;">${initials}</div>`;
}

export function infoRowHtml(label, value, detailsFontSize = 12, fontWeight = 600, textColor = '#1f2937') {
  return `<tr><td style="color:#6b7280;padding:3px 8px;background:#f9fafb;width:50%;font-size:${detailsFontSize}px;">${label}</td><td style="font-weight:${fontWeight};padding:3px 8px;background:#f9fafb;font-size:${detailsFontSize}px;color:${textColor};">${value}</td></tr>`;
}

export function infoRowAltHtml(label, value, detailsFontSize = 12, fontWeight = 600, textColor = '#1f2937') {
  return `<tr><td style="color:#6b7280;padding:3px 8px;font-size:${detailsFontSize}px;">${label}</td><td style="font-weight:${fontWeight};padding:3px 8px;font-size:${detailsFontSize}px;color:${textColor};">${value}</td></tr>`;
}

export function qrPlaceholderHtml(size) {
  return `<div style="width:${size}px;height:${size}px;border:2px dashed #d1d5db;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f9fafb;margin:0 auto;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /></svg></div>`;
}

export function noteHtml(detailsFontSize = 12, textColor = '#1f2937') {
  return `<div style="text-align:left;font-size:${detailsFontSize - 2}px;color:#6b7280;line-height:1.6;margin-top:10px;padding-top:8px;border-top:1px solid #e5e7eb;"><strong>Note:</strong> This ID Card must be carried daily. Attendance will be marked only through this card. If lost, immediately report to the school administration.</div>`;
}