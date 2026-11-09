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
 * Core Administrator Provisioning Logic
 *
 * SECURITY ENFORCEMENT:
 * - Credentials must be supplied via environment variables or explicit parameters.
 * - Never promotes an existing customer account to admin.
 * - If email belongs to a customer, throws a clear security conflict error.
 * - If admin account already exists, confirms its status without re-elevating roles.
 * - Only creates an admin if no account with that email exists.
 *
 * @param {Object} options
 * @param {string} options.adminEmail
 * @param {string} options.adminPassword
 * @param {string} [options.adminName]
 * @returns {Promise<{ status: string, user: Object }>}
 */
export const provisionAdmin = async ({ adminEmail, adminPassword, adminName = 'GrandStay Administrator' }) => {
  if (!adminEmail || !adminPassword) {
    throw new Error('Missing required administrator credentials. ADMIN_EMAIL and ADMIN_PASSWORD must be configured.');
  }

  if (adminPassword.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters in length.');
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      const conflictMsg = `SECURITY CONFLICT: Email '${normalizedEmail}' is already registered with role '${existingUser.role}'. Automatic privilege escalation of existing customer accounts to administrator is strictly prohibited.`;
      throw new Error(conflictMsg);
    }
    return {
      status: 'EXISTS',
      user: existingUser,
      message: `Administrator account for '${normalizedEmail}' already exists and is active.`,
    };
  }

  const newAdmin = await User.create({
    name: adminName.trim(),
    email: normalizedEmail,
    password: adminPassword,
    phone: '+1 (555) 019-2834',
    role: 'admin',
  });

  return {
    status: 'CREATED',
    user: newAdmin,
    message: `Administrator account created successfully for '${normalizedEmail}'.`,
  };
};

/**
 * CLI Entrypoint for `npm run seed:admin`
 */
export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'GrandStay Administrator';

    if (!adminEmail || !adminPassword) {
      console.error('================================================================');
      console.error('[SeedAdmin] SECURITY ERROR: Missing required administrator credentials!');
      console.error('[SeedAdmin] ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env');
      console.error('[SeedAdmin] Example:');
      console.error('             ADMIN_NAME="GrandStay Administrator"');
      console.error('             ADMIN_EMAIL=admin@example.com');
      console.error('             ADMIN_PASSWORD=your_secure_password_min_6_chars');
      console.error('================================================================');
      process.exit(1);
    }

    await connectDB();
    console.log(`[SeedAdmin] Checking administrator provisioning for: ${adminEmail}`);

    const result = await provisionAdmin({ adminEmail, adminPassword, adminName });

    console.log('================================================================');
    console.log(`[SeedAdmin] ${result.message}`);
    console.log(`[SeedAdmin] Email: ${result.user.email}`);
    console.log(`[SeedAdmin] Role:  ${result.user.role}`);
    console.log('================================================================');

    await mongoose.connection.close();
    console.log('[SeedAdmin] Database connection closed gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('================================================================');
    console.error(`[SeedAdmin] Seeding Aborted: ${error.message}`);
    console.error('================================================================');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Execute if run directly from CLI
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('seedAdmin.js') ||
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
);

if (isDirectExecution) {
  seedAdmin();
}
