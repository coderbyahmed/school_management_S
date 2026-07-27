import mongoose from 'mongoose';

const eventGallerySchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      unique: true,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    galleryImages: [
      {
        imageUrl: { type: String, required: true },
        caption: { type: String, default: '', maxlength: 500 },
        sortOrder: { type: Number, default: 0 },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const EventGallery = mongoose.model('EventGallery', eventGallerySchema);

export default EventGallery;
