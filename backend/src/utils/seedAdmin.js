import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Pre-load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Secure Admin Seeding Script
 * Allows creating an initial administrative account for development and academic evaluation.
 *
 * SECURITY REQUIREMENT:
 * Administrator credentials MUST be provided through environment variables (ADMIN_EMAIL and ADMIN_PASSWORD).
 * No hardcoded default credentials are used.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'GrandStay Administrator';

    // Enforce environment variable presence
    if (!adminEmail || !adminPassword) {
      console.error('================================================================');
      console.error('[SeedAdmin] SECURITY ERROR: Missing required administrator credentials!');
      console.error('[SeedAdmin] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env');
      console.error('[SeedAdmin] Example:');
      console.error('             ADMIN_NAME="GrandStay Administrator"');
      console.error('             ADMIN_EMAIL=admin@grandstay.com');
      console.error('             ADMIN_PASSWORD=YourSecurePassword123');
      console.error('================================================================');
      process.exit(1);
    }

    if (adminPassword.length < 6) {
      console.error('[SeedAdmin] ERROR: ADMIN_PASSWORD must be at least 6 characters in length.');
      process.exit(1);
    }

    await connectDB();

    console.log(`[SeedAdmin] Checking existing administrator for: ${adminEmail}`);

    const existingAdmin = await User.findOne({ email: adminEmail.trim().toLowerCase() });

    if (existingAdmin) {
      console.log(`[SeedAdmin] User account already exists with current role: '${existingAdmin.role}'`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[SeedAdmin] Account role successfully elevated to 'admin'.`);
      } else {
        console.log(`[SeedAdmin] Administrator account is already active.`);
      }
    } else {
      console.log(`[SeedAdmin] Creating new administrator account...`);
      await User.create({
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
        phone: '+1 (555) 019-2834',
        role: 'admin',
      });
      console.log(`[SeedAdmin] Administrator account created successfully!`);
      console.log(`[SeedAdmin] Email: ${adminEmail}`);
      console.log(`[SeedAdmin] Role: admin`);
    }

    await mongoose.connection.close();
    console.log('[SeedAdmin] Database connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error(`[SeedAdmin] Error seeding administrator: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
