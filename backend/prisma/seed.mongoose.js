/**
 * Mongoose Seed Script — bypass Prisma/Replica Set requirement
 * Creates test users directly via Mongoose models
 * Run: node prisma/seed.mongoose.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

// ── Inline User Schema (mirrors user.model.js) ──────────────────
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  fullName: { type: String },
  password: { type: String, required: true },
  role:     { type: String, enum: ['STUDENT', 'MENTOR', 'ADMIN'], default: 'STUDENT' },
  status:   { type: String, default: 'active' },
  verify:   { type: Boolean, default: false },
  phone:    { type: String },
  avatar:   { type: String },
}, { timestamps: true, collection: 'User' });  // 'User' matches user.model.js

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  // Connect to MongoDB standalone (no Replica Set needed)
  const url = (process.env.MONGOOSE_URL || process.env.DATABASE_URL || '')
    .replace(/[?&]replicaSet=[^&]*/g, '')
    .replace(/[?&]directConnection=[^&]*/g, '')
    .replace(/\?$/, '');

  console.log('[Seed] Connecting to:', url);
  await mongoose.connect(url, { maxPoolSize: 5 });
  console.log('[Seed] Connected to MongoDB\n');

  const password = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@sdn.com',   username: 'admin_sdn',   fullName: 'SDN Admin',   role: 'ADMIN',   verify: true },
    { email: 'mentor@sdn.com',  username: 'mentor_sdn',  fullName: 'SDN Mentor',  role: 'MENTOR',  verify: true },
    { email: 'student@sdn.com', username: 'student_sdn', fullName: 'SDN Student', role: 'STUDENT', verify: true },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      await User.updateOne({ email: u.email }, { $set: { password } });
      console.log(`[Seed] Updated password for: ${u.email}`);
    } else {
      await User.create({ ...u, password, status: 'active' });
      console.log(`[Seed] Created user: ${u.email} (${u.role})`);
    }
  }

  console.log('\n[Seed] ✅ Done! Test accounts ready:');
  console.log('  admin@sdn.com   / password123  (ADMIN)');
  console.log('  mentor@sdn.com  / password123  (MENTOR)');
  console.log('  student@sdn.com / password123  (STUDENT)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
