# 🚗 Student Transport Platform - Frontend

A **fully functional** university student transportation platform built with **Next.js 15**, **React 19**, and **TypeScript**. Features role-based dashboards, real-time ride management, rating system, and comprehensive admin tools.

## ✨ **Current Features**

### **🔐 Authentication & User Management**
- **Email Verification**: Secure email-based account verification
- **Role-Based Access**: Separate interfaces for Students, Drivers, and Admins
- **Profile Management**: Complete user profile system with photo uploads
- **Password Reset**: Secure password recovery system

**Note**: Email system used only for authentication (verification & password reset), not for ride notifications.

### **🚗 Ride Management System**
- **Real-Time Ride Requests**: Students can request rides with pickup/dropoff locations
- **Driver Assignment**: Automatic driver matching and assignment system
- **Live Status Tracking**: Real-time ride status updates (Pending → Accepted → In Progress → Completed)
- **Multi-Passenger Support**: Students can join existing rides
- **Route Planning**: Visual route display with pickup and destination markers

### **⭐ Rating & Review System**
- **Driver Ratings**: 1-5 star rating system for completed rides
- **Written Reviews**: Detailed feedback from students
- **Average Calculations**: Real-time rating averages for drivers
- **Review Management**: Admin can view all driver reviews

### **👨‍💼 Admin Panel**
- **User Approvals**: Approve/reject new user registrations
- **Driver Management**: View performance metrics, ratings, and vehicle info
- **Student Management**: Monitor student activity and ride history
- **Ride Monitoring**: Track all rides across the platform
- **Statistics Dashboard**: Real-time analytics and KPIs

### **📱 Responsive Design**
- **Mobile-First**: Optimized for all device sizes
- **Modern UI**: Beautiful, intuitive interface with Tailwind CSS
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Styling**: Consistent design system

## 🏗️ **Tech Stack**

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript/JavaScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **State Management**: React Hooks (useState/useEffect)
- **HTTP Client**: Fetch API with custom wrapper
- **Authentication**: JWT token-based auth

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Backend server running (Flask/Python at `http://localhost:5000`)
- MySQL database configured

### **Installation**

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Set up environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### **🔑 Demo Credentials**

**Admin Access:**
- Email: `admin@university.edu`
- Password: `admin123`

**Driver Access:**
- Email: `john.driver@university.edu`
- Password: `driver123`

**Student Access:**
- Email: `alice.student@university.edu`
- Password: `student123`

## 📁 **Project Structure**

```
Frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/                   # Admin-only pages
│   │   ├── analytics.tsx        # Driver Management & Analytics
│   │   ├── approvals/           # User approval system
│   │   ├── rides/               # Ride monitoring
│   │   ├── students.tsx         # Student management
│   │   ├── users.tsx            # User management
│   │   └── view-user/[id]/      # Individual user details
│   ├── driver/                  # Driver-only pages
│   │   ├── page.jsx             # Driver dashboard
│   │   ├── rides/               # Driver ride history
│   │   ├── available-rides/     # Available ride requests
│   │   └── vehicle/             # Vehicle management
│   ├── student/                 # Student-only pages
│   │   ├── page.jsx             # Student dashboard
│   │   ├── request/             # Ride request form
│   │   └── rides/               # Student ride history
│   └── page.tsx                 # Authentication (Login/Register)
├── components/                  # Reusable React components
│   ├── MainLayout.tsx           # Layout with sidebar navigation
│   ├── Sidebar.tsx              # Role-based navigation
│   ├── RatingModal.tsx          # Ride rating system
│   ├── ProfileForm.tsx          # User profile forms
│   ├── VehicleForm.tsx          # Driver vehicle forms
│   ├── RideRequestForm.tsx      # Student ride requests
│   ├── Table.tsx                # Data tables with sorting
│   ├── EmptyState.tsx           # Empty state displays
│   ├── DriverRideCard.tsx       # Driver ride cards
│   └── Card.tsx                 # UI stat cards
├── lib/                         # Utilities and API
│   └── api.ts                   # HTTP client with authentication
└── public/                      # Static assets
```

## 🔄 **System Workflow**

### **1. User Registration**
```
User Signs Up → Email Verification Required → Admin Approval → Account Activated
```

### **2. Ride Request Flow**
```
Student Requests Ride → System Notifies Drivers → Driver Accepts → Ride In Progress → Student Rates → Ride Completed
```

### **3. Admin Management**
```
Monitor All Users → Approve New Registrations → Manage Drivers → View Analytics → Monitor System Health
```

## 📊 **Database Structure**

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete database documentation.

## 🔌 **API Integration**

The frontend connects to a Flask backend running on `http://localhost:5000`. Key endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/admin/all-drivers` - Driver management
- `GET /api/driver/my-rides` - Driver ride history
- `POST /api/student/request-ride` - Ride requests
- `POST /api/ride/{id}/rate` - Ride ratings

## 🎯 **Demo Script (5-7 Minutes)**

1. **System Overview (1 min)**:
   - Show login page and explain role-based access
   - Demonstrate responsive design

2. **Student Experience (2 mins)**:
   - Login as student and explore dashboard
   - Submit a ride request with pickup/dropoff
   - Check ride status in "My Rides"

3. **Driver Experience (1 min)**:
   - Login as driver and view available rides
   - Accept a ride request
   - Update ride status to completed

4. **Admin Experience (1 min)**:
   - Login as admin and view comprehensive dashboard
   - Check driver performance and ratings
   - Approve pending user registrations

## 🚀 **Production Ready Features**

- ✅ **Secure Authentication** with JWT tokens
- ✅ **Email Verification** system
- ✅ **Role-Based Authorization**
- ✅ **Real-time Status Updates**
- ✅ **Responsive Mobile Design**
- ✅ **Professional UI/UX**
- ✅ **Database Integration**
- ✅ **Rating System**
- ✅ **Multi-user Support**

## 📈 **Next Steps**

- **Payment Integration**: Add payment processing for rides
- **Real-time Notifications**: WebSocket implementation
- **Advanced Analytics**: More detailed reporting
- **Mobile App**: React Native companion app
- **GPS Tracking**: Live location tracking for rides

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



---

**🎓 Built for university students**
