import CardHeader from './shared/CardHeader';
import CardPhoto from './shared/CardPhoto';
import CardInfoRow from './shared/CardInfoRow';
import QRCodePlaceholder from './shared/QRCodePlaceholder';
import { getInitials, formatClassName, headerHtml, photoHtml, infoRowHtml, infoRowAltHtml, qrPlaceholderHtml, noteHtml } from './shared/cardHtmlUtils';

const DEFAULT_VISIBILITY = {
  schoolLogo: true, schoolName: true, studentPhoto: true, studentName: true,
  fatherName: true, studentId: true, class: true, academicYear: true, qrCode: true,
  fatherPhone: true, schoolAddress: true, note: true,
};

const VerticalTemplateFront = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, cardPadding, borderRadius, photoSize, photoShape, nameFontSize, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  return (
    <div className="mx-auto border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor }}>
      <CardHeader schoolName={schoolInfo.name} primaryColor={primaryColor} secondaryColor={secondaryColor} nameFontSize={nameFontSize} fontWeight={fontWeight} visibility={visibility} />
      <div className="flex flex-col items-center" style={{ padding: cardPadding }}>
        {visibility.studentPhoto && <CardPhoto fullName={student.fullName} photoSize={photoSize} photoShape={photoShape} />}
        {visibility.studentName && <h4 className="text-center" style={{ fontSize: nameFontSize, fontWeight, color: textColor }}>{student.fullName}</h4>}
        {(visibility.fatherName || visibility.studentId || visibility.class || visibility.academicYear) && (
          <div className="w-full mt-4 space-y-2">
            {visibility.fatherName && <CardInfoRow label="Father Name" value={student.fatherName} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.studentId && <CardInfoRow label="Student ID" value={student.studentId} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.class && <CardInfoRow label="Class" value={formatClassName(student.class)} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.academicYear && <CardInfoRow label="Academic Year" value={student.academicYear} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
          </div>
        )}
      </div>
    </div>
  );
};

const VerticalTemplateBack = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, cardPadding, borderRadius, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor, qrSize, qrPosition } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  const qrAlign = qrPosition === 'left' ? 'flex-start' : qrPosition === 'right' ? 'flex-end' : 'center';
  return (
    <div className="mx-auto border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor }}>
      {visibility.qrCode && (
        <div className="px-4 py-3 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
          <h3 className="text-sm font-bold text-white">QR Code</h3>
        </div>
      )}
      <div className="flex flex-col items-center" style={{ padding: cardPadding }}>
        {visibility.qrCode && (
          <div className="w-full" style={{ display: 'flex', justifyContent: qrAlign }}>
            <QRCodePlaceholder size={qrSize || 140} />
          </div>
        )}
        {(visibility.fatherPhone || visibility.schoolAddress || visibility.note) && (
          <div className="w-full mt-4 space-y-2">
            {visibility.fatherPhone && <CardInfoRow label="Father Phone" value={student.fatherPhone} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            {visibility.schoolAddress && <CardInfoRow label="School Address" value={schoolInfo.address} muted detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
          </div>
        )}
        {visibility.note && (
          <div className="w-full mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Note:</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
              This ID Card must be carried daily. Attendance will be marked only through this card. If lost, immediately report to the school administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const VerticalTemplate = ({ student, schoolInfo, side, layoutConfig = {} }) => {
  const merged = { cardWidth: 320, cardHeight: 0, cardPadding: 16, borderRadius: 12, photoSize: 80, photoShape: 'circle', qrSize: 140, qrPosition: 'center', nameFontSize: 16, detailsFontSize: 12, fontWeight: 700, primaryColor: '#2563eb', secondaryColor: '#1e40af', textColor: '#1f2937', cardBgColor: '#ffffff', ...layoutConfig };
  if (side === 'back') return <VerticalTemplateBack student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
  return <VerticalTemplateFront student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
};

VerticalTemplate.toHtml = (student, schoolInfo, layoutConfig = {}) => {
  const { cardWidth = 320, cardHeight = 0, cardPadding = 16, borderRadius = 12, photoSize = 80, photoShape = 'circle', qrSize = 140, qrPosition = 'center', nameFontSize = 16, detailsFontSize = 12, fontWeight = 700, primaryColor = '#2563eb', secondaryColor = '#1e40af', textColor = '#1f2937', cardBgColor = '#ffffff' } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  const halfWidth = Math.floor(cardWidth / 2);
  const heightStyle = cardHeight ? `min-height:${cardHeight}px;` : '';
  const initials = getInitials(student.fullName);

  const qrAlign = qrPosition === 'left' ? 'flex-start' : qrPosition === 'right' ? 'flex-end' : 'center';

  let frontRows = '';
  if (visibility.fatherName) frontRows += infoRowHtml('Father Name', student.fatherName, detailsFontSize, fontWeight, textColor);
  if (visibility.studentId) frontRows += infoRowAltHtml('Student ID', student.studentId, detailsFontSize, fontWeight, textColor);
  if (visibility.class) frontRows += infoRowHtml('Class', formatClassName(student.class), detailsFontSize, fontWeight, textColor);
  if (visibility.academicYear) frontRows += infoRowAltHtml('Academic Year', student.academicYear, detailsFontSize, fontWeight, textColor);

  let backRows = '';
  if (visibility.fatherPhone) backRows += infoRowHtml('Father Phone', student.fatherPhone, detailsFontSize, fontWeight, textColor);
  if (visibility.schoolAddress) backRows += infoRowAltHtml('School Address', schoolInfo.address, detailsFontSize, fontWeight, textColor);

  return `
    <div style="page-break-after:always;padding:5mm 0;display:flex;justify-content:center;">
      <table style="border-collapse:collapse;width:${cardWidth + 40}px;">
        <tr>
          <td style="width:${halfWidth}px;vertical-align:top;padding:4px;">
            <div style="border-radius:${borderRadius}px;border:1px solid #d1d5db;overflow:hidden;background:${cardBgColor};${heightStyle}">
              ${visibility.schoolLogo || visibility.schoolName ? headerHtml(schoolInfo.name, primaryColor, secondaryColor, nameFontSize, fontWeight) : ''}
              <div style="padding:${cardPadding}px;text-align:center;">
                ${visibility.studentPhoto ? photoHtml(initials, photoSize, photoShape) : ''}
                ${visibility.studentName ? `<h4 style="font-size:${nameFontSize}px;font-weight:${fontWeight};color:${textColor};margin:0 0 8px;">${student.fullName}</h4>` : ''}
                ${frontRows ? `<table style="width:100%;border-collapse:collapse;">${frontRows}</table>` : ''}
              </div>
            </div>
          </td>
          <td style="width:${halfWidth}px;vertical-align:top;padding:4px;">
            <div style="border-radius:${borderRadius}px;border:1px solid #d1d5db;overflow:hidden;background:${cardBgColor};${heightStyle}">
              ${visibility.qrCode ? `<div style="background:linear-gradient(135deg,${primaryColor},${secondaryColor});padding:10px 16px;text-align:center;"><h3 style="color:white;font-size:${nameFontSize}px;font-weight:${fontWeight};margin:0;">QR Code</h3></div>` : ''}
              <div style="padding:${cardPadding}px;text-align:center;">
                ${visibility.qrCode ? `<div style="display:flex;justify-content:${qrAlign};">${qrPlaceholderHtml(qrSize)}</div>` : ''}
                ${backRows ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;">${backRows}</table>` : ''}
                ${visibility.note ? noteHtml(detailsFontSize, textColor) : ''}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>`;
};

export default VerticalTemplate;