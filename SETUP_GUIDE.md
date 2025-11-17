# 🛠️ Complete Setup Guide

## 📋 **Installation & Configuration**

This comprehensive guide covers setting up both the backend (Flask/Python) and frontend (Next.js/React) components of the University Transportation Platform.

## 🔍 **Prerequisites**

### **System Requirements**
- **Operating System**: Windows 10/11, macOS 12+, Linux Ubuntu 20.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 4GB free space (including dependencies)
- **Network**: Internet connection for package installation and email services

### **Software Requirements**
- **Python 3.8+** - Backend development and API server
- **Node.js 18+** - Frontend development and build tools
- **MySQL 8.0+** - Database server with InnoDB storage engine
- **Git** - Version control system
- **Text Editor/IDE** - VS Code, PyCharm, or similar

### **Optional Tools**
- **MySQL Workbench** - Database management GUI
- **Postman** - API testing tool
- **GitHub Desktop** - GUI for Git operations

## 📦 **Backend Setup (Flask)**

### **Step 1: Environment Setup**
```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Upgrade pip (recommended)
pip install --upgrade pip
```

### **Step 2: Install Dependencies**
```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list | grep -E "(flask|mysql|werkzeug|python-dotenv)"
```

**Expected Output:**
```
Flask                    3.0.0
mysql-connector-python   8.2.0
Werkzeug                 3.0.1
python-dotenv            1.0.0
```

### **Step 3: Database Configuration**

#### **Install MySQL**
```bash
# Windows (using Chocolatey)
choco install mysql

# macOS (using Homebrew)
brew install mysql

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install mysql-server
```

#### **Start MySQL Service**
```bash
# Windows
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

#### **Create Database and User**
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE uberedb;

-- Create dedicated user (recommended for production)
CREATE USER 'uber_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON uberedb.* TO 'uber_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **Step 4: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Required Environment Variables:**
```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=uberdb

# Flask Configuration
FLASK_SECRET_KEY=your_unique_secret_key_here_32_chars_min
FLASK_ENV=development

# Email Configuration (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Admin Account (auto-created on first run)
ADMIN_EMAIL=admin@university.edu
ADMIN_PASSWORD=admin123
ADMIN_NAME=System Administrator
```

#### **Email Setup (Gmail)**
1. **Enable 2-Factor Authentication**
   - Go to Google Account → Security
   - Enable 2FA for your account

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
   - Use this password in SMTP_PASSWORD

3. **Test Email Configuration**
```bash
# Backend directory
cd Backend

# Test email service
python -c "
from email_service import send_verification_email
try:
    send_verification_email('test@example.com', 'Test User', 'test_token')
    print('✅ Email service configured successfully!')
except Exception as e:
    print(f'❌ Email error: {e}')
"
```

### **Step 5: Database Initialization**
```bash
# Backend directory
cd Backend

# Initialize database tables
python -c "
from models import create_tables
print('🚀 Creating database tables...')
create_tables()
print('✅ Database ready!')
"

# Or run the main app (tables created automatically)
python app.py
```

### **Step 6: Start Backend Server**
```bash
# Development mode
python app.py

# Or with environment variables
FLASK_ENV=development python app.py
```

**Backend will run on:** http://localhost:5000

**Verify Backend:**
```bash
# Test API health
curl http://localhost:5000/api/health

# Expected response
{"status":"healthy","database":"connected","timestamp":"2025-01-25T10:30:00Z"}
```

## 🌐 **Frontend Setup (Next.js)**

### **Step 1: Install Node.js**
```bash
# Download from https://nodejs.org/
# Verify installation
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### **Step 2: Navigate and Install**
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0 | grep -E "(next|react|tailwind)"
```

### **Step 3: Environment Configuration**
```bash
# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Verify file creation
cat .env.local
```

### **Step 4: Start Development Server**
```bash
# Development mode with Turbopack (fast)
npm run dev

# Or standard development
npm run dev:legacy
```

**Frontend will run on:** http://localhost:3000

### **Step 5: Verify Frontend**
1. Open http://localhost:3000
2. Check browser console for errors
3. Verify API connection in Network tab
4. Test responsive design on different screen sizes

## 🗄️ **Database Setup & Testing**

### **Step 1: Verify Database Connection**
```bash
# Backend directory
cd Backend

# Test database connection
python -c "
from models import get_db_connection
try:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT VERSION()')
    version = cursor.fetchone()
    print(f'✅ MySQL Connected: {version[0]}')
    cursor.close()
    conn.close()
except Exception as e:
    print(f'❌ Database Error: {e}')
"
```

### **Step 2: Create Test Data**
```bash
# Backend directory
cd Backend

# Create test users
python -c "
from models import create_user
import os

print('🚀 Creating test users...')

# Create admin user
admin_id = create_user('admin@university.edu', 'admin123', 'System Administrator', 'admin')
print(f'✅ Admin created: ID {admin_id}')

# Create test drivers
driver1_id = create_user('john.driver@university.edu', 'driver123', 'John Smith', 'driver')
driver2_id = create_user('sarah.wilson@university.edu', 'driver123', 'Sarah Wilson', 'driver')
print(f'✅ Drivers created: IDs {driver1_id}, {driver2_id}')

# Create test students
student1_id = create_user('alice.student@university.edu', 'student123', 'Alice Johnson', 'student')
student2_id = create_user('bob.brown@university.edu', 'student123', 'Bob Brown', 'student')
print(f'✅ Students created: IDs {student1_id}, {student2_id}')

print('🎯 Test users ready for login!')
"
```

### **Step 3: Verify Database Tables**
```sql
-- Connect to database
mysql -u root -p uberedb

-- Check tables
SHOW TABLES;

-- Check users
SELECT id, email, user_type, is_verified, is_approved FROM users;

-- Check rides (should be empty initially)
SELECT COUNT(*) as ride_count FROM rides;

-- Exit
EXIT;
```

## 🚀 **Complete System Startup**

### **Terminal Setup**
```bash
# Terminal 1 - Backend Server
cd Backend
source venv/bin/activate  # or venv\Scripts\activate
python app.py

# Terminal 2 - Frontend Server
cd Frontend
npm run dev
```

### **Access Points**
- **Frontend (Main App)**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health
- **Database Admin**: MySQL Workbench or phpMyAdmin

## 🧪 **System Testing**

### **Phase 1: Authentication Testing**
1. **Visit Frontend**: http://localhost:3000
2. **Register New User**: Test student registration
3. **Check Email**: Verify email verification works
4. **Login as Admin**: Use admin@university.edu / admin123
5. **Approve User**: Check admin panel for pending approvals

### **Phase 2: Ride Management Testing**
1. **Login as Student**: alice.student@university.edu / student123
2. **Request Ride**: Fill out ride request form
3. **Login as Driver**: john.driver@university.edu / driver123
4. **Accept Ride**: Check available rides and accept one
5. **Update Status**: Change ride status through completion

### **Phase 3: Rating System Testing**
1. **Complete Ride**: Mark ride as completed
2. **Rate Driver**: Login as student and submit rating
3. **Check Reviews**: Login as admin and view driver ratings

### **Phase 4: Admin Panel Testing**
1. **User Management**: View all users and their status
2. **Driver Analytics**: Check driver performance metrics
3. **Ride Monitoring**: View all rides and their status
4. **System Health**: Monitor platform statistics

## 🐛 **Troubleshooting Guide**

### **Database Issues**

#### **Connection Problems**
```bash
# Check MySQL service status
# Windows
services.msc  # Look for MySQL service

# macOS
brew services list

# Linux
sudo systemctl status mysql

# Restart if needed
sudo systemctl restart mysql
```

#### **Permission Issues**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON uberedb.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Or for specific user
GRANT ALL PRIVILEGES ON uberedb.* TO 'uber_user'@'localhost';
FLUSH PRIVILEGES;
```

#### **Port Conflicts**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Or use different port
FLASK_PORT=5001 python app.py
```

### **Email Issues**

#### **Gmail Setup Problems**
```bash
# Test email configuration
python -c "
import os
from email_service import send_verification_email

# Test email
try:
    send_verification_email(
        'your_email@gmail.com',
        'Test User',
        'test_verification_token_123'
    )
    print('✅ Email sent successfully!')
except Exception as e:
    print(f'❌ Email failed: {e}')
    print('Check SMTP settings in .env file')
"
```

#### **Common Email Fixes**
1. **Enable 2FA** on Gmail account
2. **Generate App Password** (not regular password)
3. **Check Spam Folder** for test emails
4. **Verify SMTP settings** in .env file

### **Frontend Issues**

#### **Development Server Problems**
```bash
# Clear Next.js cache
cd Frontend
rm -rf .next
npm run dev

# Check for port conflicts
netstat -ano | findstr :3000

# Reinstall dependencies if needed
rm -rf node_modules package-lock.json
npm install
```

#### **API Connection Issues**
```bash
# Test backend connection
curl http://localhost:5000/api/health

# Check browser console
# Open Developer Tools (F12) → Console tab
# Look for API errors
```

#### **Build Issues**
```bash
# Clear all caches
cd Frontend
rm -rf .next node_modules
npm install
npm run build
```

## 🔧 **Advanced Configuration**

### **Production Environment Variables**
```env
# Production Database
MYSQL_HOST=prod-db-server.example.com
MYSQL_USER=uber_prod_user
MYSQL_PASSWORD=strong_production_password
MYSQL_DATABASE=uberdb_prod

# Production Flask
FLASK_ENV=production
JWT_SECRET_KEY=your_production_jwt_secret_64_chars
DEBUG=False

# Production Email
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key

# Security
CORS_ORIGINS=https://yourdomain.com
```

### **SSL Configuration**
```bash
# Install SSL certificates
pip install pyopenssl

# Configure Flask for HTTPS
# Update app.py with SSL context
```

### **Performance Optimization**
```bash
# Backend optimization
pip install gunicorn eventlet

# Run with multiple workers
gunicorn -w 4 -k eventlet app:app

# Frontend optimization
npm run build
npm run start  # Production mode
```

## 📊 **Monitoring & Analytics**

### **Application Monitoring**
```bash
# Backend logging
tail -f Backend/app.log

# Database monitoring
mysql -u root -p uberedb -e "SHOW PROCESSLIST;"

# System resources
# Windows: Task Manager
# macOS/Linux: htop or top
```

### **API Testing**
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"admin123"}'

# Test health endpoint
curl http://localhost:5000/api/health
```

## 🔄 **Backup & Recovery**

### **Database Backup**
```bash
# Daily backup script
mysqldump -u root -p uberedb > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (Linux cron)
crontab -e
# Add: 0 2 * * * mysqldump -u root -p'password' uberedb > /backup/uber_$(date +%Y%m%d).sql
```

### **File Backup**
```bash
# Complete project backup
tar -czf uber_platform_$(date +%Y%m%d).tar.gz Backend/ Frontend/

# Restore backup
tar -xzf uber_platform_backup.tar.gz
```

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] **Database backup** completed
- [ ] **Environment variables** configured for production
- [ ] **Email service** tested in production
- [ ] **SSL certificates** installed
- [ ] **Firewall rules** configured
- [ ] **Domain DNS** pointing to server

### **Backend Deployment**
- [ ] **Dependencies installed** in production environment
- [ ] **Database migrated** to production schema
- [ ] **Environment variables** set correctly
- [ ] **Gunicorn** or similar WSGI server configured
- [ ] **Process manager** (systemd, supervisor) set up

### **Frontend Deployment**
- [ ] **Production build** created successfully
- [ ] **Environment variables** configured
- [ ] **CDN** configured for static assets
- [ ] **SSL** enabled for HTTPS
- [ ] **Monitoring** set up for errors

### **Post-Deployment**
- [ ] **All services running** without errors
- [ ] **Database connections** working
- [ ] **Email notifications** functioning
- [ ] **API endpoints** responding correctly
- [ ] **Frontend loading** without errors

## 📞 **Support & Help**

### **Common Issues & Solutions**
- **Database Connection**: Verify MySQL credentials and service status
- **Email Not Sending**: Check SMTP settings and app passwords
- **Frontend Not Loading**: Clear Next.js cache and check console
- **Authentication Failed**: Verify JWT secret and user credentials

### **Getting Help**
1. **Check Logs**: Review backend and frontend console logs
2. **Test APIs**: Use Postman or curl to test endpoints
3. **Verify Database**: Check MySQL error logs and connections
4. **Community**: Search GitHub issues for similar problems

## 🎯 **Quick Reference**

### **Important Commands**
```bash
# Backend
cd Backend
source venv/bin/activate
python app.py

# Frontend
cd Frontend
npm run dev

# Database
mysql -u root -p uberedb
```

### **Key URLs**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: localhost:3306

### **Test Accounts**
- **Admin**: admin@university.edu / admin123
- **Driver**: john.driver@university.edu / driver123
- **Student**: alice.student@university.edu / student123

---

## 🎉 **You're All Set!**

Your University Transportation Platform is now fully configured and ready for development and testing!

**Next Steps:**
1. **Test User Registration** - Verify email verification works
2. **Test Ride Flow** - Complete end-to-end ride testing
3. **Customize Platform** - Adapt for your specific university needs
4. **Deploy to Production** - When ready for live use

**Ready to go** 🚗✨🎓
