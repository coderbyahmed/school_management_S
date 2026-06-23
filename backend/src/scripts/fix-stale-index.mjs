import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';

dotenv.config();

(function ensureDns() {
  const servers = dns.getServers();
  const allLoopback = servers.every(s => s === '127.0.0.1' || s === '::1');
  if (allLoopback) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('[DNS] Set public DNS servers');
  }
})();

async function main() {
  const uri = process.env.MONGO_URI;
  console.log('Connecting...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  // 1. Drop stale loginId index on students
  try {
    const indexes = await db.collection('students').indexes();
    console.log('\nStudent indexes before:');
    indexes.forEach(idx => console.log(`  ${idx.name}: ${JSON.stringify(idx.key)}, unique=${!!idx.unique}, sparse=${!!idx.sparse}`));

    const hasLoginId = indexes.some(idx => idx.name === 'loginId_1');
    if (hasLoginId) {
      await db.collection('students').dropIndex('loginId_1');
      console.log('\n✅ Dropped loginId_1 from students');
    } else {
      console.log('\nloginId_1 not found (already clean)');
    }

    const hasIsDeleted = indexes.some(idx => idx.name === 'isDeleted_1');
    if (hasIsDeleted) {
      await db.collection('students').dropIndex('isDeleted_1');
      console.log('✅ Dropped isDeleted_1 from students');
    }
  } catch (e) {
    console.log('Index cleanup:', e.message);
  }

  // 2. Verify final indexes
  const finalIdx = await db.collection('students').indexes();
  console.log('\nStudent indexes after:');
  finalIdx.forEach(idx => console.log(`  ${idx.name}: ${JSON.stringify(idx.key)}`));

  // 3. Test creating 3 students
  const password = 'Test@123';
  const template = {
    fullName: 'Test Student', fatherName: 'Test Father', gender: 'Male',
    dateOfBirth: new Date('2010-01-01'), status: 'Active', fatherPhone: '03001234567',
    city: 'Test City', address: 'Test Address', admissionDate: new Date('2025-09-01'),
    class: 'Class 1', academicYear: '2025', studentImage: 'uploads/student-images/test.jpg',
  };

  // Clean old test data
  await Student.deleteMany({ fullName: 'Test Student' });
  await User.deleteMany({ fullName: 'Test Student' });
  console.log('\nCleaned old test data');

  const students = [];
  const users = [];

  for (let i = 0; i < 3; i++) {
    console.log(`\n--- Creating student ${i + 1} ---`);
    try {
      const s = await Student.create({ ...template });
      console.log(`Student OK: ${s.studentId}, ${s.admissionNumber}`);
      students.push(s);

      const u = await User.create({
        loginId: s.studentId, fullName: s.fullName, password,
        role: 'student', referenceId: s._id, isActive: true,
      });
      console.log(`User OK: loginId=${u.loginId}`);
      users.push(u);
    } catch (e) {
      console.log(`FAILED: code=${e.code}, msg=${e.message}`);
      if (e.code === 11000) {
        console.log(`  keyPattern=${JSON.stringify(e.keyPattern)}`);
      }
    }
  }

  console.log(`\n=== RESULTS: ${students.length} students, ${users.length} users`);

  if (students.length === 3 && users.length === 3) {
    console.log('✅ ALL PASSED - stale index was the root cause');
  } else {
    console.log('❌ BUG PERSISTS');
  }

  // Cleanup
  await Student.deleteMany({ _id: { $in: students.map(s => s._id) } });
  await User.deleteMany({ _id: { $in: users.map(u => u._id) } });
  console.log('Test data cleaned');

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(e => { console.error(e); process.exit(1); });
