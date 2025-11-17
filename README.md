# 🚗 University Transportation Platform

A **fully functional**, production-ready ride-sharing platform designed specifically for university campuses. Connects students with verified drivers for safe, reliable transportation with real-time ride management, rating systems, and comprehensive admin oversight.

## ✨ **Key Features**

### **🔐 Complete Authentication System**
- **Email Verification** - Secure account verification for all users
- **Role-Based Access** - Separate interfaces for Students, Drivers, and Admins
- **Password Reset** - Secure password recovery system
- **Profile Management** - Complete user profiles with photo uploads

### **🚗 Real-Time Ride Management**
- **Live Ride Requests** - Students request rides with pickup/dropoff locations
- **Driver Assignment** - Automatic driver matching and assignment system
- **Status Tracking** - Real-time ride status updates (Pending → Accepted → In Progress → Completed)
- **Multi-Passenger Support** - Students can join existing rides
- **Route Planning** - Visual route display with pickup and destination markers

### **⭐ Advanced Rating System**
- **Driver Ratings** - 1-5 star rating system for completed rides
- **Written Reviews** - Detailed feedback from students
- **Average Calculations** - Real-time rating averages for drivers
- **Review Management** - Admin oversight of all driver reviews

### **👨‍💼 Comprehensive Admin Panel**
- **User Approvals** - Approve/reject new user registrations
- **Driver Management** - View performance metrics, ratings, and vehicle information
- **Student Management** - Monitor student activity and ride history
- **Ride Monitoring** - Track all rides across the platform
- **Analytics Dashboard** - Real-time KPIs and system statistics

### **📱 Modern UI/UX**
- **Responsive Design** - Mobile-first approach optimized for all devices
- **Professional Interface** - Beautiful, intuitive design with Tailwind CSS
- **Interactive Elements** - Smooth animations and hover effects
- **Accessibility** - WCAG compliant design

## 🏗️ **Architecture**

### **Backend (Python Flask)**
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens with role-based access control
- **Email Service**: SMTP integration for verification (authentication only)
- **Security**: Password hashing, parameterized queries, CORS protection

### **Frontend (Next.js)**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4.0 with custom design system
- **State Management**: React Hooks with efficient state updates
- **HTTP Client**: Custom API wrapper with authentication handling

### **Database (MySQL)**
- **Users Table** - Authentication and role management
- **Rides Table** - Ride requests and assignments
- **Ratings Table** - Driver performance tracking
- **Ride Passengers Table** - Multi-passenger ride support

## 🛠️ **Tech Stack**

| Component | Technology | Version |
|-----------|------------|---------|
| **Backend** | Python Flask | 3.0+ |
| **Frontend** | Next.js | 15.0+ |
| **Language** | TypeScript/JavaScript | ES2023+ |
| **Styling** | Tailwind CSS | 4.0+ |
| **Database** | MySQL | 8.0+ |
| **Authentication** | JWT | Latest |
| **Icons** | Lucide React | Latest |
| **Email** | SMTP (Gmail/Outlook) | - |
| **Deployment** | Production Ready | - |

## 🚀 **Quick Start**

### **Prerequisites**
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (for database)
- **Git** (for version control)

### **1. Clone Repository**
```bash
git clone <repository-url>
cd university-transport-platform
```

### **2. Backend Setup**
```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy and edit .env file with your settings
```

### **3. Frontend Setup**
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

### **4. Database Setup**
```bash
# Backend directory
cd Backend

# Initialize database tables
python -c "
from models import create_tables
print('Creating database tables...')
create_tables()
print('Database ready!')
"

# Or run the main app (creates tables automatically)
python app.py
```

### **5. Start Services**
```bash
# Terminal 1 - Backend
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### **6. Access Platform**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📋 **Fresh Clone Setup**

For detailed step-by-step instructions on setting up this project on a new machine after cloning from GitHub, see [FRESH_CLONE_SETUP.md](FRESH_CLONE_SETUP.md).

**Important**: The following files are ignored by Git and must be created manually:
- `.env` (backend environment variables)
- `.env.local` (frontend environment variables)
- MySQL database (created via setup scripts)



## 📁 **Project Structure**

```
university-transport-platform/
├── 📁 Backend/                          # Flask API Server
│   ├── 📄 app.py                        # Main Flask application
│   ├── 📄 models.py                     # Database models and functions
│   ├── 📄 email_service.py              # Email functionality
│   ├── 📄 requirements.txt              # Python dependencies
│   └── 📄 .env                          # Environment variables
├── 📁 Frontend/                         # Next.js React Application
│   ├── 📁 app/                          # Next.js App Router pages
│   │   ├── 📁 admin/                    # Admin-only pages
│   │   ├── 📁 driver/                   # Driver-only pages
│   │   └── 📁 student/                  # Student-only pages
│   ├── 📁 components/                   # Reusable React components
│   │   ├── 📄 MainLayout.tsx            # Layout with sidebar navigation
│   │   ├── 📄 Sidebar.tsx               # Role-based navigation
│   │   ├── 📄 RatingModal.tsx           # Ride rating system
│   │   └── 📄 [other components]        # Form components, tables, etc.
│   ├── 📁 lib/                          # Utilities and API
│   │   └── 📄 api.ts                    # HTTP client with authentication
│   └── 📄 package.json                  # Node.js dependencies
└── 📄 README.md                         # This file
```

## 🔧 **Configuration**

### **Backend Environment Variables (.env)**
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=uberdb

# Flask Configuration
FLASK_SECRET_KEY=your_secure_secret_key_here

# Email Configuration (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
```

### **Frontend Environment Variables (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📊 **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'driver', 'admin') NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Student fields
    student_id VARCHAR(50),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    emergency_contact VARCHAR(50),

    -- Driver fields
    license_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    vehicle_model VARCHAR(100),
    vehicle_plate VARCHAR(20),
    capacity INT DEFAULT 4
);
```

### **Rides Table**
```sql
CREATE TABLE rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    driver_id INT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_time DATETIME NOT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Ratings Table**
```sql
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    student_id INT NOT NULL,
    driver_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### **User Management**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### **Admin Endpoints**
- `GET /api/admin/all-drivers` - Get all drivers with stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/rides` - Get all rides
- `POST /api/admin/activate-driver/{id}` - Activate driver
- `GET /api/admin/driver/{id}/ratings` - Get driver ratings

### **Ride Management**
- `POST /api/student/request-ride` - Request a ride
- `GET /api/student/my-rides` - Get student ride history
- `GET /api/driver/available-rides` - Get available rides
- `GET /api/driver/my-rides` - Get driver ride history
- `POST /api/driver/accept-ride/{id}` - Accept a ride
- `PUT /api/ride/{id}/status` - Update ride status
- `POST /api/ride/{id}/rate` - Rate a completed ride

### **Utility**
- `GET /api/health` - System health check

## 🔄 **System Workflow**

### **User Registration Process**
```
1. User Signs Up → 2. Email Verification → 3. Admin Approval → 4. Account Activated
```

### **Ride Request Process**
```
1. Student Requests Ride → 2. System Stores Request → 3. Driver Accepts → 4. Ride In Progress → 5. Student Rates → 6. Ride Completed
```

### **Driver Management**
```
1. Driver Registers → 2. Email Verification → 3. Admin Approval → 4. Can Accept Rides → 5. Build Rating → 6. Performance Tracking
```

## 🧪 **Testing the Platform**

### **1. User Registration**
1. Visit http://localhost:3000
2. Register as student or driver
3. Check email for verification link
4. Login as admin to approve user

### **2. Ride Request Flow**
1. Login as student
2. Navigate to "Request Ride"
3. Fill pickup/dropoff details and submit
4. Login as driver and accept ride
5. Update ride status through completion

### **3. Rating System**
1. Complete a ride as driver
2. Login as student
3. Rate the ride (1-5 stars) with comment

## 🚀 **Production Deployment**

### **Backend Deployment**
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or with environment variables
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Frontend Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel, Netlify, etc.
```

### **Environment Setup (Production)**
```env
# Production Database
MYSQL_HOST=prod-db-server
MYSQL_USER=secure_user
MYSQL_PASSWORD=strong_password
MYSQL_DATABASE=uberdb_prod

# Production Flask
FLASK_ENV=production
JWT_SECRET_KEY=production_secret_key

# Production Email
SMTP_SERVER=smtp.your-provider.com
SMTP_USER=production@yourdomain.com
```

## 🔐 **Security Features**

- **JWT Authentication** with secure token handling
- **Password Hashing** using Werkzeug security
- **SQL Injection Protection** with parameterized queries
- **CORS Configuration** for cross-origin requests
- **Input Validation** on all endpoints
- **Role-Based Authorization** for API access
- **Rate Limiting** to prevent abuse

## 📈 **Performance Optimizations**

### **Backend**
- **Connection Pooling** for database efficiency
- **Query Optimization** with strategic indexes
- **Caching Ready** for frequently accessed data
- **Background Tasks** for email processing

### **Frontend**
- **Code Splitting** with Next.js App Router
- **Image Optimization** with Next.js Image component
- **Bundle Analysis** and optimization
- **Efficient State Management** with React hooks

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Submit pull request with clear description

### **Code Standards**
- **TypeScript** for frontend with strict typing
- **PEP 8** compliance for Python backend
- **Consistent naming** conventions throughout
- **Comprehensive testing** before submission
- **Documentation updates** for new features

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "feat: Add new feature description"
git push origin feature/your-feature-name

# Bug fixes
git checkout -b bugfix/issue-description
# Fix the issue
git commit -m "fix: Resolve issue description"
```

## 📚 **Documentation**

All comprehensive documentation is included in this README. For additional details:

- **System Workflows**: See the detailed workflow section above
- **API Reference**: Complete endpoint documentation in API section
- **Database Schema**: Full schema with relationships documented
- **Development Guide**: Best practices and coding standards

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Database Connection**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -h localhost -u root -p uberedb

# Verify credentials in .env file
```

#### **Email Configuration**
- Enable 2FA on Gmail and use app password
- Check spam folder for verification emails
- Verify SMTP settings in .env file

#### **Frontend Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check browser console for errors
# Verify API endpoints are accessible
```

## 🎯 **Roadmap**

### **Phase 1 (Current) ✅**
- Complete authentication system
- Real-time ride management
- Rating and review system
- Admin dashboard
- Responsive design

### **Phase 2 (Next) 🔄**
- **Payment Integration** - Stripe/PayPal integration
- **Real-time Notifications** - WebSocket implementation
- **GPS Tracking** - Live driver location tracking
- **Mobile App** - React Native companion app

### **Phase 3 (Future) 📋**
- **AI Route Optimization** - Smart routing algorithms
- **Predictive Analytics** - Demand forecasting
- **Multi-Campus Support** - University network expansion
- **Enterprise Features** - Advanced reporting and analytics

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Next.js** for the amazing React framework
- **Flask** for the lightweight Python backend
- **Tailwind CSS** for the beautiful styling system
- **MySQL** for reliable database management
- **Lucide React** for the comprehensive icon library

---

## 🎓 **About This Project**

Built specifically for university communities to solve the transportation challenges faced by students and campus staff. This platform provides a safe, reliable, and user-friendly solution for campus transportation needs.

**Key Benefits:**
- **Safe Transportation** - Verified drivers with performance tracking
- **Easy Booking** - Simple, intuitive ride request system
- **Real-time Updates** - Live status tracking for all rides
- **Performance Analytics** - Comprehensive driver and system metrics
- **Admin Oversight** - Complete platform management and monitoring

**Perfect for:**
- Universities and colleges
- Campus transportation departments
- Student services organizations
- Educational institutions of all sizes

---

**🚗 Built for university students**
