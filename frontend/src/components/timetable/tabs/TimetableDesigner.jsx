import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import timetableTemplateService from '../../../services/timetableTemplate.service';
import timetableService from '../../../services/timetable.service';
import { ACADEMIC_YEARS } from '../../../utils/classNames';
import { useSchoolConfig } from '../../../contexts/SchoolConfigContext';
import { useTimetableYear } from '../../../contexts/TimetableContext';

const GROUPS = {
  1: { name: 'Group 1', classes: ['Montessori', 'Nursery', 'KG 1', 'KG 2'] },
  2: { name: 'Group 2', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  3: { name: 'Group 3', classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] },
};



const TEMPLATES = [
  { id: 'classic', name: 'Classic School', primary: '#1d4ed8', bg: '#ffffff', accent: '#eff6ff', cell: '#ffffff', text: '#1f2937', border: '#e5e7eb', group: '#f8fafc', time: '#eff6ff', headerText: '#ffffff', desc: 'Traditional blue-themed school design' },
  { id: 'modern', name: 'Modern Blue', primary: '#2563eb', bg: '#ffffff', accent: '#dbeafe', cell: '#f8fafc', text: '#0f172a', border: '#bfdbfe', group: '#dbeafe', time: '#dbeafe', headerText: '#ffffff', desc: 'Clean modern blue gradient design' },
  { id: 'professional', name: 'Professional Gray', primary: '#475569', bg: '#ffffff', accent: '#f1f5f9', cell: '#ffffff', text: '#1e293b', border: '#cbd5e1', group: '#f1f5f9', time: '#f1f5f9', headerText: '#ffffff', desc: 'Corporate gray-scale professional look' },
  { id: 'green', name: 'Green Academic', primary: '#15803d', bg: '#ffffff', accent: '#f0fdf4', cell: '#fafafa', text: '#14532d', border: '#bbf7d0', group: '#f0fdf4', time: '#f0fdf4', headerText: '#ffffff', desc: 'Natural green academic theme' },
  { id: 'minimal', name: 'Minimal Clean', primary: '#0f172a', bg: '#ffffff', accent: '#f8fafc', cell: '#ffffff', text: '#0f172a', border: '#e2e8f0', group: '#f8fafc', time: '#f8fafc', headerText: '#ffffff', desc: 'Clean minimal black & white design' },
];

const FONT_OPTIONS = ['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Calibri', 'Segoe UI'];

const FONT_SIZE_OPTIONS = ['9px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' }, { value: '400', label: 'Normal' }, { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' }, { value: '700', label: 'Bold' }, { value: '800', label: 'Extra Bold' },
];
const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
];
const BORDER_STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double'];
const PADDING_OPTIONS = [
  { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' },
];

const HEADER_INIT = {
  schoolName: { text: 'School Name', align: 'left', fontFamily: 'Inter', fontSize: '24px', fontWeight: '700', color: '#ffffff' },
  principalName: { text: 'Principal Name', align: 'left', fontFamily: 'Inter', fontSize: '12px', fontWeight: '400', color: '#ffffff' },
  academicYear: { text: '2026', align: 'left', fontFamily: 'Inter', fontSize: '10px', fontWeight: '400', color: '#ffffff' },
  logo: { show: true, dataUrl: null },
  container: { bgColor: '#1d4ed8', borderColor: '#1d4ed8', borderRadius: '0px', padding: '14px 20px', shadow: false },
};
const TITLE_INIT = {
  text: 'Teachers Period Time Table', align: 'left', fontFamily: 'Inter', fontSize: '12px', fontWeight: '700', color: '#ffffff',
};
const TABLE_HEADERS_INIT = {
  time: { bg: '#1d4ed8', color: '#ffffff', fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', align: 'center' },
  class: { bg: '#1d4ed8', color: '#ffffff', fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', align: 'center' },
  subject: { bg: '#1d4ed8', color: '#ffffff', fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', align: 'center' },
  teacher: { bg: '#1d4ed8', color: '#ffffff', fontFamily: 'Inter', fontSize: '10px', fontWeight: '700', align: 'center' },
};
const PERIOD_CELLS_INIT = {
  subjectBg: '#ffffff', subjectColor: '#374151', teacherBg: '#ffffff', teacherColor: '#374151',
  altRowBg: '#f8fafc', fontFamily: 'Inter', fontSize: '10px', fontWeight: '400',
};
const BREAK_ROW_INIT = {
  bg: '#f8fafc', color: '#374151', fontFamily: 'Inter', fontSize: '10px', fontWeight: '600', borderRadius: '8px',
};
const TABLE_LAYOUT_INIT = {
  rowHeight: 48, colWidth: 130, cellPadding: 'medium', borderThickness: '1px', borderStyle: 'solid', borderColor: '#e5e7eb',
};

const ChevronSvg = ({ open }) => <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const CloseSvg = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SettingsSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoSvg = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ImageSvg = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const PaintSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const TypeSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const LayoutSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>;
const GridSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const PrintSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const ResetSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const EyeSvg = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const ColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-600 p-0.5" />
      <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono w-14">{value}</span>
    </div>
  </div>
);

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} className={`relative w-9 h-4.5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ height: '18px', width: '36px' }}>
    <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[18px]' : ''}`} style={{ width: '14px', height: '14px' }} />
  </button>
);

const AccordionSection = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
      <span className="flex items-center gap-2">{icon}{title}</span>
      <ChevronSvg open={isOpen} />
    </button>
    {isOpen && <div className="px-4 pb-3 pt-0.5 space-y-2.5">{children}</div>}
  </div>
);

const INPUT_CLS = "w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500";
const SELECT_CLS = "w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer";

const FieldLabel = ({ children }) => <label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-px">{children}</label>;

const TextField = ({ label, value, onChange }) => (
  <div><FieldLabel>{label}</FieldLabel><input type="text" value={value} onChange={onChange} className={INPUT_CLS} /></div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div><FieldLabel>{label}</FieldLabel>
    <select value={value} onChange={onChange} className={SELECT_CLS}>
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </div>
);

const StyleGroup = ({ label, align, fontFamily, fontSize, fontWeight, color, onChange }) => (
  <div className="space-y-1.5 p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
    <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    <div className="grid grid-cols-2 gap-1.5">
      <SelectField label="Align" value={align} onChange={(e) => onChange('align', e.target.value)} options={ALIGN_OPTIONS} />
      <SelectField label="Font" value={fontFamily} onChange={(e) => onChange('fontFamily', e.target.value)} options={FONT_OPTIONS} />
      <SelectField label="Size" value={fontSize} onChange={(e) => onChange('fontSize', e.target.value)} options={FONT_SIZE_OPTIONS} />
      <SelectField label="Weight" value={fontWeight} onChange={(e) => onChange('fontWeight', e.target.value)} options={FONT_WEIGHT_OPTIONS} />
    </div>
    <ColorPicker label="Text Color" value={color} onChange={(v) => onChange('color', v)} />
  </div>
);

const TimetableDesigner = () => {
  const { schoolInfo } = useSchoolConfig();
  const { selectedYear, setSelectedYear } = useTimetableYear();
  const [designPanelOpen, setDesignPanelOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [header, setHeader] = useState({
    ...HEADER_INIT,
    schoolName: { ...HEADER_INIT.schoolName, text: schoolInfo.name || HEADER_INIT.schoolName.text },
    principalName: { ...HEADER_INIT.principalName, text: schoolInfo.principalName || HEADER_INIT.principalName.text },
  });
  const [title, setTitle] = useState(TITLE_INIT);
  const [tableHeaders, setTableHeaders] = useState(TABLE_HEADERS_INIT);
  const [periodCells, setPeriodCells] = useState(PERIOD_CELLS_INIT);
  const [breakRow, setBreakRow] = useState(BREAK_ROW_INIT);
  const [tableLayout, setTableLayout] = useState(TABLE_LAYOUT_INIT);
  const [mergedPairs, setMergedPairs] = useState([]);
  const [showSignature, setShowSignature] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [watermark, setWatermark] = useState(false);
  const [orientation, setOrientation] = useState('landscape');
  const [marginTop, setMarginTop] = useState('15mm');
  const [marginBottom, setMarginBottom] = useState('15mm');
  const [marginLeft, setMarginLeft] = useState('10mm');
  const [marginRight, setMarginRight] = useState('10mm');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSelections, setMergeSelections] = useState([]);
  const [mergeEnabled, setMergeEnabled] = useState(false);
  const [openSections, setOpenSections] = useState({ templates: true, header: false, title: false, tableHeaders: false, periodCells: false, breakRow: false, tableLayout: false, merge: false, print: false });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState(null);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [renameModal, setRenameModal] = useState({ show: false, template: null, newName: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, template: null });
  const [selectedGroup, setSelectedGroup] = useState(1);
  const [groupTimetables, setGroupTimetables] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [pdfExporting, setPdfExporting] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('[data-designer-toggle]')) {
        setDesignPanelOpen(false);
      }
    };
    if (designPanelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [designPanelOpen]);

  const loadTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await timetableTemplateService.getTemplates();
      setSavedTemplates(res?.data?.templates || []);
    } catch {
      // silently fail
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  const loadGroupTimetables = useCallback(async () => {
    const groupClasses = GROUPS[selectedGroup]?.classes || [];
    if (!selectedYear || groupClasses.length === 0) {
      setGroupTimetables([]);
      setGroupError(selectedYear ? '' : 'Select an academic year');
      return;
    }
    setGroupsLoading(true);
    setGroupError('');
    try {
      const allTimetables = await timetableService.getAllTimetables();
      const all = allTimetables?.data?.timetables || [];
      const filtered = all.filter(
        (t) => t.academicYear === selectedYear && groupClasses.includes(t.classId?.className)
      );
      const classMap = {};
      for (const tt of filtered) {
        const name = tt.classId?.className;
        if (name && groupClasses.includes(name)) {
          classMap[name] = tt;
        }
      }
      const ordered = groupClasses.map((name) => classMap[name]).filter(Boolean);
      setGroupTimetables(ordered);
      if (ordered.length === 0) {
        setGroupError('No timetables found for this group');
      }
    } catch {
      setGroupError('Failed to load timetables');
      setGroupTimetables([]);
    } finally {
      setGroupsLoading(false);
    }
  }, [selectedGroup, selectedYear]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGroupTimetables();
  }, [loadGroupTimetables]);

  const collectSettings = useCallback(() => ({
    headerSettings: header,
    tableHeaderSettings: { title, columns: tableHeaders },
    periodCellSettings: periodCells,
    breakCellSettings: breakRow,
    rowSettings: { rowHeight: tableLayout.rowHeight, colWidth: tableLayout.colWidth },
    layoutSettings: {
      cellPadding: tableLayout.cellPadding,
      borderThickness: tableLayout.borderThickness,
      borderStyle: tableLayout.borderStyle,
      borderColor: tableLayout.borderColor,
    },
    mergeSettings: { mergedPairs, mergeEnabled },
    printSettings: { showSignature, showFooter, watermark, orientation, marginTop, marginBottom, marginLeft, marginRight },
  }), [header, title, tableHeaders, periodCells, breakRow, tableLayout, mergedPairs, mergeEnabled, showSignature, showFooter, watermark, orientation, marginTop, marginBottom, marginLeft, marginRight]);

  const applySettings = useCallback((settings) => {
    if (settings.headerSettings) setHeader(settings.headerSettings);
    if (settings.tableHeaderSettings) {
      setTitle(settings.tableHeaderSettings.title || TITLE_INIT);
      setTableHeaders(settings.tableHeaderSettings.columns || TABLE_HEADERS_INIT);
    }
    if (settings.periodCellSettings) setPeriodCells(settings.periodCellSettings);
    if (settings.breakCellSettings) setBreakRow(settings.breakCellSettings);
    if (settings.rowSettings) {
      setTableLayout((prev) => ({
        ...prev,
        rowHeight: settings.rowSettings.rowHeight ?? prev.rowHeight,
        colWidth: settings.rowSettings.colWidth ?? prev.colWidth,
      }));
    }
    if (settings.layoutSettings) {
      setTableLayout((prev) => ({
        ...prev,
        cellPadding: settings.layoutSettings.cellPadding ?? prev.cellPadding,
        borderThickness: settings.layoutSettings.borderThickness ?? prev.borderThickness,
        borderStyle: settings.layoutSettings.borderStyle ?? prev.borderStyle,
        borderColor: settings.layoutSettings.borderColor ?? prev.borderColor,
      }));
    }
    if (settings.mergeSettings) {
      setMergedPairs(settings.mergeSettings.mergedPairs || []);
      if (settings.mergeSettings.mergeEnabled !== undefined) setMergeEnabled(settings.mergeSettings.mergeEnabled);
    }
    if (settings.printSettings) {
      if (settings.printSettings.showSignature !== undefined) setShowSignature(settings.printSettings.showSignature);
      if (settings.printSettings.showFooter !== undefined) setShowFooter(settings.printSettings.showFooter);
      if (settings.printSettings.watermark !== undefined) setWatermark(settings.printSettings.watermark);
      if (settings.printSettings.orientation) setOrientation(settings.printSettings.orientation);
      if (settings.printSettings.marginTop) setMarginTop(settings.printSettings.marginTop);
      if (settings.printSettings.marginBottom) setMarginBottom(settings.printSettings.marginBottom);
      if (settings.printSettings.marginLeft) setMarginLeft(settings.printSettings.marginLeft);
      if (settings.printSettings.marginRight) setMarginRight(settings.printSettings.marginRight);
    }
  }, []);

  const autoLoadDefault = useCallback(async (templates) => {
    const defaultTpl = templates.find((t) => t.isDefault);
    if (defaultTpl) {
      try {
        const res = await timetableTemplateService.getTemplateById(defaultTpl._id);
        const full = res?.data?.template;
        if (full) {
          setSavedTemplateId(full._id);
          setSaveName(full.name || '');
          applySettings(full);
        }
      } catch {
        // silent fail on auto-load
      }
    }
  }, [applySettings]);

  useEffect(() => {
    if (savedTemplates.length > 0 && !savedTemplateId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      autoLoadDefault(savedTemplates);
    }
  }, [savedTemplates, savedTemplateId, autoLoadDefault]);

  const handleSaveTemplate = async () => {
    if (!saveName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    setSavingTemplate(true);
    try {
      const settings = collectSettings();
      if (savedTemplateId) {
        await timetableTemplateService.updateTemplate(savedTemplateId, { name: saveName.trim(), ...settings });
        toast.success('Template updated successfully');
      } else {
        const res = await timetableTemplateService.createTemplate({ name: saveName.trim(), baseTemplate: selectedTemplate, ...settings });
        setSavedTemplateId(res?.data?.template?._id || null);
        toast.success('Template saved successfully');
      }
      await loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleResetTemplate = () => {
    setShowResetConfirm(true);
  };

  const confirmResetTemplate = async () => {
    setShowResetConfirm(false);
    if (!savedTemplateId) {
      toast.error('No template loaded to reset');
      return;
    }
    try {
      const res = await timetableTemplateService.getTemplateById(savedTemplateId);
      const tpl = res?.data?.template;
      if (tpl) {
        setSaveName(tpl.name || '');
        applySettings(tpl);
        toast.success('Template reset to last saved state');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset template');
    }
  };

  const handleLoadSavedTemplate = async (tpl, silent = false) => {
    try {
      const res = await timetableTemplateService.getTemplateById(tpl._id);
      const full = res?.data?.template;
      if (!full) return;
      setSavedTemplateId(full._id);
      setSaveName(full.name || '');
      applySettings(full);
      if (!silent) toast.success(`Loaded template: ${full.name}`);
    } catch (err) {
      if (!silent) toast.error(err?.response?.data?.message || 'Failed to load template');
    }
  };

  const handleSetDefault = async (tplId) => {
    try {
      await timetableTemplateService.updateTemplate(tplId, { isDefault: true });
      toast.success('Template set as default');
      await loadTemplates();
      if (savedTemplateId === tplId) {
        const res = await timetableTemplateService.getTemplateById(tplId);
        const full = res?.data?.template;
        if (full) {
          setSaveName(full.name || '');
          applySettings(full);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to set default');
    }
  };

  const handleDeleteTemplate = async (tplId, isDefault) => {
    if (isDefault) {
      toast.error('Default template cannot be deleted. Select another default template first.');
      return;
    }
    const tpl = savedTemplates.find((t) => t._id === tplId);
    if (tpl) {
      setDeleteConfirmModal({ show: true, template: tpl });
    }
  };

  const confirmDeleteTemplate = async () => {
    const tpl = deleteConfirmModal.template;
    if (!tpl) return;
    setDeleteConfirmModal({ show: false, template: null });
    try {
      await timetableTemplateService.deleteTemplate(tpl._id);
      toast.success('Template deleted');
      if (savedTemplateId === tpl._id) {
        setSavedTemplateId(null);
        setSaveName('');
      }
      await loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (tplId) => {
    try {
      await timetableTemplateService.duplicateTemplate(tplId);
      toast.success('Template duplicated successfully');
      await loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate template');
    }
  };

  const handleRenameTemplate = (tpl) => {
    setRenameModal({ show: true, template: tpl, newName: tpl.name });
  };

  const confirmRenameTemplate = async () => {
    const { template, newName } = renameModal;
    if (!template || !newName.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (newName.trim() === template.name) {
      setRenameModal({ show: false, template: null, newName: '' });
      return;
    }
    setRenameModal({ show: false, template: null, newName: '' });
    try {
      await timetableTemplateService.updateTemplate(template._id, { name: newName.trim() });
      toast.success('Template renamed successfully');
      if (savedTemplateId === template._id) {
        setSaveName(newName.trim());
      }
      await loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to rename template');
    }
  };

  const handleToggleFavorite = async (tpl) => {
    try {
      await timetableTemplateService.updateTemplate(tpl._id, { isFavorite: !tpl.isFavorite });
      toast.success(tpl.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      await loadTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update favorite');
    }
  };

  const getProcessedTemplates = () => {
    let list = [...savedTemplates];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'za') return b.name.localeCompare(a.name);
      return 0;
    });
    return list;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const previewEl = document.getElementById('designer-preview');
    if (!previewEl) {
      window.print();
      return;
    }
    const printCss = `
      @page {
        size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4'};
        margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
      }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: ${periodCells.fontFamily || 'Inter'}, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      th, td { page-break-inside: avoid; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      .no-print { display: none !important; }
    `;
    const content = previewEl.innerHTML;
    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Print Timetable</title><style>${printCss}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const getGroupClassName = () => {
    const g = GROUPS[selectedGroup];
    if (!g) return 'Timetable';
    return g.name.replace(/\s+/g, '-');
  };

  const handleExportPdf = async () => {
    if (groupTimetables.length === 0) {
      toast.error('No timetable data to export');
      return;
    }
    setPdfExporting(true);
    try {
      const element = document.getElementById('designer-preview');
      if (!element) return;
      const groupName = getGroupClassName();
      const year = selectedYear || 'Timetable';
      const html2pdf = (await import('html2pdf.js')).default;
      const marginNum = (val) => parseInt(val) || 10;
      const opt = {
        margin: [marginNum(marginTop), marginNum(marginRight), marginNum(marginBottom), marginNum(marginLeft)],
        filename: `${groupName}-${year}-Timetable.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, width: element.scrollWidth, height: element.scrollHeight },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientation },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF exported successfully');
    } catch {
      toast.error('Failed to export PDF');
    } finally {
      setPdfExporting(false);
    }
  };

  const applyTemplate = useCallback((tplId) => {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplate(tplId);
    const font = tplId === 'professional' ? 'Arial' : tplId === 'green' ? 'Georgia' : 'Inter';
    setHeader((prev) => ({
      schoolName: { ...prev.schoolName, color: tpl.headerText, fontFamily: font },
      principalName: { ...prev.principalName, color: tpl.headerText, fontFamily: font },
      academicYear: { ...prev.academicYear, color: tpl.headerText, fontFamily: font },
      logo: { ...prev.logo },
      container: { ...prev.container, bgColor: tpl.primary, borderColor: tpl.primary },
    }));
    setTitle({ ...TITLE_INIT, color: tpl.headerText, fontFamily: font });
    setTableHeaders({
      time: { ...TABLE_HEADERS_INIT.time, bg: tpl.primary, color: tpl.headerText, fontFamily: font },
      class: { ...TABLE_HEADERS_INIT.class, bg: tpl.primary, color: tpl.headerText, fontFamily: font },
      subject: { ...TABLE_HEADERS_INIT.subject, bg: tpl.primary, color: tpl.headerText, fontFamily: font },
      teacher: { ...TABLE_HEADERS_INIT.teacher, bg: tpl.primary, color: tpl.headerText, fontFamily: font },
    });
    setPeriodCells({ ...PERIOD_CELLS_INIT, subjectBg: tpl.cell, subjectColor: tpl.text, teacherBg: tpl.cell, teacherColor: tpl.text, altRowBg: tpl.group, fontFamily: font });
    setBreakRow({ ...BREAK_ROW_INIT, bg: tpl.group, color: tpl.text, fontFamily: font });
    setTableLayout({ ...TABLE_LAYOUT_INIT, borderColor: tpl.border });
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHeader((prev) => ({ ...prev, logo: { ...prev.logo, dataUrl: ev.target?.result } }));
    reader.readAsDataURL(file);
  };

  const handleMerge = () => {
    if (mergeSelections.length < 2) return;
    setMergedPairs((prev) => [...prev, [...mergeSelections].sort()]);
    setMergeSelections([]);
    setShowMergeModal(false);
  };

  const handleUnmerge = (idx) => setMergedPairs((prev) => prev.filter((_, i) => i !== idx));

  const paddingMap = { small: 'p-2', medium: 'p-4', large: 'p-6' };
  const orientClasses = orientation === 'landscape' ? 'min-w-[900px]' : 'min-w-[600px]';

  const cellStyle = (overrides = {}) => ({
    border: `${tableLayout.borderThickness} ${tableLayout.borderStyle} ${tableLayout.borderColor}`,
    padding: `${tableLayout.rowHeight / 3}px ${tableLayout.colWidth > 130 ? 14 : 8}px`,
    minWidth: `${tableLayout.colWidth}px`,
    maxWidth: `${tableLayout.colWidth * 1.4}px`,
    height: `${tableLayout.rowHeight}px`,
    verticalAlign: 'top',
    ...overrides,
  });

  const renderGroupPreview = () => {
    const group = GROUPS[selectedGroup];
    const classNames = group?.classes || [];
    const hasData = groupTimetables.length > 0;

    const buildRows = () => {
      if (!hasData) return [];
      const timeSlots = {};
      for (const tt of groupTimetables) {
        for (const p of tt.periods || []) {
          const key = `${p.startTime}-${p.endTime}`;
          if (!timeSlots[key]) {
            timeSlots[key] = { startTime: p.startTime, endTime: p.endTime };
          }
        }
      }
      const sorted = Object.values(timeSlots).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return sorted.map((slot) => {
        const periodsForSlot = {};
        let allBreak = true;
        let breakName = '';
        for (const tt of groupTimetables) {
          const name = tt.classId?.className;
          if (!name || !classNames.includes(name)) continue;
          const match = tt.periods.find((p) => p.startTime === slot.startTime && p.endTime === slot.endTime);
          if (match) {
            if (match.type === 'break') {
              periodsForSlot[name] = null;
              if (match.breakName) breakName = match.breakName;
            } else {
              periodsForSlot[name] = { s: match.subjectId?.subjectName || '', t: match.teacherId?.fullName || '' };
              allBreak = false;
            }
          }
        }
        if (allBreak) {
          return { time: `${slot.startTime} - ${slot.endTime}`, isBreak: true, breakName: breakName || 'Break', periods: {} };
        }
        return { time: `${slot.startTime} - ${slot.endTime}`, isBreak: false, periods: periodsForSlot };
      });
    };

    const rows = buildRows();
    const displayClasses = classNames.filter((name) => groupTimetables.some((tt) => tt.classId?.className === name));

    return (
      <div className={`${paddingMap[tableLayout.cellPadding]} bg-white rounded-lg overflow-hidden`}>
        <div style={{ backgroundColor: header.container.bgColor, color: header.schoolName.color, padding: header.container.padding, borderRadius: header.container.borderRadius, border: `1px solid ${header.container.borderColor}`, boxShadow: header.container.shadow ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none' }}>
          <div className="flex items-center gap-3">
            {header.logo.show && (
              <div className="flex-shrink-0">
                {header.logo.dataUrl ? <img src={header.logo.dataUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40" /> : <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><LogoSvg /></div>}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold tracking-wide truncate" style={{ fontFamily: header.schoolName.fontFamily, fontSize: header.schoolName.fontSize, fontWeight: header.schoolName.fontWeight, color: header.schoolName.color, textAlign: header.schoolName.align }}>{header.schoolName.text}</h1>
              <p className="opacity-90" style={{ fontFamily: title.fontFamily, fontSize: title.fontSize, fontWeight: title.fontWeight, color: title.color, textAlign: title.align }}>{title.text} - {group?.name || 'Group'}</p>
              <p style={{ fontFamily: header.academicYear.fontFamily, fontSize: header.academicYear.fontSize, fontWeight: header.academicYear.fontWeight, color: header.academicYear.color, textAlign: header.academicYear.align }}>Academic Year: {selectedYear || header.academicYear.text}</p>
              {header.principalName.text && <p style={{ fontFamily: header.principalName.fontFamily, fontSize: header.principalName.fontSize, fontWeight: header.principalName.fontWeight, color: header.principalName.color, textAlign: header.principalName.align }}>Principal: {header.principalName.text}</p>}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {hasData ? (
            <table className="w-full" style={{ borderCollapse: 'collapse', fontFamily: periodCells.fontFamily }}>
              <thead>
                <tr>
                  <th style={{ ...cellStyle({ backgroundColor: tableHeaders.time.bg, color: tableHeaders.time.color, fontWeight: tableHeaders.time.fontWeight, fontFamily: tableHeaders.time.fontFamily, fontSize: tableHeaders.time.fontSize, textAlign: tableHeaders.time.align }), position: 'sticky', left: 0, zIndex: 1, minWidth: '100px', width: '100px' }} className="text-[10px]">Time</th>
                  {displayClasses.map((name) => (
                    <th key={name} style={cellStyle({ backgroundColor: tableHeaders.class.bg, color: tableHeaders.class.color, fontWeight: tableHeaders.class.fontWeight, fontFamily: tableHeaders.class.fontFamily, fontSize: tableHeaders.class.fontSize, textAlign: tableHeaders.class.align })} className="text-[10px]">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  if (row.isBreak) {
                    return (
                      <tr key={ri}>
                        <td style={{ ...cellStyle({ backgroundColor: breakRow.bg, color: breakRow.color, fontWeight: breakRow.fontWeight, textAlign: 'center', fontFamily: breakRow.fontFamily, fontSize: breakRow.fontSize }), fontWeight: 600, minWidth: '100px', width: '100px' }} className="text-[10px]">{row.time}</td>
                        <td colSpan={displayClasses.length} style={cellStyle({ backgroundColor: breakRow.bg, color: breakRow.color, textAlign: 'center', fontWeight: breakRow.fontWeight, fontFamily: breakRow.fontFamily, fontSize: breakRow.fontSize })} className="text-[10px] font-bold italic">
                          <span className="inline-block px-3 py-0.5 uppercase tracking-wider" style={{ backgroundColor: breakRow.bg, color: breakRow.color, fontSize: breakRow.fontSize, borderRadius: breakRow.borderRadius }}>{row.breakName}</span>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={ri}>
                      <td style={{ ...cellStyle({ backgroundColor: periodCells.altRowBg, color: periodCells.subjectColor, fontWeight: periodCells.fontWeight, fontFamily: periodCells.fontFamily, fontSize: periodCells.fontSize }), fontWeight: 600, minWidth: '100px', width: '100px' }} className="text-[10px]">{row.time}</td>
                      {displayClasses.map((name) => {
                        const cell = row.periods[name];
                        return (
                          <td key={name} style={cellStyle({ backgroundColor: ri % 2 !== 0 ? periodCells.altRowBg : periodCells.subjectBg, color: periodCells.subjectColor, fontWeight: periodCells.fontWeight, fontFamily: periodCells.fontFamily, fontSize: periodCells.fontSize })} className={`text-[10px]${watermark ? ' opacity-80' : ''}`}>
                            {cell ? (
                              <div className="space-y-0.5">
                                <span className="block font-semibold truncate" style={{ color: periodCells.subjectColor, fontSize: periodCells.fontSize }}>{cell.t}</span>
                                <span className="block opacity-60 truncate" style={{ color: periodCells.subjectColor, fontSize: periodCells.fontSize }}>{cell.s}</span>
                              </div>
                            ) : <span className="opacity-20">&mdash;</span>}
                            {watermark && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 text-[40px] font-bold" style={{ color: periodCells.subjectColor }}>DRAFT</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-xs">
              {groupsLoading ? 'Loading timetables...' : groupError || 'Select an academic year to load timetables'}
            </div>
          )}
        </div>

        {showFooter && (
          <div className="border-t px-4 py-2 text-center" style={{ borderColor: tableLayout.borderColor }}>
            <p className="text-[9px] font-medium" style={{ color: header.schoolName.color, opacity: 0.6 }}>{header.schoolName.text}</p>
            <p className="text-[8px]" style={{ color: header.schoolName.color, opacity: 0.4 }}>Phone: (021) 1234-5678 | Email: info@school.edu.pk</p>
            {showSignature && <p className="text-[9px] mt-1" style={{ color: header.schoolName.color, opacity: 0.6 }}>____________________<br />Principal's Signature</p>}
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => renderGroupPreview();

  return (
    <div className="space-y-4">
      <style>{`
@media print {
  #designer-preview { margin: 0; padding: 0; }
  #designer-preview table { border-collapse: collapse; width: 100%; }
  #designer-preview tr { page-break-inside: avoid; }
  .no-print { display: none !important; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
      `}</style>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timetable Designer</h2>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {[1, 2, 3].map((g) => (
              <button key={g} onClick={() => setSelectedGroup(g)} className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${selectedGroup === g ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Group {g}</button>
            ))}
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[10px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
            <option value="">Select Year</option>
            {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button data-designer-toggle onClick={() => setDesignPanelOpen((p) => !p)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-sm ${designPanelOpen ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'}`}>
            <SettingsSvg />
            <span>Design Controls</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <EyeSvg />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Live Preview</span>
          </div>
          {groupTimetables.length > 0 ? (
            <span className="text-[10px] text-gray-400">{GROUPS[selectedGroup]?.name} &middot; {groupTimetables.length} classes</span>
          ) : (
            <span className="text-[10px] text-gray-400">{selectedYear ? 'No data' : 'Select year'}</span>
          )}
        </div>
        <div className="p-4 md:p-6 overflow-x-auto">
          <div id="designer-preview" className={orientClasses}>
            {renderPreview()}
          </div>
        </div>
      </div>

      {designPanelOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:bg-black/20" onClick={() => setDesignPanelOpen(false)} />}

      <div ref={panelRef} className={`fixed top-0 right-0 h-full z-50 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${designPanelOpen ? 'translate-x-0' : 'translate-x-full'} w-full sm:w-[380px] md:w-[400px] lg:w-[420px]`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2"><SettingsSvg /> Design Controls</h3>
          <button onClick={() => setDesignPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"><CloseSvg /></button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-52px)]">
          <AccordionSection title="Templates" icon={<PaintSvg />} isOpen={openSections.templates} onToggle={() => toggleSection('templates')}>
            <div className="px-3 pb-1 pt-1">
              <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Built-in Presets</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 px-3">
              {TEMPLATES.map((tpl) => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl.id)} className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer text-left ${selectedTemplate === tpl.id ? 'border-blue-500 ring-1 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                  <div className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: tpl.primary }}>{tpl.id === 'classic' ? 'CS' : tpl.id === 'modern' ? 'MB' : tpl.id === 'professional' ? 'PG' : tpl.id === 'green' ? 'GA' : 'MC'}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{tpl.name}</p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">{tpl.desc}</p>
                  </div>
                  {selectedTemplate === tpl.id && <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </button>
              ))}
            </div>
            {savedTemplates.length > 0 && (
              <>
                <div className="px-3 pt-3 pb-1">
                  <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Saved Templates</p>
                  <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 mb-1.5">
                    <span>Templates: {savedTemplates.length} | Favorites: {savedTemplates.filter((t) => t.isFavorite).length}</span>
                    {savedTemplates.find((t) => t.isDefault) && <span>Default: {savedTemplates.find((t) => t.isDefault).name}</span>}
                  </div>
                  <div className="flex gap-1 mb-1.5">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[9px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500" />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[9px] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="az">A-Z</option>
                      <option value="za">Z-A</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-1.5 px-3 pb-2">
                  {getProcessedTemplates().map((tpl) => (
                    <div key={tpl._id} className={`p-2.5 rounded-lg border transition-all ${savedTemplateId === tpl._id ? 'border-purple-500 ring-1 ring-purple-500/20 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => handleLoadSavedTemplate(tpl)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer">
                          <div className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold bg-gradient-to-br from-purple-500 to-purple-700">{tpl.name?.charAt(0)?.toUpperCase() || 'T'}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate flex items-center gap-1">
                              {tpl.name}
                              {tpl.isFavorite && <span className="text-[9px] text-yellow-500">&#9733;</span>}
                              {tpl.isDefault && <span className="text-[9px] text-amber-600 dark:text-amber-400 whitespace-nowrap">Default</span>}
                            </p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">{tpl.baseTemplate || 'Custom'} &middot; {formatDate(tpl.createdAt)}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button onClick={() => handleToggleFavorite(tpl)} className={`p-1.5 rounded-md transition-all cursor-pointer text-[11px] ${tpl.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'}`} title={tpl.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>{tpl.isFavorite ? '\u2605' : '\u2606'}</button>
                          <button onClick={() => handleSetDefault(tpl._id)} className="p-1.5 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer text-[11px]" title="Set as default">&#9734;</button>
                          <button onClick={() => handleDuplicateTemplate(tpl._id)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer text-[11px]" title="Duplicate template">&#128203;</button>
                          <button onClick={() => handleRenameTemplate(tpl)} className="p-1.5 rounded-md text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all cursor-pointer text-[11px]" title="Rename template">&#9998;</button>
                          {!tpl.isDefault && (
                            <button onClick={() => handleDeleteTemplate(tpl._id, tpl.isDefault)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer text-[11px]" title="Delete template">&#10005;</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getProcessedTemplates().length === 0 && searchQuery.trim() && (
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center py-2">No templates match your search</p>
                  )}
                </div>
              </>
            )}
            {loadingTemplates && (
              <div className="px-3 py-2">
                <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center">Loading templates...</p>
              </div>
            )}
          </AccordionSection>

          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/10">
            <div className="space-y-2">
              <TextField label="Template Name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={handleSaveTemplate} disabled={savingTemplate || !saveName.trim()} className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  {savingTemplate ? 'Saving...' : savedTemplateId ? 'Update Template' : 'Save Template'}
                </button>
                <button onClick={handleResetTemplate} disabled={!savedTemplateId} className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">Reset Template</button>
              </div>
            </div>
          </div>

          <AccordionSection title="Header Controls" icon={<ImageSvg />} isOpen={openSections.header} onToggle={() => toggleSection('header')}>
            <TextField label="School Name" value={header.schoolName.text} onChange={(e) => setHeader((p) => ({ ...p, schoolName: { ...p.schoolName, text: e.target.value } }))} />
            <StyleGroup label="School Name Style" align={header.schoolName.align} fontFamily={header.schoolName.fontFamily} fontSize={header.schoolName.fontSize} fontWeight={header.schoolName.fontWeight} color={header.schoolName.color} onChange={(f, v) => setHeader((p) => ({ ...p, schoolName: { ...p.schoolName, [f]: v } }))} />
            <TextField label="Principal Name" value={header.principalName.text} onChange={(e) => setHeader((p) => ({ ...p, principalName: { ...p.principalName, text: e.target.value } }))} />
            <StyleGroup label="Principal Name Style" align={header.principalName.align} fontFamily={header.principalName.fontFamily} fontSize={header.principalName.fontSize} fontWeight={header.principalName.fontWeight} color={header.principalName.color} onChange={(f, v) => setHeader((p) => ({ ...p, principalName: { ...p.principalName, [f]: v } }))} />
            <TextField label="Academic Year" value={header.academicYear.text} onChange={(e) => setHeader((p) => ({ ...p, academicYear: { ...p.academicYear, text: e.target.value } }))} />
            <StyleGroup label="Academic Year Style" align={header.academicYear.align} fontFamily={header.academicYear.fontFamily} fontSize={header.academicYear.fontSize} fontWeight={header.academicYear.fontWeight} color={header.academicYear.color} onChange={(f, v) => setHeader((p) => ({ ...p, academicYear: { ...p.academicYear, [f]: v } }))} />
            <div><FieldLabel>Logo</FieldLabel>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <div className="flex items-center gap-2.5">
                {header.logo.dataUrl ? <img src={header.logo.dataUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-gray-200" /> : <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><ImageSvg /></div>}
                <button onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-[9px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Upload</button>
                {header.logo.dataUrl && <button onClick={() => setHeader((p) => ({ ...p, logo: { ...p.logo, dataUrl: null } }))} className="px-2 py-1 rounded-lg text-[9px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer">Remove</button>}
              </div>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs text-gray-600 dark:text-gray-400">Show in Header</span>
              <Toggle value={header.logo.show} onChange={(v) => setHeader((p) => ({ ...p, logo: { ...p.logo, show: v } }))} />
            </div>
            <hr className="border-gray-100 dark:border-gray-700" />
            <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Container</p>
            <ColorPicker label="Background" value={header.container.bgColor} onChange={(v) => setHeader((p) => ({ ...p, container: { ...p.container, bgColor: v } }))} />
            <ColorPicker label="Border Color" value={header.container.borderColor} onChange={(v) => setHeader((p) => ({ ...p, container: { ...p.container, borderColor: v } }))} />
            <div><FieldLabel>Padding</FieldLabel><input type="text" value={header.container.padding} onChange={(e) => setHeader((p) => ({ ...p, container: { ...p.container, padding: e.target.value } }))} className={INPUT_CLS} /></div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Shadow</span>
              <Toggle value={header.container.shadow} onChange={(v) => setHeader((p) => ({ ...p, container: { ...p.container, shadow: v } }))} />
            </div>
          </AccordionSection>

          <AccordionSection title="Timetable Title Controls" icon={<TypeSvg />} isOpen={openSections.title} onToggle={() => toggleSection('title')}>
            <TextField label="Title Text" value={title.text} onChange={(e) => setTitle((p) => ({ ...p, text: e.target.value }))} />
            <StyleGroup label="Title Style" align={title.align} fontFamily={title.fontFamily} fontSize={title.fontSize} fontWeight={title.fontWeight} color={title.color} onChange={(f, v) => setTitle((p) => ({ ...p, [f]: v }))} />
          </AccordionSection>

          <AccordionSection title="Table Header Controls" icon={<GridSvg />} isOpen={openSections.tableHeaders} onToggle={() => toggleSection('tableHeaders')}>
            {Object.entries(tableHeaders).map(([key, col]) => (
              <div key={key} className="space-y-1.5 p-2 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{key.charAt(0).toUpperCase() + key.slice(1)} Column</p>
                <ColorPicker label="Background" value={col.bg} onChange={(v) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], bg: v } }))} />
                <ColorPicker label="Text Color" value={col.color} onChange={(v) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], color: v } }))} />
                <div className="grid grid-cols-2 gap-1.5">
                  <SelectField label="Align" value={col.align} onChange={(e) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], align: e.target.value } }))} options={ALIGN_OPTIONS} />
                  <SelectField label="Font" value={col.fontFamily} onChange={(e) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], fontFamily: e.target.value } }))} options={FONT_OPTIONS} />
                  <SelectField label="Size" value={col.fontSize} onChange={(e) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], fontSize: e.target.value } }))} options={FONT_SIZE_OPTIONS} />
                  <SelectField label="Weight" value={col.fontWeight} onChange={(e) => setTableHeaders((p) => ({ ...p, [key]: { ...p[key], fontWeight: e.target.value } }))} options={FONT_WEIGHT_OPTIONS} />
                </div>
              </div>
            ))}
          </AccordionSection>

          <AccordionSection title="Period Cell Controls" icon={<PaintSvg />} isOpen={openSections.periodCells} onToggle={() => toggleSection('periodCells')}>
            <ColorPicker label="Subject Cell Background" value={periodCells.subjectBg} onChange={(v) => setPeriodCells((p) => ({ ...p, subjectBg: v }))} />
            <ColorPicker label="Subject Text Color" value={periodCells.subjectColor} onChange={(v) => setPeriodCells((p) => ({ ...p, subjectColor: v }))} />
            <ColorPicker label="Alt Row Background" value={periodCells.altRowBg} onChange={(v) => setPeriodCells((p) => ({ ...p, altRowBg: v }))} />
            <hr className="border-gray-100 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-1.5">
              <SelectField label="Font Family" value={periodCells.fontFamily} onChange={(e) => setPeriodCells((p) => ({ ...p, fontFamily: e.target.value }))} options={FONT_OPTIONS} />
              <SelectField label="Font Size" value={periodCells.fontSize} onChange={(e) => setPeriodCells((p) => ({ ...p, fontSize: e.target.value }))} options={FONT_SIZE_OPTIONS} />
              <SelectField label="Font Weight" value={periodCells.fontWeight} onChange={(e) => setPeriodCells((p) => ({ ...p, fontWeight: e.target.value }))} options={FONT_WEIGHT_OPTIONS} />
            </div>
          </AccordionSection>

          <AccordionSection title="Break Row Controls" icon={<LayoutSvg />} isOpen={openSections.breakRow} onToggle={() => toggleSection('breakRow')}>
            <ColorPicker label="Background" value={breakRow.bg} onChange={(v) => setBreakRow((p) => ({ ...p, bg: v }))} />
            <ColorPicker label="Text Color" value={breakRow.color} onChange={(v) => setBreakRow((p) => ({ ...p, color: v }))} />
            <div className="grid grid-cols-2 gap-1.5">
              <SelectField label="Font Family" value={breakRow.fontFamily} onChange={(e) => setBreakRow((p) => ({ ...p, fontFamily: e.target.value }))} options={FONT_OPTIONS} />
              <SelectField label="Font Size" value={breakRow.fontSize} onChange={(e) => setBreakRow((p) => ({ ...p, fontSize: e.target.value }))} options={FONT_SIZE_OPTIONS} />
              <SelectField label="Font Weight" value={breakRow.fontWeight} onChange={(e) => setBreakRow((p) => ({ ...p, fontWeight: e.target.value }))} options={FONT_WEIGHT_OPTIONS} />
            </div>
            <div><FieldLabel>Badge Border Radius</FieldLabel><input type="text" value={breakRow.borderRadius} onChange={(e) => setBreakRow((p) => ({ ...p, borderRadius: e.target.value }))} className={INPUT_CLS} /></div>
          </AccordionSection>

          <AccordionSection title="Table Layout Controls" icon={<LayoutSvg />} isOpen={openSections.tableLayout} onToggle={() => toggleSection('tableLayout')}>
            <div><label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Row Height: {tableLayout.rowHeight}px</label><input type="range" min="32" max="80" value={tableLayout.rowHeight} onChange={(e) => setTableLayout((p) => ({ ...p, rowHeight: Number(e.target.value) }))} className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div>
            <div><label className="block text-[9px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Column Width: {tableLayout.colWidth}px</label><input type="range" min="90" max="200" value={tableLayout.colWidth} onChange={(e) => setTableLayout((p) => ({ ...p, colWidth: Number(e.target.value) }))} className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div>
            <div><FieldLabel>Cell Padding</FieldLabel><div className="flex gap-1">{PADDING_OPTIONS.map((opt) => <button key={opt.value} onClick={() => setTableLayout((p) => ({ ...p, cellPadding: opt.value }))} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all cursor-pointer capitalize ${tableLayout.cellPadding === opt.value ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{opt.label}</button>)}</div></div>
            <div><FieldLabel>Border Thickness</FieldLabel><input type="text" value={tableLayout.borderThickness} onChange={(e) => setTableLayout((p) => ({ ...p, borderThickness: e.target.value }))} className={INPUT_CLS} /></div>
            <SelectField label="Border Style" value={tableLayout.borderStyle} onChange={(e) => setTableLayout((p) => ({ ...p, borderStyle: e.target.value }))} options={BORDER_STYLE_OPTIONS} />
            <ColorPicker label="Border Color" value={tableLayout.borderColor} onChange={(v) => setTableLayout((p) => ({ ...p, borderColor: v }))} />
          </AccordionSection>

          <AccordionSection title="Merge Class Controls" icon={<GridSvg />} isOpen={openSections.merge} onToggle={() => toggleSection('merge')}>
            <button onClick={() => { setMergeSelections([]); setShowMergeModal(true); }} className="w-full px-2.5 py-2 rounded-lg border border-dashed border-blue-300 dark:border-blue-500 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer">+ Merge Classes</button>
            {mergedPairs.length === 0 ? <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center py-1">No merged classes</p> : mergedPairs.map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] font-medium text-purple-700 dark:text-purple-300">{pair.join(' / ')}</span>
                <button onClick={() => handleUnmerge(idx)} className="text-[8px] px-1.5 py-0.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer">Unmerge</button>
              </div>
            ))}
          </AccordionSection>

          <AccordionSection title="Print Settings" icon={<PrintSvg />} isOpen={openSections.print} onToggle={() => toggleSection('print')}>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-600 dark:text-gray-400">Show Signature</span><Toggle value={showSignature} onChange={setShowSignature} /></div>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-600 dark:text-gray-400">Show Footer</span><Toggle value={showFooter} onChange={setShowFooter} /></div>
            <div className="flex items-center justify-between"><span className="text-xs text-gray-600 dark:text-gray-400">Watermark</span><Toggle value={watermark} onChange={setWatermark} /></div>
            <div><FieldLabel>Page Orientation</FieldLabel><div className="flex gap-1">{['portrait', 'landscape'].map((o) => <button key={o} onClick={() => setOrientation(o)} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-medium transition-all cursor-pointer capitalize ${orientation === o ? 'bg-blue-600 text-white shadow-sm' : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{o}</button>)}</div></div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <div><FieldLabel>Margin Top</FieldLabel><input type="text" value={marginTop} onChange={(e) => setMarginTop(e.target.value)} className={INPUT_CLS} placeholder="15mm" /></div>
              <div><FieldLabel>Margin Bottom</FieldLabel><input type="text" value={marginBottom} onChange={(e) => setMarginBottom(e.target.value)} className={INPUT_CLS} placeholder="15mm" /></div>
              <div><FieldLabel>Margin Left</FieldLabel><input type="text" value={marginLeft} onChange={(e) => setMarginLeft(e.target.value)} className={INPUT_CLS} placeholder="10mm" /></div>
              <div><FieldLabel>Margin Right</FieldLabel><input type="text" value={marginRight} onChange={(e) => setMarginRight(e.target.value)} className={INPUT_CLS} placeholder="10mm" /></div>
            </div>
            <div className="pt-2 space-y-1.5">
              <button onClick={handlePrint} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"><PrintSvg /> Print Timetable</button>
              <button onClick={handleExportPdf} disabled={groupTimetables.length === 0 || pdfExporting} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                {pdfExporting ? 'Exporting PDF...' : 'Export PDF'}
              </button>
              <button onClick={() => { const defaultHeader = { ...HEADER_INIT, schoolName: { ...HEADER_INIT.schoolName, text: schoolInfo.name || HEADER_INIT.schoolName.text }, principalName: { ...HEADER_INIT.principalName, text: schoolInfo.principalName || HEADER_INIT.principalName.text } }; setDesignPanelOpen(false); setHeader(defaultHeader); setTitle(TITLE_INIT); setTableHeaders(TABLE_HEADERS_INIT); setPeriodCells(PERIOD_CELLS_INIT); setBreakRow(BREAK_ROW_INIT); setTableLayout(TABLE_LAYOUT_INIT); setMergedPairs([]); setShowSignature(false); setShowFooter(true); setWatermark(false); setOrientation('landscape'); setMarginTop('15mm'); setMarginBottom('15mm'); setMarginLeft('10mm'); setMarginRight('10mm'); setSelectedTemplate('classic'); setSavedTemplateId(null); setSaveName(''); setGroupTimetables([]); setGroupError(''); }} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"><ResetSvg /> Reset Design</button>
            </div>
          </AccordionSection>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xs mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reset Template</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Reset this template?</p>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3">
              <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Cancel</button>
              <button onClick={confirmResetTemplate} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm cursor-pointer">Reset</button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowMergeModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Merge Classes</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Select multiple classes to merge</p>
            </div>
            <div className="p-4 space-y-1.5 max-h-52 overflow-y-auto">
              {(GROUPS[selectedGroup]?.classes || []).map((cls) => {
                const isMerged = mergedPairs.some((p) => p.includes(cls));
                const isSelected = mergeSelections.includes(cls);
                return (
                  <label key={cls} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : isMerged ? 'border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                    <input type="checkbox" checked={isSelected} disabled={isMerged} onChange={() => setMergeSelections((prev) => prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls])} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed" />
                    <span className={`text-xs ${isMerged ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{cls} {isMerged && <span className="text-[9px] text-gray-400">(in use)</span>}</span>
                  </label>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <button onClick={() => setShowMergeModal(false)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Cancel</button>
              <button onClick={handleMerge} disabled={mergeSelections.length < 2} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Merge ({mergeSelections.length})</button>
            </div>
          </div>
        </div>
      )}

      {renameModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setRenameModal({ show: false, template: null, newName: '' })}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xs mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rename Template</h3>
            </div>
            <div className="p-4">
              <FieldLabel>Template Name</FieldLabel>
              <input type="text" value={renameModal.newName} onChange={(e) => setRenameModal((prev) => ({ ...prev, newName: e.target.value }))} className={INPUT_CLS} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') confirmRenameTemplate(); }} />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setRenameModal({ show: false, template: null, newName: '' })} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Cancel</button>
              <button onClick={confirmRenameTemplate} disabled={!renameModal.newName.trim()} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm disabled:opacity-50 cursor-pointer">Rename</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirmModal({ show: false, template: null })}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xs mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Delete Template</h3>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200">{deleteConfirmModal.template?.name}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">Created: {formatDate(deleteConfirmModal.template?.createdAt)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">Are you sure you want to permanently delete this template?</p>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setDeleteConfirmModal({ show: false, template: null })} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">Cancel</button>
              <button onClick={confirmDeleteTemplate} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableDesigner;