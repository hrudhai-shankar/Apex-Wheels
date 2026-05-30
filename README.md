# Apex Wheels - Premium Car Rental Website

Apex Wheels is a simple, modern, clean, and easy-to-debug car rental website designed with **beginner-friendly architecture** and **clean code practices**. It incorporates secure JWT authentication, a complete admin portal, and a Razorpay payment flow, completely backed by **Supabase (PostgreSQL)**!

---

## ✨ Features

### 👤 User Portal
- **Landing Hero**: Sleek product taglines, smooth transitions, and featured fleet catalogs.
- **Search & Filters**: Browse vehicle catalog using models, brand filters, seating configurations, or price constraints.
- **Detailed Specifications**: View cabin specs, transmission dynamics, fuel options, and standard insurance waivers.
- **Dynamic Booking & Quotes**: Interactive Pickup and Drop calendar triggers real-time price quotes.
- **Sandbox Razorpay Checkout**: Fully functional Razorpay Standard Checkout SDK.
- **Mock Checkout Mode**: Built-in developer mock that lets you test full checkout processes without needing API keys.
- **Booking Records**: Comprehensive chronological booking logs.

### 🔑 Admin Portal
- **Dashboard panel**: Direct oversight of fleet listings, client reservations, user profiles, and payment histories.
- **Vehicle CRUD Management**: Add, modify, or delete cars through sleek modal forms.
- **User Audits**: Access and manage platform accounts (with safeguards preventing self-deletion).
- **Payment Logs**: Journal records of completed, successful transaction logs.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), React Router v7, Lucide Icons, Vanilla HSL CSS variable styling.
- **Backend**: Node.js, Express.js.
- **Database**: Supabase (PostgreSQL via `@supabase/supabase-js`).
- **Payment API**: Razorpay SDK.
- **Security**: JWT (JSON Web Tokens), BCrypt.js password hashing.

---

## 📂 Project Structure

```text
/
├── package.json              # Root runner for scripts
├── README.md                 # Setup and documentation
├── backend/
│   ├── .env.example          # Environment placeholder variables
│   ├── .env                  # Configuration variables
│   ├── server.js             # Express application main entry point
│   ├── seed.js               # Sample vehicle generator script (Supabase)
│   ├── schema.sql            # PostgreSQL DDL table script
│   ├── supabase.js           # Supabase connection initializer
│   ├── controllers/          # Business logic controllers (auth, car, booking, user)
│   ├── routes/               # REST API routers
│   └── middleware/           # JWT and role authorization middlewares
└── frontend/
    ├── package.json          # React configuration
    ├── index.html            # Main markup page
    ├── src/
    │   ├── main.jsx          # React app entry point
    │   ├── App.jsx           # Routing configuration
    │   ├── index.css         # Global aesthetics and dark/light variables
    │   ├── components/       # Reusable components (Navbar, Footer, CarCard, ProtectedRoute)
    │   ├── pages/            # View pages (Home, Listings, Detail, Checkout, Login, Signup, Admin)
    │   └── utils/            # Shared API utility handlers
```

---

## 🚀 Local Installation & Setup

Ensure you have **Node.js** installed, and a free **Supabase** account created.

### Step 1: Install Dependencies
Run this in the project root folder to install packages for both frontend and backend concurrently:
```bash
npm run setup
```

### Step 2: Configure Environment Variables
Open `/backend/.env` and replace placeholders with your Supabase credentials:
```ini
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-key-here
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
ADMIN_SECRET=admin_secret_token_123
```
*Note: Make sure to use the **service_role** secret API key for `SUPABASE_KEY` so your Express backend can bypass Row Level Security (RLS) constraints to query database rows.*

### Step 3: Setup Tables in Supabase
1. Head to your Supabase project dashboard.
2. Select **SQL Editor** from the left-hand navigation menu.
3. Click **New Query**.
4. Open the [schema.sql](file:///d:/Desktop/Projects/Car%20rental/backend/schema.sql) file in your editor, copy its contents, paste them into the Supabase SQL editor box, and click **Run**.
5. All database tables (`users`, `cars`, `bookings`) will be built instantly!

### Step 4: Seed Database
Populate your newly created Supabase tables with six premium vehicles containing specs and gorgeous high-quality images:
```bash
npm run seed
```

### Step 5: Run the Application
Open two separate terminal windows inside the root directory and start the services:

- **Terminal 1 (Backend Server)**:
  ```bash
  npm run backend
  ```
  *(Server starts on `http://localhost:5000`)*

- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run frontend
  ```
  *(Client starts on `http://localhost:5173`)*

---

## 🎯 Important Guide & Tips

### 👑 How to Assign Admin Role
1. Head to `/register` on the client.
2. Click the **"Reveal Admin Registration"** dash border button at the bottom of the form.
3. Fill in standard registration details and enter the `ADMIN_SECRET` value defined in your backend `.env` (by default: `admin_secret_token_123`).
4. Click **Register**. You will immediately be registered as an `admin` role and gain access to the **Admin Panel** link in the navbar header.

### 💳 Testing the Razorpay Payment Gateway
- **Mock Mode (Recommended for instant setup)**: If you leave the `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as their default placeholders in `.env`, the website automatically flags local testing mode. Upon checkout, instead of loading the Razorpay payment modal, it provides a premium simulated checkout verification that immediately approves and logs your booking in 1.5 seconds!
- **Test Mode**: If you have a Razorpay developer account, supply your Test Key credentials in `backend/.env`. During checkout, the website will open the official Razorpay test portal modal. You can complete payments using standard Razorpay test card credentials!
