const EVENTS_KEY = 'events_data';
const HOLIDAYS_KEY = 'holidays_data';

const ACADEMIC_YEARS = ['2025-26', '2026-27', '2027-28', '2028-29', '2029-30', '2030-31'];
const EVENT_CATEGORIES = ['Annual Function', 'Sports Day', 'Independence Day', 'Teachers Day', 'Parents Meeting', 'Science Exhibition', 'Seminar', 'Workshop', 'Competition', 'Examination', 'Orientation', 'Cultural Program', 'Other'];
const HOLIDAY_TYPES = ['Public Holiday', 'National Holiday', 'Religious Holiday', 'School Holiday', 'Emergency Holiday', 'Summer Vacation', 'Winter Vacation', 'Exam Break'];
const AUDIENCES = ['All', 'Students', 'Teachers', 'Parents', 'Staff'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_NAMES = [
  'Annual Prize Distribution', 'Sports Gala 2025', 'Independence Day Celebration',
  'Teachers Appreciation Day', 'Parent-Teacher Conference', 'Science & Technology Expo',
  'Digital Literacy Workshop', 'Art & Craft Competition', 'Mid-Term Examinations',
  'New Student Orientation', 'Cultural Night', 'Book Fair',
  'Career Counseling Session', 'Debate Championship', 'Music Festival',
  'Annual Sports Meet', 'STEM Workshop', 'Environment Day Program',
  'Inter-School Quiz Competition', 'Farewell Party',
];

const HOLIDAY_NAMES = [
  'Summer Break', 'Winter Break', 'Eid-ul-Fitr', 'Eid-ul-Azha',
  'Independence Day', 'Pakistan Day', 'Iqbal Day', 'Quaid-e-Azam Day',
  'Spring Holidays', 'Exam Preparation Break', 'Emergency Closure',
  'Labour Day', 'Ashura', 'Eid Milad-un-Nabi', 'Kashmir Solidarity Day',
];

const VENUES = [
  'Main Auditorium', 'Sports Ground', 'School Hall', 'Conference Room',
  'Science Lab', 'Computer Lab', 'Library', 'Cafeteria',
  'Playground', 'Multi-Purpose Hall',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function generateEvents() {
  const events = [];
  const now = new Date();
  const year = now.getFullYear();
  const yearLabel = ACADEMIC_YEARS[0];

  EVENT_NAMES.forEach((name, i) => {
    const monthOffset = i % 12;
    const day = randomInt(1, 28);
    const eventDate = new Date(year, monthOffset, day);
    const category = randomItem(EVENT_CATEGORIES);
    const audience = randomItem(AUDIENCES);
    const status = eventDate < now ? (eventDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) ? randomItem(['Ongoing', 'Completed']) : 'Completed') : 'Upcoming';

    events.push({
      id: `evt_${i + 1}`,
      name,
      category,
      date: formatDate(eventDate),
      dateDisplay: formatDateDisplay(eventDate),
      startTime: formatTime(new Date(year, monthOffset, day, randomInt(8, 10), randomInt(0, 59))),
      endTime: formatTime(new Date(year, monthOffset, day, randomInt(14, 17), randomInt(0, 59))),
      venue: randomItem(VENUES),
      organizer: `Department of ${randomItem(['Science', 'Arts', 'Sports', 'Academics', 'Administration'])}`,
      audience,
      description: `${name} is an exciting event organized by the school for ${audience.toLowerCase()}. Join us for a memorable experience.`,
      banner: null,
      color: randomItem(['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']),
      status,
      academicYear: yearLabel,
      createdAt: formatDate(new Date(year, monthOffset, 1)),
    });
  });

  return events;
}

function generateHolidays() {
  const holidays = [];
  const now = new Date();
  const year = now.getFullYear();
  const yearLabel = ACADEMIC_YEARS[0];

  HOLIDAY_NAMES.forEach((name, i) => {
    const type = randomItem(HOLIDAY_TYPES);
    const monthOffset = i % 12;
    const startDay = randomInt(1, 20);
    const duration = type.includes('Vacation') ? randomInt(7, 21) : randomInt(1, 3);
    const startDate = new Date(year, monthOffset, startDay);
    const endDate = new Date(year, monthOffset, startDay + duration);
    const appliesTo = randomItem(['All', 'Students', 'Teachers', 'Staff']);

    holidays.push({
      id: `hol_${i + 1}`,
      name,
      startDate: formatDate(startDate),
      startDateDisplay: formatDateDisplay(startDate),
      endDate: formatDate(endDate),
      endDateDisplay: formatDateDisplay(endDate),
      totalDays: duration + 1,
      type,
      appliesTo,
      description: `${name} holidays for ${appliesTo.toLowerCase()}. School will remain ${appliesTo === 'All' ? 'closed' : 'closed for ' + appliesTo.toLowerCase()} during this period.`,
      status: endDate < now ? 'Completed' : startDate <= now && endDate >= now ? 'Ongoing' : 'Upcoming',
      academicYear: yearLabel,
    });
  });

  return holidays;
}

const eventsService = {
  getEvents(filters = {}) {
    let events;
    try {
      const raw = localStorage.getItem(EVENTS_KEY);
      if (raw) { events = JSON.parse(raw); }
      else { events = generateEvents(); localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }
    } catch { events = []; }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      events = events.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    }
    if (filters.academicYear) events = events.filter((e) => e.academicYear === filters.academicYear);
    if (filters.category) events = events.filter((e) => e.category === filters.category);
    if (filters.month) events = events.filter((e) => new Date(e.date).getMonth() === MONTHS.indexOf(filters.month));
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getHolidays(filters = {}) {
    let holidays;
    try {
      const raw = localStorage.getItem(HOLIDAYS_KEY);
      if (raw) { holidays = JSON.parse(raw); }
      else { holidays = generateHolidays(); localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays)); }
    } catch { holidays = []; }

    if (filters.academicYear) holidays = holidays.filter((h) => h.academicYear === filters.academicYear);
    if (filters.type) holidays = holidays.filter((h) => h.type === filters.type);
    return holidays.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  },

  addEvent(event) {
    const events = this.getEvents();
    events.unshift({ ...event, id: `evt_${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return true;
  },

  addHoliday(holiday) {
    const holidays = this.getHolidays();
    holidays.unshift({ ...holiday, id: `hol_${Date.now()}` });
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
    return true;
  },

  deleteEvent(id) {
    const events = this.getEvents().filter((e) => e.id !== id);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },

  deleteHoliday(id) {
    const holidays = this.getHolidays().filter((h) => h.id !== id);
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
  },

  getStats() {
    const events = this.getEvents();
    const holidays = this.getHolidays();
    const now = new Date();
    return {
      totalEvents: events.length,
      totalHolidays: holidays.length,
      upcomingEvents: events.filter((e) => new Date(e.date) >= now || e.status === 'Upcoming').length,
      upcomingHolidays: holidays.filter((h) => new Date(h.startDate) >= now || h.status === 'Upcoming').length,
    };
  },

  getCalendarData() {
    const events = this.getEvents().map((e) => ({ ...e, type: 'event' }));
    const holidays = this.getHolidays().map((h) => ({ ...h, type: 'holiday', date: h.startDate }));
    return [...events, ...holidays];
  },

  getGalleryData() {
    const events = this.getEvents().filter((e) => e.status === 'Completed' || e.status === 'Ongoing');
    return events.slice(0, 8).map((e) => ({
      id: e.id,
      name: e.name,
      banner: e.banner,
      date: e.dateDisplay,
      numPhotos: randomInt(15, 80),
    }));
  },

  ACADEMIC_YEARS,
  EVENT_CATEGORIES,
  HOLIDAY_TYPES,
  AUDIENCES,
  STATUSES,
  MONTHS,
};

export default eventsService;
