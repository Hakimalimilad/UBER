# 🔌 API Documentation

## 🌐 **Backend API Endpoints**

Complete documentation of all REST API endpoints in the Flask backend.

## 🔐 **Authentication Endpoints**

### **POST /api/auth/login**
User login with JWT token generation.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "user_type": "student",
    "is_verified": true,
    "is_approved": true
  }
}
```

### **POST /api/auth/register**
User registration with email verification.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "user_type": "student"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "user_id": 123
}
```

### **POST /api/auth/verify-email**
Verify email using token from email link.

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully. Awaiting admin approval."
}
```

## 👨‍💼 **Admin Endpoints**

### **GET /api/admin/all-drivers**
Get all drivers with performance statistics.

**Authentication:** Admin required

**Response:**
```json
{
  "drivers": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john.driver@university.edu",
      "license_number": "DL000001",
      "vehicle_type": "Sedan",
      "vehicle_model": "Toyota Camry",
      "vehicle_plate": "ABC001",
      "capacity": 4,
      "is_active": true,
      "is_verified": true,
      "rides_completed": 15,
      "rating": 4.2,
      "total_ratings": 12
    }
  ],
  "statistics": {
    "total_drivers": 3,
    "active_drivers": 1,
    "inactive_drivers": 2,
    "verified_drivers": 2
  }
}
```

### **POST /api/admin/activate-driver/{driver_id}**
Activate a driver account (admin approval).

**Authentication:** Admin required

**Response:**
```json
{
  "message": "Driver John Smith activated successfully!",
  "driver_id": 1
}
```

### **GET /api/admin/users**
Get all users for admin management.

**Authentication:** Admin required

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "full_name": "Alice Johnson",
      "email": "alice.student@university.edu",
      "user_type": "student",
      "is_verified": true,
      "is_approved": true,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 15
}
```

### **POST /api/admin/approve-user/{user_id}**
Approve a user for full system access.

**Authentication:** Admin required

**Response:**
```json
{
  "message": "User Alice Johnson approved successfully!",
  "email_sent": true
}
```

### **GET /api/admin/driver/{driver_id}/ratings**
Get all ratings and reviews for a specific driver.

**Authentication:** Admin required

**Response:**
```json
{
  "ratings": [
    {
      "id": 1,
      "student_name": "Bob Wilson",
      "student_email": "bob.student@university.edu",
      "rating": 5,
      "comment": "Excellent service, very professional!",
      "pickup_location": "Library",
      "dropoff_location": "Dormitory A",
      "ride_date": "2025-01-20",
      "created_at": "2025-01-20T15:30:00Z"
    }
  ],
  "stats": {
    "average_rating": 4.3,
    "total_ratings": 8
  }
}
```

## 🚗 **Ride Management Endpoints**

### **POST /api/student/request-ride**
Create a new ride request.

**Authentication:** Student required

**Request:**
```json
{
  "pickup_location": "Library",
  "dropoff_location": "Student Center",
  "pickup_time": "2025-01-25T14:30:00Z",
  "notes": "Please be on time"
}
```

**Response:**
```json
{
  "message": "Ride request sent successfully",
  "ride_id": 123,
  "drivers_notified": 5
}
```

### **GET /api/driver/available-rides**
Get available ride requests for drivers.

**Authentication:** Driver required

**Response:**
```json
{
  "rides": [
    {
      "id": 123,
      "student_name": "Alice Johnson",
      "pickup_location": "Library",
      "dropoff_location": "Student Center",
      "pickup_time": "2025-01-25T14:30:00Z",
      "notes": "Please be on time"
    }
  ]
}
```

### **POST /api/driver/accept-ride/{ride_id}**
Accept a ride request.

**Authentication:** Driver required

**Response:**
```json
{
  "message": "Ride accepted successfully"
}
```

### **GET /api/student/my-rides**
Get student's ride history.

**Authentication:** Student required

**Response:**
```json
{
  "rides": [
    {
      "id": 123,
      "driver_name": "John Smith",
      "driver_phone": "+1234567890",
      "pickup_location": "Library",
      "dropoff_location": "Student Center",
      "status": "in_progress",
      "pickup_time": "2025-01-25T14:30:00Z"
    }
  ]
}
```

### **GET /api/driver/my-rides**
Get driver's ride history.

**Authentication:** Driver required

**Response:**
```json
{
  "rides": [
    {
      "id": 123,
      "student_name": "Alice Johnson",
      "student_phone": "+1987654321",
      "student_email": "alice.student@university.edu",
      "pickup_location": "Library",
      "dropoff_location": "Student Center",
      "status": "completed",
      "pickup_time": "2025-01-25T14:30:00Z"
    }
  ]
}
```

### **PUT /api/ride/{ride_id}/status**
Update ride status.

**Authentication:** Driver/Student/Admin required

**Request:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "message": "Ride status updated successfully"
}
```

### **POST /api/ride/{ride_id}/rate**
Rate a completed ride.

**Authentication:** Student required

**Request:**
```json
{
  "rating": 5,
  "comment": "Excellent service, very professional driver!"
}
```

**Response:**
```json
{
  "message": "Rating submitted successfully",
  "rating_id": 456
}
```

## 👤 **Profile Management Endpoints**

### **GET /api/profile**
Get current user's profile.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "user_type": "driver",
  "phone": "+1234567890",
  "profile_picture": "https://example.com/profile.jpg",
  "is_verified": true,
  "is_approved": true,
  "student_id": null,
  "pickup_location": null,
  "dropoff_location": null,
  "license_number": "DL123456",
  "vehicle_type": "Sedan",
  "vehicle_model": "Toyota Camry",
  "vehicle_plate": "ABC123",
  "capacity": 4
}
```

### **PUT /api/profile**
Update user profile.

**Authentication:** Required

**Request:**
```json
{
  "full_name": "John Smith",
  "phone": "+1234567890",
  "pickup_location": "Library",
  "dropoff_location": "Dormitory A"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

## 📊 **Analytics Endpoints**

### **GET /api/admin/rides**
Get all rides for admin monitoring.

**Authentication:** Admin required

**Response:**
```json
{
  "rides": [
    {
      "id": 123,
      "student_name": "Alice Johnson",
      "student_phone": "+1987654321",
      "driver_name": "John Smith",
      "driver_phone": "+1234567890",
      "pickup_location": "Library",
      "dropoff_location": "Student Center",
      "status": "completed",
      "pickup_time": "2025-01-25T14:30:00Z",
      "created_at": "2025-01-25T10:15:00Z"
    }
  ]
}
```

## 🔧 **Utility Endpoints**

### **GET /api/health**
Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-25T10:30:00Z"
}
```

### **POST /api/auth/forgot-password**
Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent. Please check your inbox."
}
```

### **POST /api/auth/reset-password**
Reset password with token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## 🛡️ **Authentication**

All protected endpoints require JWT token in header:

```
Authorization: Bearer your_jwt_token_here
```

**Token Format:**
- **Header**: JWT header with algorithm
- **Payload**: User ID, email, role, expiration
- **Signature**: HMAC-SHA256 with secret key

## 🚨 **Error Responses**

### **401 Unauthorized**
```json
{
  "error": "Invalid or expired token"
}
```

### **403 Forbidden**
```json
{
  "error": "Access denied. Admin privileges required."
}
```

### **404 Not Found**
```json
{
  "error": "Resource not found"
}
```

### **400 Bad Request**
```json
{
  "error": "Invalid request data"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## 📝 **Response Codes**

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 🔄 **Rate Limiting**

- **Authentication endpoints**: 5 attempts per minute
- **Ride requests**: 10 requests per hour per user
- **Admin endpoints**: 100 requests per hour

## 📊 **API Features**

- **CORS Enabled**: Cross-origin requests supported
- **JSON Responses**: All responses in JSON format
- **Error Handling**: Comprehensive error messages
- **Authentication**: JWT token-based security
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Server-side validation
- **Database Security**: Parameterized queries

---

**The API is RESTful, secure, and designed for scalability with comprehensive error handling and authentication.** 🔐🚀

**Note**: Email system is used only for authentication (registration verification, password reset). No ride-related email notifications are implemented.
