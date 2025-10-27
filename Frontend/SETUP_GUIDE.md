# 🛠️ Setup & Installation Guide

## 📋 **Complete Setup Instructions**

This guide covers setting up both the backend (Flask/Python) and frontend (Next.js/React) for the Student Transport Platform.

## 🏗️ **System Requirements**

### **Minimum Requirements:**
- **Operating System**: Windows 10/11, macOS 12+, Linux Ubuntu 20.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for email services

### **Software Requirements:**
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (for database)
- **Git** (for version control)

## 📦 **Backend Setup (Flask)**

### **1. Navigate to Backend Directory**
```bash
cd Backend
```

### **2. Create Virtual Environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### **3. Install Python Dependencies**
```bash
pip install -r requirements.txt
```

### **4. Set Up Environment Variables**
Create a `.env` file in the Backend directory:

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

### **5. Set Up MySQL Database**
```sql
-- Create database
CREATE DATABASE uberedb;

-- Create user (optional)
CREATE USER 'uber_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON uberedb.* TO 'uber_user'@'localhost';
FLUSH PRIVILEGES;
```

### **6. Run Backend Server**
```bash
python app.py
```

**Backend will run on:** `http://localhost:5000`
**Auto-creates database tables on first run**

## 🌐 **Frontend Setup (Next.js)**

### **1. Navigate to Frontend Directory**
```bash
cd Frontend
```

### **2. Install Node.js Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **4. Run Frontend Server**
```bash
npm run dev
```

**Frontend will run on:** `http://localhost:3000`
**Uses Turbopack for fast development**

## 🔧 **Initial Setup & Configuration**

### **1. Create Admin User**
The system automatically creates an admin user on first run. Check your email for verification.

**Default Admin Credentials:**
- Email: `admin@university.edu`
- Password: `admin123`

### **2. Verify Email Settings**
Update the SMTP configuration in `.env` to use your email service:
- **Gmail**: Use app password (not regular password)
- **Outlook**: Use SMTP settings
- **Custom**: Configure your SMTP server

**Note**: Email system is used only for:
- User registration verification
- Password reset functionality
- Admin approval notifications (if needed)

### **3. Test Database Connection**
```bash
# Backend terminal
python -c "
from models import get_db_connection
try:
    conn = get_db_connection()
    print('✅ Database connected successfully!')
    conn.close()
except Exception as e:
    print(f'❌ Database error: {e}')
"
```

## 🚀 **Running the Complete System**

### **Terminal Setup:**
```bash
# Terminal 1 - Backend
cd Backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### **Access Points:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🔑 **Demo User Accounts**

### **Admin User (for testing)**
```bash
# Backend terminal
cd Backend
python -c "
from models import create_user
admin_id = create_user('admin@university.edu', 'admin123', 'System Administrator', 'admin')
print(f'Admin user created with ID: {admin_id}')
"
```

### **Test Data Creation**
```bash
# Backend terminal
cd Backend
python -c "
from models import create_user, get_all_users
import os

# Create test users
create_user('john.driver@university.edu', 'driver123', 'John Smith', 'driver')
create_user('sarah.wilson@university.edu', 'driver123', 'Sarah Wilson', 'driver')
create_user('alice.student@university.edu', 'student123', 'Alice Johnson', 'student')
create_user('bob.brown@university.edu', 'student123', 'Bob Brown', 'student')

print('✅ Test users created!')
users = get_all_users()
drivers = [u for u in users if u.get('user_type') == 'driver']
students = [u for u in users if u.get('user_type') == 'student']
print(f'📊 Database now has: {len(drivers)} drivers, {len(students)} students')
"
```

## 🧪 **Testing the System**

### **1. User Registration Flow**
1. Go to http://localhost:3000
2. Register as a student or driver
3. Check email for verification link
4. Login as admin to approve the user

### **2. Ride Request Flow**
1. Login as student
2. Go to "Request Ride"
3. Fill out pickup/dropoff details
4. Submit request

### **3. Driver Acceptance**
1. Login as driver
2. Check "Available Rides"
3. Accept a ride request
4. Update status to "Start Ride" → "Complete Ride"

### **4. Rating System**
1. After ride completion, login as student
2. Rate the ride (1-5 stars)
3. Add optional comment

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **Database Connection Error**
```bash
# Check MySQL service
sudo service mysql status  # Linux
# or Windows Services

# Verify credentials in .env file
# Test connection manually
mysql -h localhost -u root -p uberedb
```

#### **Email Not Sending**
- Verify SMTP credentials in `.env`
- For Gmail: Enable 2FA and use app password
- Check spam folder for test emails

#### **Frontend Not Loading**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check if backend is running
curl http://localhost:5000/api/health
```

#### **Authentication Issues**
```bash
# Check JWT token in browser
# F12 → Application → Local Storage
# Look for 'token' key

# Verify user in database
mysql -u root -p uberedb -e "SELECT id, email, user_type, is_verified, is_approved FROM users;"
```

## 🚀 **Production Deployment**

### **Backend Deployment:**
1. **Set Environment**: `FLASK_ENV=production`
2. **Configure Database**: Production MySQL server
3. **Set Up SSL**: HTTPS certificates
4. **Configure Email**: Production SMTP service
5. **Set Up Monitoring**: Error tracking and logging

### **Frontend Deployment:**
1. **Build Production**: `npm run build`
2. **Set Environment**: Production API URL
3. **Deploy**: Vercel, Netlify, or custom hosting
4. **Configure CDN**: For static assets

### **Security Checklist:**
- ✅ **HTTPS Only**: SSL certificates configured
- ✅ **Strong Passwords**: Password policy enforced
- ✅ **Rate Limiting**: API abuse protection
- ✅ **Input Validation**: XSS and injection protection
- ✅ **Error Logging**: Production error tracking
- ✅ **Backup Strategy**: Database and file backups

## 📊 **Performance Monitoring**

### **Database Performance:**
```sql
-- Check slow queries
SHOW PROCESSLIST;
SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND != 'Sleep';

-- Monitor connections
SHOW STATUS LIKE 'Threads_connected';
```

### **Application Monitoring:**
- **Backend**: Flask logging configuration
- **Frontend**: Next.js analytics
- **Database**: MySQL slow query log
- **System**: Server resource monitoring

## 🔄 **Backup & Recovery**

### **Database Backup:**
```bash
# Daily backup script
mysqldump -u root -p uberedb > backup_$(date +%Y%m%d).sql
```

### **File Backup:**
```bash
# Backup both backend and frontend
tar -czf uber_platform_backup_$(date +%Y%m%d).tar.gz Backend/ Frontend/
```

## 📈 **Scaling Considerations**

### **Database Scaling:**
- **Read Replicas**: For analytics queries
- **Connection Pooling**: Already implemented
- **Indexing Strategy**: Optimized for query patterns

### **Application Scaling:**
- **Load Balancing**: Multiple frontend instances
- **Caching**: Redis for session data
- **CDN**: Static asset delivery

## 🎯 **Quick Start Checklist**

- [ ] **MySQL installed and running**
- [ ] **Backend dependencies installed**
- [ ] **Frontend dependencies installed**
- [ ] **Environment variables configured**
- [ ] **Database tables created**
- [ ] **Email service configured**
- [ ] **Both servers running**
- [ ] **Test user accounts created**
- [ ] **Email verification tested**

## 🚨 **Important Notes**

1. **Change Default Passwords**: Update admin and test account passwords
2. **Configure Email**: Set up proper SMTP for production
3. **Database Security**: Use strong MySQL credentials
4. **HTTPS**: Enable SSL for production deployment
5. **Backup**: Set up automated backups

## 🔗 **External Services Setup**

### **Email Service (Gmail Example):**
1. Enable 2-factor authentication
2. Generate app password
3. Update `.env` with app password

**Email Usage**: Only for user authentication (registration verification, password reset). No ride-related notifications.

---

## 🎉 **You're All Set!**

Your Student Transport Platform is now ready for development and testing!

**Frontend:** http://localhost:3000
**Backend:** http://localhost:5000

**Next Steps:**
1. Create test users and verify email functionality
2. Test the complete ride lifecycle
3. Customize the platform for your specific needs
4. Deploy to production when ready

**Happy coding!** 🚗✨🎓
