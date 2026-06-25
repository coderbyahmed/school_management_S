import mongoose from 'mongoose';

const timetableTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    baseTemplate: {
      type: String,
      required: [true, 'Base template is required'],
      trim: true,
    },
    headerSettings: {
      type: Object,
      default: {},
    },
    tableHeaderSettings: {
      type: Object,
      default: {},
    },
    periodCellSettings: {
      type: Object,
      default: {},
    },
    breakCellSettings: {
      type: Object,
      default: {},
    },
    rowSettings: {
      type: Object,
      default: {},
    },
    layoutSettings: {
      type: Object,
      default: {},
    },
    mergeSettings: {
      type: Object,
      default: {},
    },
    printSettings: {
      type: Object,
      default: {},
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const TimetableTemplate = mongoose.model('TimetableTemplate', timetableTemplateSchema);

export default TimetableTemplate;
