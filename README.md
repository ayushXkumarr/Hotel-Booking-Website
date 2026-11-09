# GrandStay Hotel Booking Management System

A full-stack, enterprise-grade hospitality booking and hotel management platform built with the MERN stack (MongoDB, Express, React, Node.js). GrandStay provides a guest-facing luxury reservation experience alongside administrative back-office tools for hotel, room, and booking management with concurrency protection and role-based access control.

---

## 🌟 Key Features

### Guest & Customer Experience
- **Luxury Hospitality UI:** Modern, responsive design built with React, Tailwind CSS, and Lucide icons.
- **Search & Filtering:** Real-time multi-criteria search filtering by destination city, guest rating, price range, and featured highlights.
- **Hotel & Room Showcase:** Detailed hotel profiles featuring rich amenities, photo galleries, room inventories, and transparent pricing.
- **Interactive Booking Flow:** Dynamic check-in/check-out date selection, guest count validation, and live price calculation ($nights \times rate$).
- **Simulated Instant Payment:** University-safe checkout workflow with immediate payment status confirmation (`Simulated_Paid`) and automatic refund handling upon cancellation.
- **Personal Booking Management:** Dedicated customer portal to track reservation history, view stay details, and cancel upcoming reservations adhering to check-in policies.
- **Real-Time System Health:** Home page health badge connected to `GET /api/health` displaying live backend and database connectivity status.

### Administrative Management Portal
- **Role-Based Access Control (RBAC):** Dedicated administrative routes guarded by JWT authentication and strict `admin` role verification.
- **Admin Dashboard:** Aggregated booking counts, financial summaries (gross simulated revenue), and operational statistics.
- **Hotel Inventory Management:** Create, update, view, and delete hotel properties with multi-image support and amenity configurations.
- **Room Inventory Management:** Manage rooms per hotel, specify room types, room numbers, capacities, pricing, and active availability flags.
- **Reservation Oversight:** Inspect platform-wide reservations, filter by booking status (`Confirmed`, `Cancelled`, `Completed`), and override booking states.

### Security & Concurrency Safeguards
- **In-Process Mutex Serialization (`KeyedMutex`):** Serializes concurrent asynchronous requests for the same room within the Node.js event loop to block double-booking race conditions.
- **MongoDB Multi-Document Transactions:** Clustered environments (MongoDB Atlas / replica sets) use write-lock transactions with atomic commit/rollback.
- **Zero Hardcoded Secrets:** Strict environment variable isolation for database URIs, JWT secrets, and administrative provisioning credentials.
- **Privilege Escalation Protection:** Public registration strictly forces `customer` role; administrative accounts cannot be registered via public endpoints.
- **Password Security:** Salted hashing with `bcryptjs` (salt factor 10) and exclusion of password fields from query projections by default (`select: false`).

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React |
| **Backend** | Node.js (ES Modules), Express.js 4, Mongoose ODM 8 |
| **Database** | MongoDB (Local Community Server or MongoDB Atlas Replica Set) |
| **Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS middleware |
| **Tooling** | PostCSS, Autoprefixer, Nodemon, Git |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 SPA (Vite)                  │
│       React Router DOM • Tailwind CSS • Axios Interceptor│
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (REST API)
                            │ Bearer <JWT Token>
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend API                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middlewares: CORS • JSON Parser • JWT Auth • RBAC│  │
│  └──────────────────────────┬───────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │ Controllers: Auth • Hotels • Rooms • Bookings    │  │
│  └──────────────────────────┬───────────────────────┘  │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │ Concurrency Guard: In-Process KeyedMutex         │  │
│  └──────────────────────────┬───────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                    MongoDB Database                    │
│   Users • Hotels • Rooms • Bookings • Transactions     │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```
Hotel Booking/
├── .gitignore                    # Repository-level ignore rules
├── README.md                     # Comprehensive project documentation
│
├── backend/                      # Express.js REST API Server
│   ├── .env.example              # Backend environment template
│   ├── .gitignore                # Backend-specific ignore rules
│   ├── package.json              # Backend dependencies and scripts
│   ├── package-lock.json
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # Mongoose database connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Registration, login, profile
│   │   │   ├── bookingController.js # Availability, reservations, admin oversight
│   │   │   ├── hotelController.js   # Public catalog & admin hotel management
│   │   │   └── roomController.js    # Room inventories & pricing
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # verifyToken & authorizeRole
│   │   │   └── errorHandler.js   # Centralized error normalization
│   │   ├── models/
│   │   │   ├── Booking.js        # Reservation schema & validation
│   │   │   ├── Hotel.js          # Hotel properties schema
│   │   │   ├── Room.js           # Room inventory schema
│   │   │   └── User.js           # User account schema with bcrypt hooks
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /api/auth
│   │   │   ├── bookingRoutes.js  # /api/bookings
│   │   │   ├── healthRoutes.js   # /api/health
│   │   │   ├── hotelRoutes.js    # /api/hotels
│   │   │   └── roomRoutes.js     # /api/rooms
│   │   ├── utils/
│   │   │   ├── generateToken.js  # JWT signing utility
│   │   │   ├── seedAdmin.js      # CLI admin bootstrapping script
│   │   │   └── seedHotels.js     # Sample luxury catalog seeder
│   │   ├── app.js                # Express application configuration
│   │   └── server.js             # Server listener & database initiation
│   └── tests/
│       └── e2e_verification.mjs  # Comprehensive end-to-end test suite
│
└── frontend/                     # React 18 Single Page Application
    ├── .env.example              # Frontend environment template
    ├── .gitignore                # Frontend-specific ignore rules
    ├── index.html                # Vite HTML entry point
    ├── package.json              # Frontend dependencies and scripts
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Router & route guards configuration
        ├── index.css             # Tailwind base styles
        ├── main.jsx              # Application root mount
        ├── components/
        │   ├── Footer.jsx
        │   ├── HealthBadge.jsx   # Live API/DB health indicator
        │   ├── Navbar.jsx        # Navigation bar with role-aware tabs
        │   ├── bookings/
        │   │   └── BookingModal.jsx # Date picker & reservation modal
        │   ├── common/
        │   │   ├── ConfirmationModal.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── hotels/
        │   │   ├── HotelCard.jsx
        │   │   └── HotelFilter.jsx
        │   └── rooms/
        │       └── RoomCard.jsx
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state & token persistence
        │   └── ToastContext.jsx  # Notification alert context
        ├── pages/
        │   ├── FeaturesPage.jsx
        │   ├── HomePage.jsx
        │   ├── HotelDetailsPage.jsx
        │   ├── HotelsPage.jsx
        │   ├── LoginPage.jsx
        │   ├── MyBookingsPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── RegisterPage.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── ManageBookings.jsx
        │       ├── ManageHotels.jsx
        │       └── ManageRooms.jsx
        └── services/
            └── api.js            # Axios client with JWT interceptor
```

---

## ⚙️ Prerequisites

Before getting started, ensure the following software is installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (packaged with Node.js)
- **MongoDB**: One of the following:
  - Local Community Edition ([Download MongoDB Community](https://www.mongodb.com/try/download/community))
  - MongoDB Atlas Cloud Account ([MongoDB Atlas Signup](https://www.mongodb.com/cloud/atlas))

---

## 🔐 Environment Configuration

The repository uses environment variables for sensitive settings. Templates are provided via `.env.example` in both folders.

### 1. Backend Environment (`backend/.env`)

Create `backend/.env` by copying `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | Optional | Port for the Express server | `5000` |
| `NODE_ENV` | Optional | Runtime environment | `development` or `production` |
| `CLIENT_URL` | Required (Prod) | Frontend origin allowed by CORS | `http://localhost:5173` |
| `MONGODB_URI` | **Required** | MongoDB connection URI | `mongodb://127.0.0.1:27017/hotel_booking` |
| `JWT_SECRET` | **Required** | High-entropy secret for signing JWTs | Strong random string (min 32 chars) |
| `JWT_EXPIRES_IN` | Optional | Expiration window for tokens | `7d` |
| `ADMIN_NAME` | Optional | Display name for bootstrapped admin | `GrandStay Administrator` |
| `ADMIN_EMAIL` | **Required (Seed)** | Email for the administrator | `admin@example.com` |
| `ADMIN_PASSWORD` | **Required (Seed)** | Password for administrator (min 6 chars) | Strong password |

> **Security Note:** Never commit `backend/.env` or paste actual production passwords into version control.

### 2. Frontend Environment (`frontend/.env`)

Create `frontend/.env` by copying `frontend/.env.example`:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Required** | Endpoint for backend API calls | `http://localhost:5000/api` |

---

## ☁️ MongoDB Atlas Setup Guide

To run GrandStay against a managed MongoDB Atlas cloud cluster:

1. **Create Account & Cluster:**
   - Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a free **M0 Shared Cluster** (e.g. `GrandStayCluster`).
2. **Configure Database User:**
   - Navigate to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication, specify a username (e.g., `grandstay_user`), and generate a secure password.
   - Assign the **Built-in Role**: `Read and write to any database`.
3. **Configure Network IP Access:**
   - Navigate to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - For development access, select **Allow Access from Anywhere** (`0.0.0.0/0`) or add your current workstation IP.
4. **Obtain Connection String:**
   - Go to **Deployments** → **Databases** → click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hotel_booking?retryWrites=true&w=majority
     ```
5. **Update `backend/.env`:**
   - Replace `<username>` and `<password>` with your database user credentials.
   - Paste the URI as `MONGODB_URI` in `backend/.env`.

---

## 🛠️ Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/hotel-booking.git
cd hotel-booking
```

### 2. Install Dependencies
Install dependencies for both backend and frontend packages:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Configure Environments
Copy the sample environment files and configure values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## 👤 Database Seeding & Admin Provisioning

### 1. Seed Luxury Catalog Data
Populates realistic luxury hotels (Paris, New York, Kyoto, Dubai, London, Bali) with high-definition Unsplash photography, room configurations, and price points:

```bash
cd backend
npm run seed:hotels
```

### 2. Provision System Administrator
Bootstrap the initial administrative account securely using credentials configured in `backend/.env` (`ADMIN_EMAIL` and `ADMIN_PASSWORD`):

```bash
cd backend
npm run seed:admin
```

> **Zero Hardcoded Fallback:** The seeder will refuse to run if `ADMIN_EMAIL` or `ADMIN_PASSWORD` are missing or shorter than 6 characters.

---

## 🚀 Running the Application

### 1. Start the Backend API Server
```bash
cd backend
npm run dev
```
- API Server starts on: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 2. Start the Frontend Development Server
In a separate terminal window:
```bash
cd frontend
npm run dev
```
- Client Application starts on: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoint Overview

### 1. Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and MongoDB connection state |

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account (`role='customer'`) |
| `POST` | `/api/auth/login` | Public | Sign in and receive signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user name, phone, or password |

### 3. Hotels (`/api/hotels`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hotels` | Public | Search hotels with pagination & query filters |
| `GET` | `/api/hotels/:id` | Public | Single hotel details with room catalog |
| `POST` | `/api/hotels` | Admin | Create a new hotel property |
| `PUT` | `/api/hotels/:id` | Admin | Update an existing hotel property |
| `DELETE` | `/api/hotels/:id` | Admin | Delete hotel and cascade delete rooms |

### 4. Rooms (`/api/rooms`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rooms/hotel/:hotelId` | Public | List all active rooms for a hotel |
| `GET` | `/api/rooms/:id` | Public | Single room specification & pricing |
| `POST` | `/api/rooms` | Admin | Create a room (validates unique room number per hotel) |
| `PUT` | `/api/rooms/:id` | Admin | Update room details, rates, or active state |
| `DELETE` | `/api/rooms/:id` | Admin | Remove room from inventory |

### 5. Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings/check-availability` | Public | Validate room availability for date range |
| `POST` | `/api/bookings` | Private (Customer) | Create booking with server-side price lock |
| `GET` | `/api/bookings/my-bookings` | Private (Customer) | Retrieve personal booking history |
| `GET` | `/api/bookings/:id` | Private (Owner/Admin) | Retrieve single reservation details |
| `PUT` | `/api/bookings/:id/cancel` | Private (Owner/Admin) | Cancel reservation and trigger simulated refund |
| `GET` | `/api/bookings/admin/all` | Admin | Platform-wide reservations with status filters |
| `GET` | `/api/bookings/admin/stats` | Admin | Aggregated booking and revenue analytics |
| `PUT` | `/api/bookings/admin/:id/status` | Admin | Manual status update with conflict guard |

---

## 🧪 Testing & Verification

The project includes an end-to-end verification suite covering 20 key functional and security behaviors:
1. Customer registration & role assignment
2. Customer login & JWT issuance
3. Anti-enumeration password rejection (401)
4. Admin provisioning & role authorization
5. Public hotel catalog listing
6. Multi-field search & regex query sanitization
7. Public room listing by hotel
8. Admin hotel creation RBAC gate
9. Admin room creation RBAC gate
10. Room availability date calculation
11. Booking creation & simulated payment
12. Overlapping date collision rejection (409 Conflict)
13. Contiguous turnover booking acceptance (same-day turnover)
14. Booking cancellation & refund status
15. Booking history user isolation
16. Unauthorized customer RBAC rejection (403 Forbidden)
17. Admin booking oversight & analytics
18. Server-side night and price calculations
19. Inverted date range rejection (400 Bad Request)
20. Concurrent booking serialization & race condition resilience

### Run Backend Tests:
```bash
cd backend
npm test
```

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 🖼️ Application Screenshots

<!-- Add your screenshots in a docs/screenshots directory when publishing -->

| Guest Landing & Search | Hotel Detail & Room Selection |
|---|---|
| ![Guest Landing Page](https://placehold.co/600x340/1e293b/ffffff?text=GrandStay+Landing+Page) | ![Hotel Details View](https://placehold.co/600x340/1e293b/ffffff?text=Hotel+Details+%26+Rooms) |

| Booking & Simulated Checkout | Customer Reservation Portal |
|---|---|
| ![Reservation Modal](https://placehold.co/600x340/1e293b/ffffff?text=Booking+Reservation+Modal) | ![My Bookings Dashboard](https://placehold.co/600x340/1e293b/ffffff?text=Customer+My+Bookings) |

| Admin Management Dashboard | Room & Inventory Controls |
|---|---|
| ![Admin Operations Portal](https://placehold.co/600x340/1e293b/ffffff?text=Admin+Analytics+Dashboard) | ![Inventory Management](https://placehold.co/600x340/1e293b/ffffff?text=Hotel+%26+Room+Inventory) |

---

## 🚢 Production Deployment

### 1. Backend Deployment (e.g. Render, Railway, AWS EC2)
- Build command: `npm install`
- Start command: `npm start`
- Configure Environment Variables in the hosting dashboard:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `CLIENT_URL=https://your-frontend-domain.com`
  - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hotel_booking?retryWrites=true&w=majority`
  - `JWT_SECRET=<strong-random-secret>`
  - `ADMIN_EMAIL=<admin-email>`
  - `ADMIN_PASSWORD=<admin-password>`
- Execute initial seed:
  ```bash
  npm run seed:hotels
  npm run seed:admin
  ```

### 2. Frontend Deployment (e.g. Vercel, Netlify, Cloudflare Pages)
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Configure Environment Variables:
  - `VITE_API_BASE_URL=https://your-backend-domain.com/api`
- Ensure SPA rewrite rule redirects all traffic (`/*`) to `/index.html`.

---

## 📄 License

This project is distributed under the ISC License. Designed and developed as an academic and demonstration project.
