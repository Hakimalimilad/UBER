# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                     http://localhost:3000                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Login    │  │   Admin    │  │  Student   │            │
│  │   Page     │  │ Dashboard  │  │ Dashboard  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐                             │
│  │   Driver   │  │   Shared   │                             │
│  │ Dashboard  │  │ Components │                             │
│  └────────────┘  └────────────┘                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API (JSON)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (Flask)                           │
│                  http://localhost:5000                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              API Routes                              │    │
│  │  /api/health                                         │    │
│  │  /api/auth/register                                  │    │
│  │  /api/auth/login                                     │    │
│  │  /api/auth/me                                        │    │
│  │  /api/admin/users                                    │    │
│  │  /api/admin/users/:id/role                          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Middleware & Security                      │    │
│  │  - JWT Authentication                                │    │
│  │  - CORS Configuration                                │    │
│  │  - Role-based Access Control                         │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Business Logic (models.py)                  │    │
│  │  - User Management                                   │    │
│  │  - Authentication                                    │    │
│  │  - Database Operations                               │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ SQL Queries
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   DATABASE (MySQL)                           │
│                     Port 3306                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  users table                         │    │
│  │  - id (PRIMARY KEY)                                  │    │
│  │  - email (UNIQUE)                                    │    │
│  │  - password_hash                                     │    │
│  │  - full_name                                         │    │
│  │  - user_type (student/driver/admin)                 │    │
│  │  - phone                                             │    │
│  │  - created_at                                        │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. User Login Flow

```
┌──────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ User │      │ Frontend │      │ Backend │      │ Database │
└──┬───┘      └────┬─────┘      └────┬────┘      └────┬─────┘
   │               │                 │                 │
   │ Enter email   │                 │                 │
   │ & password    │                 │                 │
   ├──────────────>│                 │                 │
   │               │                 │                 │
   │               │ POST /api/auth/login             │
   │               ├────────────────>│                 │
   │               │                 │                 │
   │               │                 │ SELECT user     │
   │               │                 ├────────────────>│
   │               │                 │                 │
   │               │                 │ User data       │
   │               │                 │<────────────────┤
   │               │                 │                 │
   │               │                 │ Verify password │
   │               │                 │ Generate JWT    │
   │               │                 │                 │
   │               │ {token, user}   │                 │
   │               │<────────────────┤                 │
   │               │                 │                 │
   │               │ Store token     │                 │
   │               │ Redirect to     │                 │
   │               │ dashboard       │                 │
   │               │                 │                 │
   │ Dashboard     │                 │                 │
   │<──────────────┤                 │                 │
   │               │                 │                 │
```

### 2. Admin Get Users Flow

```
┌───────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ Admin │      │ Frontend │      │ Backend │      │ Database │
└───┬───┘      └────┬─────┘      └────┬────┘      └────┬─────┘
    │               │                 │                 │
    │ Click "Users" │                 │                 │
    ├──────────────>│                 │                 │
    │               │                 │                 │
    │               │ GET /api/admin/users             │
    │               │ Authorization: Bearer <token>    │
    │               ├────────────────>│                 │
    │               │                 │                 │
    │               │                 │ Verify JWT      │
    │               │                 │ Check role=admin│
    │               │                 │                 │
    │               │                 │ SELECT * FROM   │
    │               │                 │ users           │
    │               │                 ├────────────────>│
    │               │                 │                 │
    │               │                 │ All users       │
    │               │                 │<────────────────┤
    │               │                 │                 │
    │               │ {users: [...]}  │                 │
    │               │<────────────────┤                 │
    │               │                 │                 │
    │               │ Display table   │                 │
    │               │                 │                 │
    │ View users    │                 │                 │
    │<──────────────┤                 │                 │
    │               │                 │                 │
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION PROCESS                    │
└─────────────────────────────────────────────────────────────┘

1. User Registration
   ┌──────────┐
   │  Submit  │
   │   Form   │
   └────┬─────┘
        │
        ▼
   ┌──────────────────┐
   │  Hash Password   │
   │  (Werkzeug)      │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Store in DB     │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Generate JWT    │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Return Token    │
   └──────────────────┘

2. User Login
   ┌──────────┐
   │  Submit  │
   │   Form   │
   └────┬─────┘
        │
        ▼
   ┌──────────────────┐
   │  Find User by    │
   │  Email           │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Verify Password │
   │  (compare hash)  │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Generate JWT    │
   │  (24h expiry)    │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Return Token    │
   │  + User Data     │
   └──────────────────┘

3. Protected Request
   ┌──────────────────┐
   │  Request with    │
   │  JWT Token       │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Extract Token   │
   │  from Header     │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Verify Token    │
   │  Signature       │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Check Expiry    │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Extract user_id │
   │  & user_type     │
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Process Request │
   └──────────────────┘
```

---

## 🎭 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ROLES & PERMISSIONS                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         ADMIN                                 │
│  ✓ View all users                                            │
│  ✓ Update user roles                                         │
│  ✓ Access admin dashboard                                    │
│  ✓ View system statistics                                    │
│  ✓ Manage platform settings (future)                         │
│  ✓ View all rides (future)                                   │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
┌───────────────▼──────────────┐  ┌────────▼──────────────────┐
│         DRIVER                │  │        STUDENT            │
│  ✓ Create rides              │  │  ✓ Browse rides           │
│  ✓ Manage vehicles           │  │  ✓ Book rides             │
│  ✓ View bookings             │  │  ✓ View booking history   │
│  ✓ Toggle availability       │  │  ✓ Rate drivers           │
│  ✓ Track earnings            │  │  ✓ Track spending         │
│  ✓ View performance          │  │  ✓ View ride status       │
└──────────────────────────────┘  └───────────────────────────┘
```

---

## 📊 Database Schema (Current + Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                      CURRENT SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│              users                    │
├──────────────────────────────────────┤
│ PK  id            INT                 │
│ UQ  email         VARCHAR(255)        │
│     password_hash VARCHAR(255)        │
│     full_name     VARCHAR(255)        │
│     user_type     ENUM(...)           │
│     phone         VARCHAR(50)         │
│     created_at    TIMESTAMP           │
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                      PLANNED SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│            vehicles                   │
├──────────────────────────────────────┤
│ PK  id            INT                 │
│ FK  driver_id     INT → users.id      │
│     make          VARCHAR(100)        │
│     model         VARCHAR(100)        │
│     year          INT                 │
│     license_plate VARCHAR(50)         │
│     capacity      INT                 │
│     created_at    TIMESTAMP           │
└──────────────────────────────────────┘
                    │
                    │ 1:N
                    │
┌──────────────────────────────────────┐
│              rides                    │
├──────────────────────────────────────┤
│ PK  id            INT                 │
│ FK  driver_id     INT → users.id      │
│ FK  vehicle_id    INT → vehicles.id   │
│     origin        VARCHAR(255)        │
│     destination   VARCHAR(255)        │
│     departure_time DATETIME           │
│     available_seats INT               │
│     price         DECIMAL(10,2)       │
│     status        ENUM(...)           │
│     created_at    TIMESTAMP           │
└──────────────────────────────────────┘
                    │
                    │ 1:N
                    │
┌──────────────────────────────────────┐
│            bookings                   │
├──────────────────────────────────────┤
│ PK  id            INT                 │
│ FK  ride_id       INT → rides.id      │
│ FK  student_id    INT → users.id      │
│     seats_booked  INT                 │
│     booking_time  TIMESTAMP           │
│     status        ENUM(...)           │
│     created_at    TIMESTAMP           │
└──────────────────────────────────────┘
```

---

## 🔌 API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API LAYERS                              │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  Flask Routes (@app.route)                                   │
│  - Request parsing                                           │
│  - Response formatting                                       │
│  - HTTP status codes                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   MIDDLEWARE LAYER                            │
│  - JWT Authentication (@token_required)                      │
│  - Role Authorization (@admin_required)                      │
│  - CORS handling                                             │
│  - Error handling                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                        │
│  models.py functions                                         │
│  - create_user()                                             │
│  - get_user_by_email()                                       │
│  - verify_password()                                         │
│  - get_all_users()                                           │
│  - update_user_role()                                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   DATA ACCESS LAYER                           │
│  Database connection pool                                    │
│  - get_db_connection()                                       │
│  - SQL queries                                               │
│  - Transaction management                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                      DATABASE                                 │
│  MySQL                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🌐 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND STRUCTURE                         │
└─────────────────────────────────────────────────────────────┘

Frontend/
├── app/
│   ├── layout.js                ← Root layout (fonts, metadata)
│   ├── globals.css              ← Global styles (Tailwind)
│   │
│   ├── page.jsx                 ← Login/Register page
│   │   ├── State: isLogin, formData, error
│   │   ├── Functions: handleSubmit, handleChange, quickLogin
│   │   └── Components: Form, Toggle, QuickLogin buttons
│   │
│   ├── admin/
│   │   └── page.jsx             ← Admin dashboard
│   │       ├── State: users, loading, error
│   │       ├── Functions: fetchUsers, handleRoleChange
│   │       └── Components: Stats cards, Users table
│   │
│   ├── student/
│   │   └── page.jsx             ← Student dashboard
│   │       ├── State: availableRides, myRides
│   │       ├── Functions: handleBookRide
│   │       └── Components: Stats, Ride cards, Bookings table
│   │
│   └── driver/
│       └── page.jsx             ← Driver dashboard
│           ├── State: isAvailable, myRides, earnings
│           ├── Functions: toggleAvailability, handleCompleteRide
│           └── Components: Stats, Rides list, Vehicle info
│
├── public/                      ← Static assets
├── package.json                 ← Dependencies
└── next.config.mjs              ← Next.js config
```

---

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                   STATE FLOW                                 │
└─────────────────────────────────────────────────────────────┘

localStorage
├── token          → JWT token for authentication
└── user           → User object {id, email, full_name, user_type}

Component State (React Hooks)
├── Login Page
│   ├── isLogin: boolean
│   ├── formData: {email, password, full_name, user_type}
│   ├── error: string
│   └── loading: boolean
│
├── Admin Dashboard
│   ├── users: array
│   ├── currentUser: object
│   ├── loading: boolean
│   └── error: string
│
├── Student Dashboard
│   ├── currentUser: object
│   ├── availableRides: array (mock)
│   ├── myRides: array (mock)
│   └── loading: boolean
│
└── Driver Dashboard
    ├── currentUser: object
    ├── isAvailable: boolean
    ├── myRides: array (mock)
    ├── earnings: object
    └── loading: boolean
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   Internet   │
                        └──────┬───────┘
                               │
                    ┌──────────▼──────────┐
                    │   Load Balancer     │
                    │   (Nginx/CloudFlare)│
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐          ┌────────▼────────┐
        │   Frontend      │          │    Backend      │
        │   (Vercel)      │          │   (Heroku/AWS)  │
        │   CDN Cached    │          │   Auto-scaling  │
        └─────────────────┘          └────────┬────────┘
                                              │
                                    ┌─────────▼─────────┐
                                    │   Database        │
                                    │   (AWS RDS)       │
                                    │   + Backups       │
                                    └───────────────────┘
```

---

**This architecture is designed to be modular, scalable, and easy to extend!**
