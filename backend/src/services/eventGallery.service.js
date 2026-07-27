import EventGallery from '../models/eventGallery.model.js';
import Event from '../models/event.model.js';
import { ApiError } from '../utils/apiError.js';
import { writeUploadFile, deleteUploadFile } from '../middlewares/upload.middleware.js';

const upsertBanner = async (eventId, file, baseUrl, userId) => {
  let bannerImage = null;
  if (file) {
    const existing = await EventGallery.findOne({ event: eventId }).lean();
    if (existing?.bannerImage) {
      deleteUploadFile(existing.bannerImage);
    }

    const filename = writeUploadFile(file.buffer, 'event-gallery', file.originalname);
    bannerImage = `${baseUrl}/uploads/event-gallery/${filename}`;
  }

  const gallery = await EventGallery.findOneAndUpdate(
    { event: eventId },
    {
      $set: { bannerImage, uploadedBy: userId },
      $setOnInsert: { event: eventId, galleryImages: [] },
    },
    { upsert: true, returnDocument: 'after' },
  ).lean();

  return gallery;
};

const getGalleryByEvent = async (eventId) => {
  const gallery = await EventGallery.findOne({ event: eventId })
    .populate({ path: 'uploadedBy', select: 'fullName' })
    .lean();

  if (!gallery) {
    return { bannerImage: null, galleryImages: [] };
  }

  return gallery;
};

const addGalleryImage = async (eventId, file, baseUrl, userId, caption) => {
  const eventExists = await Event.findById(eventId).select('_id').lean();
  if (!eventExists) {
    throw new ApiError(404, 'Event not found');
  }

  const filename = writeUploadFile(file.buffer, 'event-gallery', file.originalname);
  const imageUrl = `${baseUrl}/uploads/event-gallery/${filename}`;

  const gallery = await EventGallery.findOneAndUpdate(
    { event: eventId },
    {
      $push: {
        galleryImages: {
          imageUrl,
          caption: caption || '',
          sortOrder: 0,
          uploadedBy: userId,
        },
      },
      $setOnInsert: { event: eventId, uploadedBy: userId, bannerImage: null },
    },
    { upsert: true, returnDocument: 'after' },
  ).lean();

  const added = gallery.galleryImages[gallery.galleryImages.length - 1];
  return added;
};

const bulkAddGalleryImages = async (eventId, files, baseUrl, userId) => {
  const eventExists = await Event.findById(eventId).select('_id').lean();
  if (!eventExists) {
    throw new ApiError(404, 'Event not found');
  }

  const entries = files.map((file, index) => {
    const filename = writeUploadFile(file.buffer, 'event-gallery', file.originalname);
    const imageUrl = `${baseUrl}/uploads/event-gallery/${filename}`;
    return { imageUrl, caption: '', sortOrder: index, uploadedBy: userId };
  });

  const gallery = await EventGallery.findOneAndUpdate(
    { event: eventId },
    {
      $push: { galleryImages: { $each: entries } },
      $setOnInsert: { event: eventId, uploadedBy: userId, bannerImage: null },
    },
    { upsert: true, returnDocument: 'after' },
  ).lean();

  return entries.map((e, i) => ({
    ...e,
    _id: gallery.galleryImages[gallery.galleryImages.length - entries.length + i]._id,
  }));
};

const updateGalleryImage = async (imageId, data) => {
  const setFields = {};
  if (data.caption !== undefined) setFields['galleryImages.$.caption'] = data.caption;
  if (data.sortOrder !== undefined) setFields['galleryImages.$.sortOrder'] = Number(data.sortOrder);

  if (Object.keys(setFields).length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  const gallery = await EventGallery.findOneAndUpdate(
    { 'galleryImages._id': imageId },
    { $set: setFields },
    { returnDocument: 'after' },
  ).lean();

  if (!gallery) {
    throw new ApiError(404, 'Gallery image not found');
  }

  const updated = gallery.galleryImages.find((img) => img._id.toString() === imageId);
  return updated || null;
};

const deleteGalleryImage = async (imageId) => {
  const gallery = await EventGallery.findOne({ 'galleryImages._id': imageId }).lean();
  if (!gallery) {
    throw new ApiError(404, 'Gallery image not found');
  }

  const image = gallery.galleryImages.find((img) => img._id.toString() === imageId);
  if (image?.imageUrl) {
    deleteUploadFile(image.imageUrl);
  }

  await EventGallery.findOneAndUpdate(
    { 'galleryImages._id': imageId },
    { $pull: { galleryImages: { _id: imageId } } },
  );

  return { deleted: true };
};

const deleteGalleryByEvent = async (eventId) => {
  const gallery = await EventGallery.findOne({ event: eventId }).lean();
  if (!gallery) {
    return { deletedCount: 0 };
  }

  if (gallery.bannerImage) {
    deleteUploadFile(gallery.bannerImage);
  }

  if (gallery.galleryImages?.length > 0) {
    gallery.galleryImages.forEach((img) => {
      if (img.imageUrl) deleteUploadFile(img.imageUrl);
    });
  }

  const result = await EventGallery.deleteOne({ event: eventId });
  return { deletedCount: result.deletedCount || 0 };
};

const attachGalleryToEvents = async (events) => {
  if (!events || events.length === 0) return events;

  const eventIds = events.map((e) => e._id);
  const galleries = await EventGallery.find({ event: { $in: eventIds } }).lean();
  const galleryMap = new Map(galleries.map((g) => [g.event.toString(), g]));

  return events.map((e) => {
    const g = galleryMap.get(e._id.toString());
    return {
      ...e,
      bannerImage: g?.bannerImage || null,
      galleryImages: g?.galleryImages || [],
    };
  });
};

export default {
  upsertBanner,
  getGalleryByEvent,
  addGalleryImage,
  bulkAddGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  deleteGalleryByEvent,
  attachGalleryToEvents,
};
