# 🚗 University Transportation System - Complete Documentation

## 📋 Project Overview

### Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Python Flask, JWT Authentication
- **Database:** MySQL
- **Email:** Flask-Mail (Gmail SMTP)

### User Roles
1. **Students** - Request rides
2. **Drivers** - Accept rides  
3. **Admin** - Approve users, manage system

---

## 🗄️ Complete Database Schema

```sql
CREATE TABLE users (
    -- Authentication
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'driver', 'admin') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    
    -- Basic Profile
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    profile_picture LONGTEXT,
    
    -- Student Fields
    student_id VARCHAR(50),
    major VARCHAR(100),
    year VARCHAR(10),
    campus_location VARCHAR(255),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    emergency_contact VARCHAR(50),
    
    -- Driver Fields
    license_number VARCHAR(50),
    vehicle_model VARCHAR(100),
    vehicle_plate VARCHAR(20),
    vehicle_color VARCHAR(50),
    capacity INT DEFAULT 4,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📁 Project Structure

```
Uber/
├── Backend/
│   ├── app.py              # Flask routes & logic
│   ├── models.py           # Database operations
│   └── .env                # Config (SECRET_KEY, DB, EMAIL)
│
└── Frontend/
    ├── app/
    │   ├── page.tsx        # Login
    │   ├── register/       # Registration
    │   ├── verify-email/   # Email verification
    │   ├── settings/       # Profile settings
    │   ├── admin/
    │   │   ├── page.tsx    # Dashboard
    │   │   ├── users.tsx   # User management
    │   │   └── view-user/[id]/  # View profile
    │   ├── student/request/     # Request ride
    │   └── driver/rides/        # Available rides
    │
    └── components/
        └── MainLayout.tsx  # Sidebar navigation
```

---

## 🔐 Authentication System

### Password Hashing
```python
# Backend: app.py
from werkzeug.security import generate_password_hash, check_password_hash

# Registration
password_hash = generate_password_hash(password)

# Login
if check_password_hash(user['password_hash'], password):
    # Valid password
```

### JWT Tokens
```python
# Backend: app.py
import jwt
from datetime import datetime, timedelta

def generate_token(user_id, user_type):
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
```

### Protected Routes
```python
# Backend: app.py
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('user_type') != 'admin':
            return jsonify({'error': 'Admin only'}), 403
        
        return f(payload, *args, **kwargs)
    return decorated
```

---

## 🔄 User Registration Flow

### 1. Registration
```typescript
// Frontend: app/register/page.tsx
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, password, full_name, user_type, phone })
});
```

```python
# Backend: app.py
@app.route('/api/auth/register', methods=['POST'])
def register():
    password_hash = generate_password_hash(data['password'])
    verification_token = secrets.token_urlsafe(32)
    
    user_id = create_user(
        email, password_hash, full_name, user_type,
        verification_token, is_verified=False, is_approved=False
    )
    
    send_verification_email(email, verification_token)
    return jsonify({'message': 'Check your email'}), 201
```

### 2. Email Verification
```python
# Backend: app.py
@app.route('/api/auth/verify-email/<token>', methods=['POST'])
def verify_email(token):
    user = get_user_by_verification_token(token)
    verify_user_email(user['id'])  # Sets is_verified = TRUE
    return jsonify({'message': 'Email verified!'}), 200
```

### 3. Admin Approval
```typescript
// Frontend: app/admin/users.tsx
const approveUser = async (userId) => {
  await fetch(`http://localhost:5000/api/admin/approve-user/${userId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};
```

```python
# Backend: app.py
@app.route('/api/admin/approve-user/<int:user_id>', methods=['POST'])
@admin_required
def approve_user(current_user, user_id):
    approve_user_account(user_id)  # Sets is_approved = TRUE
    send_welcome_email(user['email'], user['full_name'])
    return jsonify({'message': 'User approved!'}), 200
```

### 4. Login
```python
# Backend: app.py
@app.route('/api/auth/login', methods=['POST'])
def login():
    user = get_user_by_email(email)
    
    if not user['is_verified']:
        return jsonify({'error': 'Verify email first'}), 403
    
    if not user['is_approved']:
        return jsonify({'requires_approval': True}), 200
    
    token = generate_token(user['id'], user['user_type'])
    return jsonify({'token': token, 'user': user}), 200
```

---

## 🚀 Key Innovations

### 1. Two-Step Verification
```
Register → Email Verify → Admin Approve → Full Access
```

### 2. Base64 Profile Pictures
```typescript
// Frontend: Upload
const reader = new FileReader();
reader.onloadend = () => {
  const base64 = reader.result;  // data:image/png;base64,...
  setProfileData({ profilePicture: base64 });
};
reader.readAsDataURL(file);
```

Stored directly in database as LONGTEXT - no file storage needed!

### 3. Read-Only Admin View
```typescript
// app/admin/view-user/[id]/page.tsx
<div className="bg-gray-50 rounded-lg p-4">
  {userData.student_id || 'Not provided'}
</div>
```

Admin sees exact form user filled, but read-only.

### 4. Real-Time Search & Filter
```typescript
const filteredUsers = users.filter(user => {
  const matchesSearch = user.full_name.includes(searchQuery) || 
                       user.email.includes(searchQuery);
  const matchesFilter = filterType === 'all' || user.user_type === filterType;
  return matchesSearch && matchesFilter;
});
```

### 5. Dynamic Forms by Role
```typescript
{user.user_type === 'student' && (
  <div>
    <input name="student_id" />
    <input name="major" />
  </div>
)}

{user.user_type === 'driver' && (
  <div>
    <input name="license_number" />
    <input name="vehicle_model" />
  </div>
)}
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email/<token>` - Verify email
- `PUT /api/auth/update-profile` - Update profile (Token required)

### Admin (Admin token required)
- `GET /api/admin/pending-users` - Get pending approvals
- `GET /api/admin/user/<id>` - Get user details
- `POST /api/admin/approve-user/<id>` - Approve user

---

## 📊 Database States

| State | is_verified | is_approved | Can Login? |
|-------|-------------|-------------|------------|
| Registered | ❌ FALSE | ❌ FALSE | ❌ No |
| Email Verified | ✅ TRUE | ❌ FALSE | ⚠️ Limited |
| Approved | ✅ TRUE | ✅ TRUE | ✅ Yes |

---

## 🎨 Key Components

### Profile Picture Upload
```typescript
<input type="file" accept="image/*" onChange={handleImageUpload} />

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    setProfileData({ profilePicture: reader.result });
  };
  reader.readAsDataURL(file);
};
```

### User Type Badges
```typescript
<span className="inline-flex items-center px-3 py-1.5 rounded-full">
  {user.user_type === 'student' ? (
    <GraduationCap className="w-4 h-4 mr-1.5" />
  ) : (
    <Car className="w-4 h-4 mr-1.5" />
  )}
  {user.user_type}
</span>
```

---

## 🔒 Security Features

1. **Password Hashing** - bcrypt
2. **JWT Tokens** - 7-day expiry
3. **Role-Based Access** - Admin/Student/Driver
4. **Email Verification** - Required before approval
5. **Admin Approval** - Manual verification
6. **Token Validation** - On every protected route

---

## 📝 Environment Variables

```env
# Backend/.env
SECRET_KEY=your-secret-key
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=uberdb

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

**System Status:** ✅ Fully Functional
**Last Updated:** October 20, 2025
