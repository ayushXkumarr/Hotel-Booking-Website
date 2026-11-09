import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Resolve environment variables from backend/.env regardless of execution working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

const app = express();

/**
 * Explicit list of development origins permitted during local development.
 * These are NEVER permitted in production mode.
 */
export const explicitDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/**
 * Builds the effective allowed origins based on CLIENT_URL and runtime environment.
 *
 * PRODUCTION SECURITY REQUIREMENT:
 * In production (NODE_ENV === 'production'), only explicitly configured CLIENT_URL origins are permitted.
 * Localhost development origins are strictly excluded in production.
 *
 * @param {string} [clientUrlEnv]
 * @param {string} [nodeEnv]
 * @returns {string[]}
 */
export const buildAllowedOrigins = (
  clientUrlEnv = process.env.CLIENT_URL,
  nodeEnv = process.env.NODE_ENV
) => {
  const isProduction = nodeEnv === 'production';
  const configuredUrls = clientUrlEnv
    ? clientUrlEnv.split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean)
    : [];

  if (isProduction) {
    return configuredUrls;
  }

  return Array.from(new Set([...configuredUrls, ...explicitDevOrigins]));
};

export const allowedOrigins = buildAllowedOrigins();

/**
 * CORS Middleware Configuration
 * Enforces cross-origin network boundary policies on browser HTTP requests.
 * (Note: CORS is a browser resource-sharing policy, not user authentication or authorization).
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin header (e.g. mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const currentAllowed = buildAllowedOrigins(process.env.CLIENT_URL, process.env.NODE_ENV);
    const normalizedOrigin = origin.replace(/\/$/, '');

    if (currentAllowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not permitted by CORS policy.`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware: Parse incoming JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Hotel Booking Management System API',
    documentation: '/api/health',
    status: 'Running',
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
