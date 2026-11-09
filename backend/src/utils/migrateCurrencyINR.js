import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// Pre-load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Verified Seed Room Specifications
 *
 * Source of truth: Original database catalog from initial seed commit (cdc87665).
 * Maps verified hotel name + room number to:
 * - roomType: Expected exact room category
 * - originalUsdPrice: Historical USD price per night from initial database seed
 * - targetInrPrice: Official luxury INR price per night
 *
 * Safeguard rule: A room is ONLY updated if hotelName, roomNumber, roomType,
 * and originalUsdPrice ALL match with 100% precision. Any discrepancy is flagged as ambiguous.
 */
export const VERIFIED_INR_ROOM_SPECS = {
  // The Grand Luminary Palace (Paris)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'The Grand Luminary Palace': {
    '101': { roomType: 'Deluxe', originalUsdPrice: 420, targetInrPrice: 35000 },
    '201': { roomType: 'Executive Suite', originalUsdPrice: 750, targetInrPrice: 62000 },
    '301': { roomType: 'Presidential Suite', originalUsdPrice: 1600, targetInrPrice: 135000 },
  },
  // The Azure Waterfront Manhattan (New York)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'The Azure Waterfront Manhattan': {
    '401': { roomType: 'Standard', originalUsdPrice: 280, targetInrPrice: 24000 },
    '502': { roomType: 'Deluxe', originalUsdPrice: 460, targetInrPrice: 38000 },
    '601': { roomType: 'Executive Suite', originalUsdPrice: 890, targetInrPrice: 75000 },
  },
  // Kyoto Zen Haven & Onsen Sanctuary (Kyoto)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'Kyoto Zen Haven & Onsen Sanctuary': {
    '101': { roomType: 'Deluxe', originalUsdPrice: 390, targetInrPrice: 32000 },
    '202': { roomType: 'Executive Suite', originalUsdPrice: 720, targetInrPrice: 59000 },
  },
  // The Oasis Palm Monarch (Dubai)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'The Oasis Palm Monarch': {
    '301': { roomType: 'Standard', originalUsdPrice: 320, targetInrPrice: 26000 },
    '401': { roomType: 'Executive Suite', originalUsdPrice: 850, targetInrPrice: 70000 },
  },
  // The Royal Westminster Stays (London)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'The Royal Westminster Stays': {
    '102': { roomType: 'Standard', originalUsdPrice: 295, targetInrPrice: 25000 },
    '202': { roomType: 'Deluxe', originalUsdPrice: 440, targetInrPrice: 36000 },
  },
  // Villa Serenity Rainforest Retreat (Bali)
  // Source: backend/src/utils/seedHotels.js @ commit cdc87665
  'Villa Serenity Rainforest Retreat': {
    '101': { roomType: 'Deluxe', originalUsdPrice: 260, targetInrPrice: 22000 },
    '201': { roomType: 'Executive Suite', originalUsdPrice: 510, targetInrPrice: 42000 },
  },
};

/**
 * Backward-compatible rates mapping (hotelName -> roomNumber -> targetInrPrice)
 */
export const VERIFIED_INR_ROOM_RATES = Object.fromEntries(
  Object.entries(VERIFIED_INR_ROOM_SPECS).map(([hotel, rooms]) => [
    hotel,
    Object.fromEntries(Object.entries(rooms).map(([num, spec]) => [num, spec.targetInrPrice])),
  ])
);

/**
 * Core Non-Destructive Currency Migration Routine
 *
 * SAFEGUARDS:
 * 1. Defaults to DRY-RUN mode (zero database writes).
 * 2. Only updates rooms with an exact 4-point match: hotelName, roomNumber, roomType, and originalUsdPrice.
 * 3. Never overwrites custom, manually created, or price-modified rooms.
 * 4. Checks updateOne matchedCount and modifiedCount; zero-match/zero-modify recorded in failed array.
 * 5. Preserves all historical booking amounts; explicitly tags untagged bookings with 'USD'.
 * 6. Completely idempotent: safe to run multiple times without unintended changes.
 *
 * @param {Object} options
 * @param {boolean} [options.isDryRun=true]
 * @returns {Promise<Object>} Migration summary report
 */
export const runCurrencyMigration = async ({ isDryRun = true } = {}) => {
  const summary = {
    mode: isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE EXECUTION (Database Modified)',
    rooms: {
      totalScanned: 0,
      updated: [],
      alreadyInINR: [],
      ambiguous: [],
      unmappedOrCustom: [],
      failed: [],
    },
    bookings: {
      totalScanned: 0,
      taggedUSD: 0,
      alreadyTagged: 0,
      failed: [],
    },
  };

  // 1. Process All Existing Rooms in Inventory
  const allRooms = await Room.find({}).populate('hotel', 'name');
  summary.rooms.totalScanned = allRooms.length;

  for (const room of allRooms) {
    const hotelName = room.hotel?.name || 'Unknown Hotel';
    const roomNumber = room.roomNumber;
    const roomIdStr = room._id ? room._id.toString() : 'unknown';

    // Check if room is already explicitly denominated in INR
    if (room.currency === 'INR') {
      summary.rooms.alreadyInINR.push({
        roomId: roomIdStr,
        hotelName,
        roomNumber,
        currentPrice: room.pricePerNight,
        currency: 'INR',
      });
      continue;
    }

    // Check if verified specifications exist for this hotel and room number
    const hotelSpecs = VERIFIED_INR_ROOM_SPECS[hotelName];
    const roomSpec = hotelSpecs ? hotelSpecs[roomNumber] : undefined;

    if (!roomSpec) {
      // Unmapped / custom room: DO NOT GUESS OR MUTATE. Preserve as-is and report.
      summary.rooms.unmappedOrCustom.push({
        roomId: roomIdStr,
        hotelName,
        roomNumber,
        currentPrice: room.pricePerNight,
        currency: room.currency || 'USD (Unassigned)',
        reason: 'No verified seed mapping found. Left unchanged for administrator manual review.',
      });
      continue;
    }

    // Exact Match Validation:
    // Requires exact match for BOTH roomType AND original USD pricePerNight.
    // If roomType is missing or differs -> Ambiguous (skip).
    // If pricePerNight is missing or differs from expected original USD price -> Ambiguous (skip).
    const hasMissingRoomType = !room.roomType || typeof room.roomType !== 'string' || room.roomType.trim() === '';
    const hasMismatchedRoomType = !hasMissingRoomType && room.roomType !== roomSpec.roomType;
    const hasMissingOriginalPrice = room.pricePerNight === undefined || room.pricePerNight === null || isNaN(Number(room.pricePerNight));
    const hasMismatchedOriginalPrice = !hasMissingOriginalPrice && Number(room.pricePerNight) !== roomSpec.originalUsdPrice;

    if (hasMissingRoomType || hasMismatchedRoomType || hasMissingOriginalPrice || hasMismatchedOriginalPrice) {
      let ambiguityReason = '';
      if (hasMissingRoomType) {
        ambiguityReason = `Missing roomType: room document has no roomType defined (expected "${roomSpec.roomType}").`;
      } else if (hasMismatchedRoomType) {
        ambiguityReason = `Mismatched roomType: found "${room.roomType}", expected "${roomSpec.roomType}".`;
      } else if (hasMissingOriginalPrice) {
        ambiguityReason = `Missing pricePerNight: room document has no valid numeric rate (expected $${roomSpec.originalUsdPrice}).`;
      } else if (hasMismatchedOriginalPrice) {
        ambiguityReason = `Mismatched original price: found $${room.pricePerNight}, expected original seed price $${roomSpec.originalUsdPrice}. Possible custom or manually modified price.`;
      }

      summary.rooms.ambiguous.push({
        roomId: roomIdStr,
        hotelName,
        roomNumber,
        actualRoomType: room.roomType || null,
        expectedRoomType: roomSpec.roomType,
        actualPrice: room.pricePerNight !== undefined ? room.pricePerNight : null,
        expectedOriginalPrice: roomSpec.originalUsdPrice,
        reason: ambiguityReason,
      });
      continue;
    }

    // Exact 4-point match confirmed: hotelName, roomNumber, roomType, originalUsdPrice!
    const roomUpdatePlan = {
      roomId: roomIdStr,
      hotelName,
      roomNumber,
      roomType: room.roomType,
      oldPrice: room.pricePerNight,
      newPrice: roomSpec.targetInrPrice,
      currency: 'INR',
    };

    if (!isDryRun) {
      try {
        const updateRes = await Room.updateOne(
          { _id: room._id },
          { $set: { pricePerNight: roomSpec.targetInrPrice, currency: 'INR' } }
        );

        if (!updateRes || updateRes.matchedCount === 0) {
          summary.rooms.failed.push({
            roomId: roomIdStr,
            hotelName,
            roomNumber,
            error: `Zero documents matched: update query did not find room with _id "${roomIdStr}".`,
          });
          continue;
        }

        if (updateRes.modifiedCount === 0) {
          summary.rooms.failed.push({
            roomId: roomIdStr,
            hotelName,
            roomNumber,
            error: `Zero documents modified: room document matched but price/currency was not updated.`,
          });
          continue;
        }

        // Successfully updated in database
        summary.rooms.updated.push(roomUpdatePlan);
      } catch (err) {
        summary.rooms.failed.push({
          roomId: roomIdStr,
          hotelName,
          roomNumber,
          error: err.message,
        });
      }
    } else {
      // In dry-run mode, record proposed update without DB writes
      summary.rooms.updated.push(roomUpdatePlan);
    }
  }

  // 2. Process All Existing Bookings
  const allBookings = await Booking.find({});
  summary.bookings.totalScanned = allBookings.length;

  for (const booking of allBookings) {
    const bookingIdStr = booking._id ? booking._id.toString() : 'unknown';

    // Check if currency field is explicitly present in raw database document before getters
    const rawCurrency =
      booking._doc?.currency !== undefined
        ? booking._doc.currency
        : booking.get('currency', null, { getters: false });

    if (!rawCurrency) {
      if (!isDryRun) {
        try {
          const updateRes = await Booking.updateOne(
            { _id: booking._id },
            { $set: { currency: 'USD' } }
          );

          if (!updateRes || updateRes.matchedCount === 0) {
            summary.bookings.failed.push({
              bookingId: bookingIdStr,
              error: `Zero documents matched: update query did not find booking with _id "${bookingIdStr}".`,
            });
            continue;
          }

          if (updateRes.modifiedCount === 0) {
            summary.bookings.failed.push({
              bookingId: bookingIdStr,
              error: `Zero documents modified: booking document matched but currency was not updated.`,
            });
            continue;
          }

          summary.bookings.taggedUSD += 1;
        } catch (err) {
          summary.bookings.failed.push({
            bookingId: bookingIdStr,
            error: err.message,
          });
        }
      } else {
        // In dry-run mode, count proposed tagging without DB writes
        summary.bookings.taggedUSD += 1;
      }
    } else {
      summary.bookings.alreadyTagged += 1;
    }
  }

  return summary;
};

/**
 * CLI Entrypoint for `npm run migrate:currency`
 */
export const cliMigrate = async () => {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');
  const isDryRun = !isExecute;
  let exitCode = 0;

  console.log('================================================================');
  console.log(' GRANDSTAY HOTEL MANAGEMENT - CURRENCY MIGRATION (INR ₹)');
  console.log('================================================================');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Zero DB writes)' : 'LIVE EXECUTION (--execute flag provided)'}`);
  console.log('Connecting to database...');

  try {
    await connectDB();

    console.log('\nRunning migration scan...');
    const report = await runCurrencyMigration({ isDryRun });

    console.log('\n----------------------------------------------------------------');
    console.log(' 1. ROOMS INVENTORY REPORT');
    console.log('----------------------------------------------------------------');
    console.log(`Total Rooms Scanned:         ${report.rooms.totalScanned}`);
    console.log(`Verified Rooms ${isDryRun ? 'To Update' : 'Updated'}:    ${report.rooms.updated.length}`);
    console.log(`Rooms Already In INR:        ${report.rooms.alreadyInINR.length}`);
    console.log(`Ambiguous Rooms Flagged:     ${report.rooms.ambiguous.length} (Skipped for safety)`);
    console.log(`Unmapped / Custom Rooms:     ${report.rooms.unmappedOrCustom.length} (Left untouched)`);
    console.log(`Failed Room Updates:         ${report.rooms.failed.length}`);

    if (report.rooms.updated.length > 0) {
      console.log(`\n${isDryRun ? 'Proposed' : 'Executed'} Room Rate Updates:`);
      report.rooms.updated.forEach((r, idx) => {
        console.log(`  ${idx + 1}. [${r.hotelName}] Room ${r.roomNumber} (${r.roomType}): $${r.oldPrice} -> ₹${r.newPrice.toLocaleString('en-IN')}`);
      });
    }

    if (report.rooms.ambiguous.length > 0) {
      console.log('\n⚠️  Ambiguous Rooms Detected (Missing/mismatched roomType or price; skipped for safety):');
      report.rooms.ambiguous.forEach((r, idx) => {
        console.log(`  ${idx + 1}. Room ID: ${r.roomId} | Hotel: ${r.hotelName} | Room ${r.roomNumber}`);
        console.log(`     Reason: ${r.reason}`);
      });
    }

    if (report.rooms.unmappedOrCustom.length > 0) {
      console.log('\n⚠️  Unmapped / Custom Rooms (Skipped for safety):');
      report.rooms.unmappedOrCustom.forEach((r, idx) => {
        console.log(`  - Room ID: ${r.roomId} | Hotel: ${r.hotelName} | Room ${r.roomNumber} | Rate: ${r.currentPrice} (${r.currency})`);
      });
    }

    if (report.rooms.failed.length > 0) {
      console.log('\n❌ Failed Room Updates (Database errors):');
      report.rooms.failed.forEach((f) => {
        console.log(`  - Room ID: ${f.roomId} (${f.hotelName} #${f.roomNumber}): ${f.error}`);
      });
    }

    console.log('\n----------------------------------------------------------------');
    console.log(' 2. BOOKINGS CURRENCY AUDIT REPORT');
    console.log('----------------------------------------------------------------');
    console.log(`Total Bookings Scanned:      ${report.bookings.totalScanned}`);
    console.log(`Legacy Bookings ${isDryRun ? 'To Tag (USD)' : 'Tagged (USD)'}: ${report.bookings.taggedUSD} (Original amounts strictly preserved)`);
    console.log(`Bookings Already Tagged:     ${report.bookings.alreadyTagged}`);
    console.log(`Failed Booking Tags:         ${report.bookings.failed.length}`);

    if (report.bookings.failed.length > 0) {
      console.log('\n❌ Failed Booking Tags (Database errors):');
      report.bookings.failed.forEach((f) => {
        console.log(`  - Booking ID: ${f.bookingId}: ${f.error}`);
      });
    }

    console.log('\n================================================================');
    if (isDryRun) {
      console.log(' DRY-RUN COMPLETE: No changes were written to the database.');
      console.log(' To execute live updates, create a MongoDB Atlas backup first, then run:');
      console.log('   npm run migrate:currency:execute');
    } else {
      const hasFailures = report.rooms.failed.length > 0 || report.bookings.failed.length > 0;
      if (hasFailures) {
        console.error(' ❌ LIVE MIGRATION FAILED: Partial errors occurred during execution.');
        console.error(`    Room failures: ${report.rooms.failed.length} | Booking failures: ${report.bookings.failed.length}`);
        console.error('    Review the failed records listed above.');
        exitCode = 1;
      } else {
        console.log(' ✅ LIVE MIGRATION COMPLETE: Database successfully updated to INR.');
      }
    }
    console.log('================================================================\n');

    return report;
  } catch (fatalErr) {
    console.error('Fatal migration error during execution:', fatalErr);
    exitCode = 1;
    throw fatalErr;
  } finally {
    try {
      if (mongoose.connection && mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('[Migration] Database connection closed gracefully.');
      }
    } catch (closeErr) {
      console.error('[Migration] Error closing database connection:', closeErr);
    }
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  }
};

// Auto-run if executed directly from CLI
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  cliMigrate().catch((err) => {
    console.error('Migration failed with fatal error:', err);
    process.exit(1);
  });
}
