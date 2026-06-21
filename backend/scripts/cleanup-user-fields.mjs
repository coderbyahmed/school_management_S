import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management';

const FIELDS_TO_REMOVE = ['otp', 'otpExpiry', 'isOtpVerified', 'phone', 'profileImage'];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const result = await db.collection('users').updateMany(
    {},
    { $unset: FIELDS_TO_REMOVE.reduce((acc, field) => ({ ...acc, [field]: '' }), {}) },
  );

  console.log(`Modified ${result.modifiedCount} documents`);
  console.log(`Matched ${result.matchedCount} documents`);

  await mongoose.disconnect();
  console.log('Done');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
