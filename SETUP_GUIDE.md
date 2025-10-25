# 🔧 Setup Guide

## **Environment Configuration**

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=university_transport

# JWT Secret Key (generate a strong secret)
JWT_SECRET_KEY=your_jwt_secret_key_here

# Email Configuration (Gmail SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# Optional: Debug mode
FLASK_DEBUG=True
```

## **Database Setup**

### **1. Create MySQL Database**
```sql
CREATE DATABASE university_transport;
```

### **2. Run Setup Script**
```bash
cd Backend
python setup_database.py
```

## **Email Setup (Gmail)**

### **1. Enable 2-Factor Authentication**
- Go to Google Account settings
- Enable 2FA for your account

### **2. Generate App Password**
- Go to Google Account → Security
- Generate an "App Password" for this application
- Use this password in your `.env` file

### **3. Test Email Configuration**
```bash
cd Backend
python -c "from app import app; print('Email configured successfully!')"
```

## **Frontend Setup**

### **1. Install Dependencies**
```bash
cd Frontend
npm install
```

### **2. Start Development Server**
```bash
npm run dev
```

## **Production Deployment**

### **Backend (Production)**
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Frontend (Production)**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## **Troubleshooting**

### **Database Connection Issues**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### **Email Issues**
- Verify Gmail app password
- Check SMTP settings
- Test with simple email first

### **Frontend Issues**
- Clear browser cache
- Check console for errors
- Verify API endpoints

## **Security Checklist**

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Regular security updates

---

**Your platform is ready! 🎉**
