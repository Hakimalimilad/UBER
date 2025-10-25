# 🚀 Quick Start Guide

## **5-Minute Setup**

### **1. Prerequisites**
- Node.js 18+ 
- Python 3.8+
- MySQL 8.0+
- Gmail account

### **2. Backend Setup**
```bash
cd Backend
pip install -r requirements.txt
python setup_database.py
python app.py
```

### **3. Frontend Setup**
```bash
cd Frontend
npm install
npm run dev
```

### **4. Environment Setup**
Create `Backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=university_transport
JWT_SECRET_KEY=your_secret_key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### **5. Access**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## **Test Users**

### **Admin Account**
- Email: `admin@university.edu`
- Password: `admin123`

### **Student Account**
- Register with any email
- Verify email
- Wait for admin approval

### **Driver Account**
- Register with any email
- Verify email
- Wait for admin approval

## **First Steps**

1. **Login as Admin**
2. **Approve registered users**
3. **Test ride request flow**
4. **Verify email notifications**

## **Troubleshooting**

### **Database Issues**
```bash
# Reset database
python Backend/setup_database.py
```

### **Email Issues**
- Check Gmail app password
- Verify SMTP settings
- Check firewall settings

### **Frontend Issues**
```bash
# Clear cache
npm run build
npm start
```

## **Production Deployment**

### **Backend**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Frontend**
```bash
npm run build
npm start
```

---

**Ready to go! 🎉**
