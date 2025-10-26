"""
Minimal Database Setup - Essential functions only
"""

import mysql.connector
from mysql.connector import pooling
import os
import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

_connection_pool = None


def get_db_connection():
    """Get database connection from pool."""
    global _connection_pool
    
    if _connection_pool is None:
        _connection_pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="transport_pool",
            pool_size=5,
            host=os.getenv('MYSQL_HOST', 'localhost'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE', 'uberdb')
        )
    
    return _connection_pool.get_connection()


def create_tables():
    """Create users and rides tables """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table with email verification and approval system
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
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
            INDEX idx_reset_token (reset_token),
            INDEX idx_approval_status (is_approved, is_verified)
        )
    ''')

    # Rides table for ride requests and assignments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rides (
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
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Users and rides tables created!")
    


# ============================================
# USER FUNCTIONS - For authentication
# ============================================

def create_user(email, password, full_name, user_type):
    """Create a new user."""
    conn = get_db_connection()
    cursor = conn.cursor()

    password_hash = generate_password_hash(password)

    cursor.execute(
        'INSERT INTO users (email, password_hash, full_name, user_type, is_verified, is_approved) VALUES (%s, %s, %s, %s, %s, %s)',
        (email, password_hash, full_name, user_type, False, False)  # New users start unverified and unapproved
    )

    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return user_id


def get_user_by_id(user_id):
    """Get user by ID."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return user


def get_user_by_email(email):
    """Get user by email."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return user




def verify_password(stored_hash, password):
    """Verify password."""
    return check_password_hash(stored_hash, password)


def generate_verification_token():
    """Generate a secure random token for email verification."""
    return secrets.token_urlsafe(32)


def save_verification_token(user_id, token):
    """Save verification token for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE users SET verification_token = %s WHERE id = %s',
        (token, user_id)
    )
    
    conn.commit()
    cursor.close()
    conn.close()


def verify_email_token(token):
    """Verify email using token and mark user as verified but pending approval."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        'SELECT * FROM users WHERE verification_token = %s',
        (token,)
    )
    user = cursor.fetchone()

    if user:
        cursor.execute(
            'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = %s',
            (user['id'],)
        )
        conn.commit()

    cursor.close()
    conn.close()

    return user is not None


def approve_user(user_id):
    """Approve a user for full system access."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        'UPDATE users SET is_approved = TRUE WHERE id = %s',
        (user_id,)
    )

    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()

    return affected > 0


def get_pending_users():
    """Get all users who are verified but not yet approved."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        'SELECT id, full_name, email, user_type, created_at FROM users WHERE is_verified = TRUE AND is_approved = FALSE ORDER BY created_at ASC'
    )
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return users


def get_user_approval_status(user_id):
    """Get user's approval status."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        'SELECT is_verified, is_approved FROM users WHERE id = %s',
        (user_id,)
    )
    status = cursor.fetchone()

    cursor.close()
    conn.close()

    return status


def save_reset_token(email, token):
    """Save password reset token with 1 hour expiry."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    expiry = datetime.now() + timedelta(hours=1)
    
    cursor.execute(
        'UPDATE users SET reset_token = %s, reset_token_expiry = %s WHERE email = %s',
        (token, expiry, email)
    )
    
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    
    return affected > 0


def verify_reset_token(token):
    """Verify password reset token and check if not expired."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute(
        'SELECT * FROM users WHERE reset_token = %s AND reset_token_expiry > NOW()',
        (token,)
    )
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return user


def reset_password(token, new_password):
    """Reset password using valid token."""
    user = verify_reset_token(token)
    
    if not user:
        return False
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = generate_password_hash(new_password)
    
    cursor.execute(
        'UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expiry = NULL WHERE id = %s',
        (password_hash, user['id'])
    )
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return True


def get_all_users():
    """Get all users (for admin)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('SELECT * FROM users ORDER BY created_at DESC')
    users = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return users


def mark_user_verified(user_id):
    """Mark a user as verified."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE users SET is_verified = TRUE WHERE id = %s',
        (user_id,)
    )
    
    conn.commit()
    cursor.close()
    conn.close()


def update_user_role(user_id, new_role):
    """Update user role."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE users SET user_type = %s WHERE id = %s',
        (new_role, user_id)
    )
    
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    
    return affected > 0


def update_user_profile(user_id, full_name, email, phone, profile_picture=None, student_id=None, major=None, year=None, campus_location=None, pickup_location=None, dropoff_location=None, parent_name=None, parent_phone=None, emergency_contact=None, license_number=None, vehicle_type=None, vehicle_model=None, vehicle_plate=None, vehicle_color=None, capacity=None):
    """Update user profile with all possible fields including profile picture."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Build dynamic update query based on user type and provided fields
    update_fields = []
    values = []

    # Basic fields
    if full_name is not None:
        update_fields.append('full_name = %s')
        values.append(full_name)

    if email is not None:
        update_fields.append('email = %s')
        values.append(email)

    if phone is not None:
        update_fields.append('phone = %s')
        values.append(phone)
    
    if profile_picture is not None:
        update_fields.append('profile_picture = %s')
        values.append(profile_picture)

    # Student specific fields
    if student_id is not None:
        update_fields.append('student_id = %s')
        values.append(student_id)
    
    if major is not None:
        update_fields.append('major = %s')
        values.append(major)
    
    if year is not None:
        update_fields.append('year = %s')
        values.append(year)
    
    if campus_location is not None:
        update_fields.append('campus_location = %s')
        values.append(campus_location)

    if pickup_location is not None:
        update_fields.append('pickup_location = %s')
        values.append(pickup_location)

    if dropoff_location is not None:
        update_fields.append('dropoff_location = %s')
        values.append(dropoff_location)

    if parent_name is not None:
        update_fields.append('parent_name = %s')
        values.append(parent_name)

    if parent_phone is not None:
        update_fields.append('parent_phone = %s')
        values.append(parent_phone)

    if emergency_contact is not None:
        update_fields.append('emergency_contact = %s')
        values.append(emergency_contact)

    # Driver specific fields
    if license_number is not None:
        update_fields.append('license_number = %s')
        values.append(license_number)

    if vehicle_type is not None:
        update_fields.append('vehicle_type = %s')
        values.append(vehicle_type)

    if vehicle_model is not None:
        update_fields.append('vehicle_model = %s')
        values.append(vehicle_model)

    if vehicle_plate is not None:
        update_fields.append('vehicle_plate = %s')
        values.append(vehicle_plate)
    
    if vehicle_color is not None:
        update_fields.append('vehicle_color = %s')
        values.append(vehicle_color)

    if capacity is not None:
        update_fields.append('capacity = %s')
        values.append(capacity)

    # Add user_id to values
    values.append(user_id)

    if update_fields:
        query = f'UPDATE users SET {", ".join(update_fields)} WHERE id = %s'
        cursor.execute(query, values)

        conn.commit()
        affected = cursor.rowcount
        cursor.close()
        conn.close()

        return affected > 0

    cursor.close()
    conn.close()
    return False


# ============================================
# RIDE FUNCTIONS - For ride management
# ============================================

def create_ride(student_id, pickup_location, dropoff_location, pickup_time, notes=None):
    """Create a new ride request."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO rides (student_id, pickup_location, dropoff_location, pickup_time, notes, status)
        VALUES (%s, %s, %s, %s, %s, 'pending')
    ''', (student_id, pickup_location, dropoff_location, pickup_time, notes))
    
    conn.commit()
    ride_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return ride_id


def get_available_drivers():
    """Get all approved drivers."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT id, full_name, email, phone, vehicle_type, vehicle_model, vehicle_plate, capacity
        FROM users 
        WHERE user_type = 'driver' AND is_verified = TRUE AND is_approved = TRUE
    ''')
    
    drivers = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return drivers


def accept_ride(ride_id, driver_id):
    """Accept a ride by assigning it to a driver."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE rides 
        SET driver_id = %s, status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND status = 'pending'
    ''', (driver_id, ride_id))
    
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    
    return affected > 0


def get_student_rides(student_id):
    """Get all rides for a specific student."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as driver_name, u.phone as driver_phone
        FROM rides r
        LEFT JOIN users u ON r.driver_id = u.id
        WHERE r.student_id = %s
        ORDER BY r.created_at DESC
    ''', (student_id,))
    
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides


def get_driver_rides(driver_id):
    """Get all rides for a specific driver."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as student_name, u.phone as student_phone
        FROM rides r
        LEFT JOIN users u ON r.student_id = u.id
        WHERE r.driver_id = %s
        ORDER BY r.created_at DESC
    ''', (driver_id,))
    
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides


def update_ride_status(ride_id, status):
    """Update the status of a ride."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE rides 
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    ''', (status, ride_id))
    
    conn.commit()
    affected = cursor.rowcount
    cursor.close()
    conn.close()
    
    return affected > 0


def get_pending_rides():
    """Get all pending rides for drivers to see."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as student_name, u.phone as student_phone
        FROM rides r
        JOIN users u ON r.student_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at ASC
    ''')
    
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides


def get_ride_by_id(ride_id):
    """Get a specific ride by ID."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, 
               u1.full_name as student_name, u1.phone as student_phone,
               u2.full_name as driver_name, u2.phone as driver_phone
        FROM rides r
        LEFT JOIN users u1 ON r.student_id = u1.id
        LEFT JOIN users u2 ON r.driver_id = u2.id
        WHERE r.id = %s
    ''', (ride_id,))
    
    ride = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return ride


def get_all_rides():
    """Get all rides (for admin)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, 
               u1.full_name as student_name, u1.phone as student_phone,
               u2.full_name as driver_name, u2.phone as driver_phone
        FROM rides r
        LEFT JOIN users u1 ON r.student_id = u1.id
        LEFT JOIN users u2 ON r.driver_id = u2.id
        ORDER BY r.created_at DESC
    ''')
    
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides


if __name__ == '__main__':
    """ this to create tables."""
    print("🚀 Creating database tables...")
    try:
        create_tables()
        print("✅ Database ready!")
    except Exception as e:
        print(f"❌ Error: {e}")
