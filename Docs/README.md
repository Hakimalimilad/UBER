# Student Transportation Platform 🚗

**Uber-like College Transport Platform** connecting students and drivers with admin control.

## 🎯 Features

### MVP (Current Version)
- ✅ **Multi-role Authentication** - Student, Driver, Admin
- ✅ **Email Verification** - Professional HTML email templates
- ✅ **Password Reset** - Secure token-based reset via email
- ✅ **Role-based Dashboards** - Unique UI for each user type
- ✅ **Admin Panel** - Manage users and roles
- ✅ **Modern UI** - Built with Next.js & Tailwind CSS
- ✅ **Seeded Test Accounts** - Ready for immediate testing
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Modular Architecture** - Easy to extend

### Coming Soon
- 🔄 Real-time ride tracking
- 🔄 Vehicle management
- 🔄 Ride scheduling & booking
- 🔄 AI-based route optimization
- 🔄 Payment integration

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL 8.0+

### 1️⃣ Database Setup
```sql
CREATE DATABASE student_transport;
```

### 2️⃣ Backend Setup
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MySQL password

# Create tables
python models.py

# Seed admin and test accounts
python seed_admin.py

# Start server
python app.py
```

**Backend runs on:** `http://localhost:5000`

### 3️⃣ Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

---

## 🔐 Test Accounts

After running `seed_admin.py`, use these accounts:

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@transport.com    | admin123   |
| Student | student@test.com       | student123 |
| Driver  | driver@test.com        | driver123  |

---

## 📡 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register new user (sends verification email)
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Endpoints (Requires JWT)
- `GET /api/auth/me` - Get current user info

### Admin Endpoints (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role

---

## 🗂️ Project Structure

```
Uber/
├── Backend/
│   ├── app.py              # Flask application & routes
│   ├── models.py           # Database models & functions
│   ├── email_service.py    # Email verification service
│   ├── seed_admin.py       # Seed admin & test accounts
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── Frontend/
│   ├── app/
│   │   ├── page.jsx           # Login/Register page
│   │   ├── admin/page.jsx     # Admin dashboard
│   │   ├── student/page.jsx   # Student dashboard
│   │   └── driver/page.jsx    # Driver dashboard
│   ├── public/                # Static assets
│   ├── package.json           # Node dependencies
│   └── next.config.mjs        # Next.js configuration
│
└── Documentation/
    ├── EMAIL_SETUP_GUIDE.md   # Email verification setup
    ├── WHATS_NEW.md           # Latest features
    └── ... (other guides)
```

---

## 🎨 Dashboard Features

### Admin Dashboard
- View all users with stats
- Update user roles (student ↔ driver ↔ admin)
- User management interface
- Real-time statistics

### Student Dashboard
- Browse available rides
- Book rides (mock)
- View booking history
- Track spending

### Driver Dashboard
- Toggle availability status
- View scheduled rides
- Track earnings (daily/weekly/monthly)
- Vehicle information management

---

## 🔧 Development

### Adding New Tables
The database is designed for easy expansion. To add new tables:

1. Add table creation in `models.py`:
```python
def create_vehicles_table():
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT,
            model VARCHAR(255),
            FOREIGN KEY (driver_id) REFERENCES users(id)
        )
    ''')
```

2. Call it in `create_tables()` function

### Adding New Endpoints
Add routes in `app.py`:
```python
@app.route('/api/rides', methods=['GET'])
@token_required
def get_rides(current_user):
    # Your logic here
    pass
```

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"test123","full_name":"New User","user_type":"student"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transport.com","password":"admin123"}'
```

### Test Admin Endpoint
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Environment Variables

### Backend (.env)
```env
# Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=uberdb

# Flask
FLASK_SECRET_KEY=your-secret-key

# Email (Optional - for verification)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

**Note:** See `EMAIL_SETUP_GUIDE.md` for email setup instructions

---

## 🐛 Troubleshooting

### Backend Issues
- **MySQL connection failed**: Check credentials in `.env`
- **Module not found**: Activate venv and run `pip install -r requirements.txt`
- **Port 5000 in use**: Change port in `app.py`

### Frontend Issues
- **API connection failed**: Ensure backend is running on port 5000
- **Build errors**: Delete `node_modules` and `.next`, then `npm install`

---

## 🎓 For Classmates

This project is **fully reproducible**. Follow these steps:

1. Clone/copy the project folder
2. Install MySQL and create database
3. Follow "Quick Start" section above
4. Run `seed_admin.py` for test accounts
5. Open browser to `http://localhost:3000`
6. Use quick login buttons for testing

**Setup time: ~10 minutes**

---

## 🚧 Roadmap

### Phase 1 (Current - MVP) ✅
- Authentication system
- Role-based access
- Admin panel
- Mock dashboards

### Phase 2 (Next)
- Real ride booking system
- Vehicle management
- Database expansion (rides, vehicles tables)

### Phase 3 (Future)
- Real-time tracking
- Payment integration
- AI route optimization
- Mobile app

---

## 📄 License

Educational project for college transportation system.

---

**Built with ❤️ for campus transportation**
