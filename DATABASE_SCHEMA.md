# 📊 Database Schema Documentation

## 🗄️ **Database Overview**

The Student Transport Platform uses **MySQL** with a well-structured schema designed for scalability and performance. The database supports multi-tenant operations with role-based access control.

## 🏗️ **Core Tables**

### **1. Users Table**

**Purpose**: Stores all user accounts (students, drivers, admins) with authentication and profile data.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'driver', 'admin') NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Student specific fields
    student_id VARCHAR(50),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(50),
    emergency_contact VARCHAR(50),

    -- Driver specific fields
    license_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    vehicle_model VARCHAR(100),
    vehicle_plate VARCHAR(20),
    capacity INT DEFAULT 4,

    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token),
    INDEX idx_approval_status (is_approved, is_verified)
)
```

**Key Features:**
- **Email Verification**: `verification_token` for email confirmation
- **Approval Workflow**: `is_verified` and `is_approved` for admin control
- **Role-Based Fields**: Different fields for students vs drivers
- **Security**: Passwords hashed with Werkzeug security

### **2. Rides Table**

**Purpose**: Manages ride requests, assignments, and status tracking.

```sql
CREATE TABLE rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    driver_id INT NULL,  -- NULL until accepted
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_time DATETIME NOT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_driver (driver_id),
    INDEX idx_status (status),
    INDEX idx_pickup_time (pickup_time)
)
```

**Status Flow:**
```
pending → accepted → in_progress → completed
    ↓
cancelled (any time)
```

### **3. Ratings Table**

**Purpose**: Stores student ratings and feedback for drivers.

```sql
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    student_id INT NOT NULL,
    driver_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ride_rating (ride_id),
    INDEX idx_driver_rating (driver_id),
    INDEX idx_student_rating (student_id)
)
```

**Features:**
- **1-5 Star Rating**: Constrained integer field
- **Written Feedback**: Optional comment field
- **One Rating Per Ride**: Unique constraint prevents duplicate ratings
- **Automatic Cleanup**: CASCADE delete when ride is deleted

### **4. Ride Passengers Table**

**Purpose**: Supports multi-passenger rides (students joining existing rides).

```sql
CREATE TABLE ride_passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ride_passenger (ride_id, student_id),
    INDEX idx_ride (ride_id),
    INDEX idx_student (student_id)
)
```

## 🔗 **Table Relationships**

```
users (1) ──── (N) rides (as student)
users (1) ──── (N) rides (as driver)
rides (1) ──── (1) ratings
rides (1) ──── (N) ride_passengers
```

## 📊 **Key Indexes**

- **Email Lookups**: Fast user authentication
- **Status Queries**: Efficient ride filtering
- **Verification Tokens**: Quick email verification
- **Time-Based Queries**: Pickup time sorting and filtering

## 🔐 **Security Features**

- **Password Hashing**: Werkzeug security for password storage
- **Token-Based Auth**: JWT tokens for API authentication
- **SQL Injection Protection**: Parameterized queries throughout
- **CORS Protection**: Configured for frontend-backend communication

## 🚀 **Performance Optimizations**

- **Connection Pooling**: MySQL connection pool for better performance
- **Strategic Indexes**: Optimized for common query patterns
- **Foreign Key Constraints**: Data integrity maintenance
- **Efficient Joins**: Optimized queries for related data

## 📈 **Scalability Considerations**

- **ENUM Fields**: Efficient status storage
- **Indexed Queries**: Fast lookups on frequently accessed fields
- **Normalized Design**: Reduces data redundancy
- **Connection Pooling**: Handles multiple concurrent users

## 🔧 **Database Setup**

```bash
# Create database
CREATE DATABASE uberedb;

# Run the application - tables are created automatically
python app.py
```

**The database is designed for high performance, security, and scalability while maintaining data integrity through proper relationships and constraints.**
