import CardPhoto from './shared/CardPhoto';
import CardInfoRow from './shared/CardInfoRow';
import QRCodePlaceholder from './shared/QRCodePlaceholder';
import { getInitials, formatClassName, infoRowHtml, infoRowAltHtml, photoHtml, qrPlaceholderHtml, noteHtml } from './shared/cardHtmlUtils';

const DEFAULT_VISIBILITY = {
  schoolLogo: true, schoolName: true, studentPhoto: true, studentName: true,
  fatherName: true, studentId: true, class: true, academicYear: true, qrCode: true,
  fatherPhone: true, schoolAddress: true, note: true,
};

const HorizontalTemplateFront = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, cardPadding, borderRadius, photoSize, photoShape, nameFontSize, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  const leftWidth = Math.round(cardWidth * 0.4);
  const rightWidth = cardWidth - leftWidth;
  const showLeft = visibility.studentPhoto || visibility.studentName;
  const showRight = visibility.fatherName || visibility.studentId || visibility.class || visibility.academicYear;
  return (
    <div className="mx-auto border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor }}>
      <div className="flex" style={{ minHeight: cardHeight || undefined }}>
        {showLeft && (
          <div className="flex flex-col items-center justify-center"
            style={{ width: leftWidth, padding: cardPadding, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
            {visibility.studentPhoto && <CardPhoto fullName={student.fullName} photoSize={photoSize} photoShape={photoShape} />}
            {visibility.studentName && <h4 className="text-center mt-1" style={{ fontSize: nameFontSize, fontWeight, color: '#ffffff' }}>{student.fullName}</h4>}
          </div>
        )}
        {showRight && (
          <div className="flex flex-col justify-center" style={{ width: rightWidth, padding: cardPadding }}>
            <div className="space-y-2">
              {visibility.fatherName && <CardInfoRow label="Father Name" value={student.fatherName} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
              {visibility.studentId && <CardInfoRow label="Student ID" value={student.studentId} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
              {visibility.class && <CardInfoRow label="Class" value={formatClassName(student.class)} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
              {visibility.academicYear && <CardInfoRow label="Academic Year" value={student.academicYear} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HorizontalTemplateBack = ({ student, schoolInfo, layoutConfig }) => {
  const { cardWidth, cardHeight, cardPadding, borderRadius, detailsFontSize, fontWeight, textColor, cardBgColor, primaryColor, secondaryColor, qrSize, qrPosition } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  const leftWidth = Math.round(cardWidth * 0.4);
  const rightWidth = cardWidth - leftWidth;
  const showLeft = visibility.qrCode;
  const showRight = visibility.fatherPhone || visibility.schoolAddress || visibility.note;
  const qrAlign = qrPosition === 'left' ? 'flex-start' : qrPosition === 'right' ? 'flex-end' : 'center';
  return (
    <div className="mx-auto border-2 border-gray-300 dark:border-gray-600 shadow-lg overflow-hidden"
      style={{ width: cardWidth, minHeight: cardHeight || undefined, borderRadius, backgroundColor: cardBgColor }}>
      <div className="flex" style={{ minHeight: cardHeight || undefined }}>
        {showLeft && (
          <div className="flex flex-col items-center justify-center"
            style={{ width: leftWidth, padding: cardPadding, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
            {visibility.qrCode && (
              <div className="w-full" style={{ display: 'flex', justifyContent: qrAlign }}>
                <QRCodePlaceholder size={qrSize || 140} />
              </div>
            )}
          </div>
        )}
        {showRight && (
          <div className="flex flex-col justify-center" style={{ width: rightWidth, padding: cardPadding }}>
            <div className="space-y-2">
              {visibility.fatherPhone && <CardInfoRow label="Father Phone" value={student.fatherPhone} detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
              {visibility.schoolAddress && <CardInfoRow label="School Address" value={schoolInfo.address} muted detailsFontSize={detailsFontSize} fontWeight={fontWeight} textColor={textColor} />}
            </div>
            {visibility.note && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Note:</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  This ID Card must be carried daily. Attendance will be marked only through this card. If lost, immediately report to the school administration.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HorizontalTemplate = ({ student, schoolInfo, side, layoutConfig = {} }) => {
  const merged = { cardWidth: 520, cardHeight: 0, cardPadding: 16, borderRadius: 12, photoSize: 80, photoShape: 'circle', qrSize: 140, qrPosition: 'center', nameFontSize: 16, detailsFontSize: 12, fontWeight: 700, primaryColor: '#2563eb', secondaryColor: '#1e40af', textColor: '#1f2937', cardBgColor: '#ffffff', ...layoutConfig };
  if (side === 'back') return <HorizontalTemplateBack student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
  return <HorizontalTemplateFront student={student} schoolInfo={schoolInfo} layoutConfig={merged} />;
};

HorizontalTemplate.toHtml = (student, schoolInfo, layoutConfig = {}) => {
  const { cardWidth = 520, cardHeight = 0, cardPadding = 16, borderRadius = 12, photoSize = 80, photoShape = 'circle', qrSize = 140, qrPosition = 'center', nameFontSize = 16, detailsFontSize = 12, fontWeight = 700, primaryColor = '#2563eb', secondaryColor = '#1e40af', textColor = '#1f2937', cardBgColor = '#ffffff' } = layoutConfig;
  const visibility = { ...DEFAULT_VISIBILITY, ...(layoutConfig.visibility || {}) };
  const leftWidth = Math.round(cardWidth * 0.4);
  const rightWidth = cardWidth - leftWidth;
  const heightStyle = cardHeight ? `min-height:${cardHeight}px;` : '';
  const initials = getInitials(student.fullName);

  const qrAlign = qrPosition === 'left' ? 'flex-start' : qrPosition === 'right' ? 'flex-end' : 'center';

  let frontRightRows = '';
  if (visibility.fatherName) frontRightRows += infoRowHtml('Father Name', student.fatherName, detailsFontSize, fontWeight, textColor);
  if (visibility.studentId) frontRightRows += infoRowAltHtml('Student ID', student.studentId, detailsFontSize, fontWeight, textColor);
  if (visibility.class) frontRightRows += infoRowHtml('Class', formatClassName(student.class), detailsFontSize, fontWeight, textColor);
  if (visibility.academicYear) frontRightRows += infoRowAltHtml('Academic Year', student.academicYear, detailsFontSize, fontWeight, textColor);

  let backRightRows = '';
  if (visibility.fatherPhone) backRightRows += infoRowHtml('Father Phone', student.fatherPhone, detailsFontSize, fontWeight, textColor);
  if (visibility.schoolAddress) backRightRows += infoRowAltHtml('School Address', schoolInfo.address, detailsFontSize, fontWeight, textColor);

  const showFrontLeft = visibility.studentPhoto || visibility.studentName;
  const showFrontRight = visibility.fatherName || visibility.studentId || visibility.class || visibility.academicYear;
  const showBackLeft = visibility.qrCode;
  const showBackRight = visibility.fatherPhone || visibility.schoolAddress || visibility.note;

  const frontLeftHtml = showFrontLeft ? `
            <td style="width:${leftWidth}px;vertical-align:top;background:linear-gradient(135deg,${primaryColor},${secondaryColor});border-radius:${borderRadius}px 0 0 ${borderRadius}px;padding:${cardPadding}px;text-align:center;${heightStyle}">
              ${visibility.studentPhoto ? photoHtml(initials, photoSize, photoShape) : ''}
              ${visibility.studentName ? `<h4 style="font-size:${nameFontSize}px;font-weight:${fontWeight};color:white;margin:4px 0 2px;">${student.fullName}</h4>` : ''}
            </td>` : '';

  const frontRightHtml = showFrontRight ? `
            <td style="width:${rightWidth}px;vertical-align:middle;background:${cardBgColor};border-radius:0 ${borderRadius}px ${borderRadius}px 0;border:1px solid #d1d5db;border-left:none;padding:${cardPadding}px;">
              ${frontRightRows ? `<table style="width:100%;border-collapse:collapse;">${frontRightRows}</table>` : ''}
            </td>` : '';

  const backLeftHtml = showBackLeft ? `
            <td style="width:${leftWidth}px;vertical-align:top;background:linear-gradient(135deg,${primaryColor},${secondaryColor});border-radius:0 0 0 ${borderRadius}px;padding:${cardPadding}px;text-align:center;">
              <div style="display:flex;justify-content:${qrAlign};">${qrPlaceholderHtml(qrSize)}</div>
            </td>` : '';

  const backRightHtml = showBackRight ? `
            <td style="width:${rightWidth}px;vertical-align:middle;background:${cardBgColor};border-radius:0 0 ${borderRadius}px 0;border:1px solid #d1d5db;border-left:none;padding:${cardPadding}px;">
              ${backRightRows ? `<table style="width:100%;border-collapse:collapse;">${backRightRows}</table>` : ''}
              ${visibility.note ? noteHtml(detailsFontSize, textColor) : ''}
            </td>` : '';

  return `
    <div style="page-break-after:always;padding:5mm 0;display:flex;justify-content:center;">
      <div style="width:${cardWidth + 40}px;">
        <table style="border-collapse:collapse;width:100%;margin-bottom:6px;">
          <tr>
            ${frontLeftHtml}
            ${frontRightHtml}
          </tr>
        </table>
        <table style="border-collapse:collapse;width:100%;">
          <tr>
            ${backLeftHtml}
            ${backRightHtml}
          </tr>
        </table>
      </div>
    </div>`;
};

export default HorizontalTemplate;