export const TYPE_OPTIONS = ['Teaching', 'Break'];

export const timeToMinutes = (t) => {
  if (!t) return -1;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const createPeriod = (num) => ({
  id: Date.now() + Math.random(),
  periodNum: num,
  type: 'Teaching',
  startTime: '',
  endTime: '',
  teacher: '',
  subject: '',
});

export const renumberPeriods = (arr) => arr.map((p, i) => ({ ...p, periodNum: i + 1 }));

export const validatePeriods = (periods) => {
  const fieldErrors = {};
  if (!periods || periods.length === 0) return fieldErrors;

  const timeSlots = [];

  periods.forEach((p) => {
    const row = {};
    const startM = timeToMinutes(p.startTime);
    const endM = timeToMinutes(p.endTime);
    const hasStart = p.startTime !== '';
    const hasEnd = p.endTime !== '';

    if (p.type === 'Teaching') {
      if (!hasStart) row.startTime = 'Start time required';
      if (!hasEnd) row.endTime = 'End time required';
      if (!p.teacher) row.teacher = 'Teacher required';
      if (!p.subject) row.subject = 'Subject required';
    } else {
      if (!hasStart) row.startTime = 'Start time required';
      if (!hasEnd) row.endTime = 'End time required';
    }

    if (hasStart && hasEnd) {
      if (endM <= startM) {
        row.timeOverlap = 'End time must be later than start time';
      } else {
        for (const slot of timeSlots) {
          if (startM < slot.endM && endM > slot.startM) {
            row.timeOverlap = 'Time overlap detected';
            if (!fieldErrors[slot.id]) fieldErrors[slot.id] = {};
            fieldErrors[slot.id].timeOverlap = 'Time overlap detected';
            break;
          }
        }
        timeSlots.push({ id: p.id, startM, endM });
      }
    }

    if (Object.keys(row).length > 0) {
      fieldErrors[p.id] = row;
    }
  });

  return fieldErrors;
};

export const isTimetableFormValid = (academicYear, selectedClass, periods, fieldErrors) => {
  if (!academicYear || !selectedClass) return false;
  if (!periods || periods.length === 0) return false;
  return Object.keys(fieldErrors).length === 0;
};

export const getFirstError = (fieldErrors) => {
  const firstRow = Object.values(fieldErrors)[0];
  if (!firstRow) return null;
  return Object.values(firstRow)[0];
};

export const hasOverlapError = (fieldErrors) => {
  return Object.values(fieldErrors).some((row) => row.timeOverlap);
};
