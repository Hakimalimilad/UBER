# Quick Reference Card

## 🚀 Common Commands

### Backend Commands

```bash
# Navigate to backend
cd Backend

# Activate virtual environment
venv\Scripts\activate              # Windows
source venv/bin/activate           # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create database tables
python models.py

# Seed admin and test accounts
python seed_admin.py

# Start development server
python app.py

# Deactivate virtual environment
deactivate
```

### Frontend Commands

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Commands

```sql
-- Create database
CREATE DATABASE student_transport;

-- Show databases
SHOW DATABASES;

-- Use database
USE student_transport;

-- Show tables
SHOW TABLES;

-- View users
SELECT * FROM users;

-- Count users by type
SELECT user_type, COUNT(*) FROM users GROUP BY user_type;

-- Delete all users (careful!)
DELETE FROM users;

-- Drop database (careful!)
DROP DATABASE student_transport;
```

---

## 🔐 Test Accounts

```
Admin:   admin@transport.com    / admin123
Student: student@test.com       / student123
Driver:  driver@test.com        / driver123
```

---

## 📡 API Testing (cURL)

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test User","user_type":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transport.com","password":"admin123"}'

# Get all users (replace TOKEN)
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer TOKEN"

# Update user role (replace TOKEN and USER_ID)
curl -X PUT http://localhost:5000/api/admin/users/2/role \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"driver"}'
```

---

## 🌐 URLs

```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
API Base:  http://localhost:5000/api
```

---

## 📁 Important Files

```
Backend/
  app.py              - Main Flask app
  models.py           - Database functions
  seed_admin.py       - Create test accounts
  .env                - Environment variables
  requirements.txt    - Python packages

Frontend/my-app/
  app/page.jsx        - Login page
  app/admin/page.jsx  - Admin dashboard
  app/student/page.jsx - Student dashboard
  app/driver/page.jsx - Driver dashboard
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MySQL is running
# Windows: services.msc → MySQL80
# Mac: brew services list

# Check .env file exists
ls .env

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't start
```bash
# Navigate to Frontend folder
cd Frontend

# Delete and reinstall
rm -rf node_modules .next
npm install

# Check if port 3000 is free
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Mac/Linux
```

### Database connection failed
```bash
# Check MySQL credentials in .env
# Test MySQL connection
mysql -u root -p
```

### CORS errors
```python
# In app.py, ensure CORS is enabled
CORS(app)  # Should be present
```

---

## 🔄 Reset Everything

```bash
# Backend
cd Backend
deactivate
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd Frontend
rm -rf node_modules .next
npm install

# Database
mysql -u root -p
DROP DATABASE student_transport;
CREATE DATABASE student_transport;
exit

# Recreate tables and seed data
python models.py
python seed_admin.py
```

---

## 📦 Git Commands

```bash
# Clone repository
git clone <repository-url>

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## 🔍 Debugging

### View Backend Logs
```bash
# In terminal where app.py is running
# Logs appear in real-time
```

### View Frontend Logs
```bash
# Browser console (F12)
# Or terminal where npm run dev is running
```

### Check Database
```sql
-- View all users
SELECT id, email, full_name, user_type, created_at FROM users;

-- Check for specific user
SELECT * FROM users WHERE email = 'admin@transport.com';

-- Count users
SELECT COUNT(*) FROM users;
```

---

## ⚡ Quick Setup (Fresh Install)

```bash
# 1. Database
mysql -u root -p
CREATE DATABASE student_transport;
exit

# 2. Backend
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your MySQL password
python models.py
python seed_admin.py
python app.py

# 3. Frontend (new terminal)
cd Frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📝 Environment Variables

### Backend (.env)
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=student_transport
FLASK_SECRET_KEY=your-secret-key
```

### Frontend (if needed)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🎯 Testing Workflow

1. **Start Backend:** `python app.py`
2. **Start Frontend:** `npm run dev`
3. **Open Browser:** `http://localhost:3000`
4. **Click Quick Login:** Admin/Student/Driver
5. **Test Features:** Navigate dashboards
6. **Check API:** Use cURL or Postman

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Port in use | Kill process or change port |
| Module not found | Activate venv, reinstall packages |
| Database error | Check .env, verify MySQL running |
| CORS error | Check backend CORS config |
| Login fails | Verify test accounts seeded |
| 404 on API | Check backend is running on 5000 |

---

## 🔗 Useful Links

- **Flask Docs:** https://flask.palletsprojects.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **MySQL Docs:** https://dev.mysql.com/doc/

---

**Keep this file handy for quick reference during development!**
