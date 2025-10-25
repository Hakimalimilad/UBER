# 🚗 University Transportation Platform

A comprehensive ride-sharing platform designed specifically for university campuses, connecting students with drivers for safe, reliable transportation.

## 🌟 Features

### **For Students**
- ✅ **Easy Ride Requests** - Simple form to request rides
- ✅ **Real-time Notifications** - Email alerts when drivers accept rides
- ✅ **Ride History** - Track all your past and current rides
- ✅ **Profile Management** - Update personal information
- ✅ **Free Service** - No payment required for students

### **For Drivers**
- ✅ **Available Rides Dashboard** - See pending ride requests
- ✅ **One-Click Acceptance** - Accept rides with single click
- ✅ **Ride Management** - Track assigned rides and status
- ✅ **Vehicle Management** - Update vehicle information
- ✅ **Email Notifications** - Get notified of new ride requests

### **For Admins**
- ✅ **User Management** - Approve/reject user registrations
- ✅ **Ride Monitoring** - View all rides in real-time
- ✅ **Analytics Dashboard** - Track platform performance
- ✅ **User Oversight** - Manage students and drivers

## 🏗️ Architecture

### **Backend**
- **Framework**: Python Flask
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens with role-based access
- **Email**: SMTP integration for notifications
- **Security**: Password hashing with bcrypt

### **Frontend**
- **Framework**: Next.js 14 with React 19
- **Styling**: TailwindCSS with custom components
- **Language**: TypeScript for type safety
- **State Management**: React hooks and context
- **Responsive**: Mobile-first design

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- MySQL 8.0+
- Gmail account for SMTP

### **1. Clone Repository**
```bash
git clone <repository-url>
cd Uber
```

### **2. Backend Setup**
```bash
cd Backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and email credentials

# Set up database
python setup_database.py

# Start backend
python app.py
```

### **3. Frontend Setup**
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **4. Access Platform**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📋 Environment Variables

### **Backend (.env)**
```env
# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=university_transport

# JWT Secret
JWT_SECRET_KEY=your_jwt_secret

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

## 🗄️ Database Schema

### **Core Tables**
- **users** - User accounts (students, drivers, admins)
- **rides** - Ride requests and assignments
- **email_verifications** - Email verification tokens

### **Key Features**
- **Role-based access** (student, driver, admin)
- **Email verification** required for all users
- **Admin approval** required for drivers
- **Ride status tracking** (pending, accepted, in_progress, completed, cancelled)

## 🔄 System Flow

### **Student Journey**
1. **Register** → Verify email → Wait for admin approval
2. **Request Ride** → Fill form → Submit request
3. **Get Notified** → Receive email when driver accepts
4. **Track Ride** → Monitor status in dashboard

### **Driver Journey**
1. **Register** → Verify email → Wait for admin approval
2. **Check Available Rides** → View pending requests
3. **Accept Ride** → One-click acceptance
4. **Manage Rides** → Track assigned rides

### **Admin Journey**
1. **Monitor System** → View all activities
2. **Approve Users** → Review and approve registrations
3. **Oversee Rides** → Monitor ride operations

## 📧 Email Notifications

The platform uses your existing SMTP configuration to send:
- **Registration confirmations**
- **Email verification links**
- **Ride request notifications** to drivers
- **Ride acceptance confirmations** to students
- **Admin approval notifications**

## 🎨 UI/UX Features

### **Design System**
- **Consistent styling** across all forms
- **Dark, visible text** in all input fields
- **Proper contrast** for accessibility
- **Mobile-responsive** design
- **Clean, professional** interface

### **Form Components**
- **RideRequestForm** - Student ride requests
- **ProfileForm** - User profile management
- **VehicleForm** - Driver vehicle information
- **Shared styling** - Consistent input classes

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `PUT /api/auth/update-profile` - Profile updates

### **Ride Management**
- `POST /api/student/request-ride` - Request a ride
- `GET /api/driver/available-rides` - Get available rides
- `POST /api/driver/accept-ride/<id>` - Accept a ride
- `GET /api/student/my-rides` - Student ride history
- `GET /api/driver/my-rides` - Driver ride history
- `PUT /api/ride/<id>/status` - Update ride status

### **Admin Functions**
- `GET /api/admin/pending-approvals` - Get pending users
- `POST /api/admin/approve-user/<id>` - Approve user
- `GET /api/admin/rides` - Get all rides
- `GET /api/admin/users` - Get all users

## 🛡️ Security Features

- **JWT Authentication** with role-based access
- **Password hashing** using bcrypt
- **Email verification** for all accounts
- **Admin approval** for driver accounts
- **Input validation** on all forms
- **SQL injection protection** with parameterized queries

## 📱 Responsive Design

The platform is fully responsive and works on:
- **Desktop** - Full feature access
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

## 🚀 Deployment

### **Backend Deployment**
```bash
# Production setup
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Frontend Deployment**
```bash
# Build for production
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Payment integration (optional)
- [ ] Multi-language support

---

**Built with ❤️ for university communities**
