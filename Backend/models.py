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

    # Ratings table for driver ratings by students
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ratings (
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
    ''')

    # Ride passengers table for multi-passenger rides
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ride_passengers (
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
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Users, rides, ratings, and ride_passengers tables created!")
    


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
    """Approve a user (student or driver) by marking them as approved."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # First check if user exists and is verified
        cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return {'success': False, 'message': 'User not found'}
            
        if not user.get('is_verified'):
            return {'success': False, 'message': 'User email is not verified'}
            
        # Update user approval status
        cursor.execute(
            'UPDATE users SET is_approved = TRUE WHERE id = %s',
            (user_id,)
        )
        conn.commit()
        
        return {
            'success': True, 
            'message': f"User {user_id} approved successfully",
            'user_id': user_id,
            'email': user.get('email'),
            'user_type': user.get('user_type')
        }
    except Exception as e:
        print(f"Error approving user: {e}")
        return {'success': False, 'message': str(e)}
    finally:
        cursor.close()
        conn.close()


def activate_driver(driver_id):
    """Deprecated: Use approve_user() instead."""
    return approve_user(driver_id)


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


def delete_user(user_id):
    """
    Permanently delete a user from the database.
    Returns True if successful, False otherwise.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # First, check if the user exists
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return {'success': False, 'message': 'User not found'}
            
        # Delete the user (foreign key constraints will handle related records)
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
        
        return {
            'success': True,
            'message': f'User {user_id} deleted successfully',
            'user_id': user_id
        }
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting user: {e}")
        return {
            'success': False,
            'message': f'Error deleting user: {str(e)}',
            'user_id': user_id
        }
    finally:
        cursor.close()
        conn.close()


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
        SELECT r.*, u.full_name as student_name, u.phone as student_phone, u.email as student_email
        FROM rides r
        LEFT JOIN users u ON r.student_id = u.id
        WHERE r.driver_id = %s
        ORDER BY r.created_at DESC
    ''', (driver_id,))
    
    rides = cursor.fetchall()
    
    # Add passenger information for each ride
    for ride in rides:
        passengers = get_ride_passengers(ride['id'])
        # Always include the primary student as first passenger
        primary_passenger = {
            'student_name': ride['student_name'],
            'student_phone': ride['student_phone'],
            'student_email': ride['student_email'],
            'student_id': ride['student_id']
        }
        ride['passengers'] = [primary_passenger] + passengers
    
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
        SELECT r.*, u.full_name as student_name, u.phone as student_phone, u.email as student_email
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
               u1.full_name as student_name, u1.phone as student_phone, u1.email as student_email,
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


# ============================================
# RATING FUNCTIONS - For rating system
# ============================================

def create_rating(ride_id, student_id, driver_id, rating, comment=None):
    """Create a rating for a completed ride."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO ratings (ride_id, student_id, driver_id, rating, comment)
        VALUES (%s, %s, %s, %s, %s)
    ''', (ride_id, student_id, driver_id, rating, comment))
    
    conn.commit()
    rating_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return rating_id


def get_driver_ratings(driver_id):
    """Get all ratings for a specific driver."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as student_name, u.email as student_email, ride.pickup_location, ride.dropoff_location, ride.created_at as ride_date
        FROM ratings r
        JOIN users u ON r.student_id = u.id
        JOIN rides ride ON r.ride_id = ride.id
        WHERE r.driver_id = %s
        ORDER BY r.created_at DESC
    ''', (driver_id,))
    
    ratings = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return ratings


def get_driver_average_rating(driver_id):
    """Get average rating for a driver."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings
        FROM ratings 
        WHERE driver_id = %s
    ''', (driver_id,))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if result and result[0]:
        return {
            'average_rating': round(float(result[0]), 1),
            'total_ratings': result[1]
        }
    return {
        'average_rating': 0,
        'total_ratings': 0
    }


def get_student_ratings_given(student_id):
    """Get all ratings given by a student."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as driver_name, ride.pickup_location, ride.dropoff_location
        FROM ratings r
        JOIN users u ON r.driver_id = u.id
        JOIN rides ride ON r.ride_id = ride.id
        WHERE r.student_id = %s
        ORDER BY r.created_at DESC
    ''', (student_id,))
    
    ratings = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return ratings


def get_student_average_rating_given(student_id):
    """Get average rating given by a student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings
        FROM ratings 
        WHERE student_id = %s
    ''', (student_id,))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if result and result[0]:
        return {
            'average_rating': round(float(result[0]), 1),
            'total_ratings': result[1]
        }
    return {
        'average_rating': 0,
        'total_ratings': 0
    }


def get_ride_rating(ride_id):
    """Get rating for a specific ride."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT * FROM ratings WHERE ride_id = %s
    ''', (ride_id,))
    
    rating = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return rating


def can_rate_ride(ride_id, student_id):
    """Check if a student can rate a ride (ride must be completed and not already rated)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.id, r.status, r.student_id, rt.id as rating_id
        FROM rides r
        LEFT JOIN ratings rt ON r.id = rt.ride_id
        WHERE r.id = %s AND r.student_id = %s
    ''', (ride_id, student_id))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not result:
        return False
    
    # Can rate if ride is completed and not already rated
    return result['status'] == 'completed' and result['rating_id'] is None


def get_ride_passengers(ride_id):
    """Get all passengers for a specific ride."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT rp.*, u.full_name as student_name, u.phone as student_phone, u.email as student_email
        FROM ride_passengers rp
        JOIN users u ON rp.student_id = u.id
        WHERE rp.ride_id = %s AND rp.status != 'cancelled'
        ORDER BY rp.created_at ASC
    ''', (ride_id,))
    
    passengers = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return passengers


def add_passenger_to_ride(ride_id, student_id):
    """Add a passenger to an existing ride."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO ride_passengers (ride_id, student_id, status)
        VALUES (%s, %s, 'pending')
        ON DUPLICATE KEY UPDATE status = 'pending'
    ''', (ride_id, student_id))
    
    conn.commit()
    passenger_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return passenger_id


def get_available_drivers_with_stats():
    """Get all available drivers with their stats."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT u.id, u.full_name, u.phone, u.email, u.vehicle_type, 
               u.vehicle_model, u.vehicle_plate, u.capacity,
               (SELECT COUNT(*) FROM rides WHERE driver_id = u.id AND status = 'completed') as total_rides,
               (SELECT AVG(rating) FROM ratings WHERE driver_id = u.id) as avg_rating,
               (SELECT COUNT(*) FROM ratings WHERE driver_id = u.id) as total_ratings
        FROM users u
        WHERE u.user_type = 'driver' 
        AND u.is_verified = TRUE 
        AND u.is_approved = TRUE
        ORDER BY avg_rating DESC, total_rides DESC
    ''')
    
    drivers = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return drivers


if __name__ == '__main__':
    """ this to create tables."""
    print("🚀 Creating database tables...")
    try:
        create_tables()
        print("✅ Database ready!")
    except Exception as e:
        print(f"❌ Error: {e}")
