# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints

### Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "user_type": "student"  // Options: student, driver
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1
}
```

**Error Responses:**
- `400` - Email already registered
- `500` - Server error

---

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student",
    "phone": null,
    "created_at": "2024-10-14T12:00:00"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `500` - Server error

---

## Protected Endpoints

### Get Current User
**GET** `/auth/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_type": "student",
    "phone": null,
    "created_at": "2024-10-14T12:00:00"
  }
}
```

**Error Responses:**
- `401` - Token missing or invalid
- `404` - User not found

---

## Admin Endpoints

### Get All Users
**GET** `/admin/users`

Get a list of all registered users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@transport.com",
      "full_name": "System Administrator",
      "user_type": "admin",
      "phone": null,
      "created_at": "2024-10-14T12:00:00"
    },
    {
      "id": 2,
      "email": "student@test.com",
      "full_name": "Test Student",
      "user_type": "student",
      "phone": null,
      "created_at": "2024-10-14T12:05:00"
    }
  ],
  "total": 2
}
```

**Error Responses:**
- `401` - Token missing or invalid
- `403` - Admin access required
- `500` - Server error

---

### Update User Role
**PUT** `/admin/users/:user_id/role`

Update a user's role (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**URL Parameters:**
- `user_id` - The ID of the user to update

**Request Body:**
```json
{
  "user_type": "driver"  // Options: student, driver, admin
}
```

**Response (200):**
```json
{
  "message": "User role updated successfully"
}
```

**Error Responses:**
- `400` - Invalid user type or trying to change own admin role
- `401` - Token missing or invalid
- `403` - Admin access required
- `404` - User not found
- `500` - Server error

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## JWT Token Structure

The JWT token contains the following payload:

```json
{
  "user_id": 1,
  "user_type": "student",
  "exp": 1697299200  // Expiration timestamp (24 hours from issue)
}
```

**Token Expiration:** 24 hours

---

## Example Usage

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User","user_type":"student"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transport.com","password":"admin123"}'
```

**Get All Users (Admin):**
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Update User Role:**
```bash
curl -X PUT http://localhost:5000/api/admin/users/2/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_type":"driver"}'
```

### Using JavaScript (Fetch)

**Login:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@transport.com',
    password: 'admin123'
  })
});

const data = await response.json();
const token = data.token;
```

**Get All Users:**
```javascript
const response = await fetch('http://localhost:5000/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.users);
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This should be added in production.

---

## CORS

CORS is enabled for all origins in development. In production, configure specific allowed origins in `app.py`.

---

## Future Endpoints (Planned)

### Rides
- `GET /rides` - Get available rides
- `POST /rides` - Create a new ride (driver)
- `GET /rides/:id` - Get ride details
- `POST /rides/:id/book` - Book a ride (student)
- `PUT /rides/:id/complete` - Mark ride as complete (driver)

### Vehicles
- `GET /vehicles` - Get all vehicles
- `POST /vehicles` - Add a vehicle (driver)
- `PUT /vehicles/:id` - Update vehicle info
- `DELETE /vehicles/:id` - Remove vehicle

### Notifications
- `GET /notifications` - Get user notifications
- `POST /notifications/mark-read` - Mark notifications as read
