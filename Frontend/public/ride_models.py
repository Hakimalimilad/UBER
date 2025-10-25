"""
Ride Management Database Models
"""

import mysql.connector
from mysql.connector import pooling
import os
from datetime import datetime, timedelta
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

def create_ride_tables():
    """Create tables for ride management."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Rides table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            driver_id INT,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_time DATETIME NOT NULL,
            estimated_duration INT DEFAULT 30, -- minutes
            status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
            fare DECIMAL(10,2) DEFAULT 0.00,
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

    # Ride requests (for matching)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ride_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ride_id INT NOT NULL,
            driver_id INT NOT NULL,
            status ENUM('sent', 'accepted', 'declined', 'expired') DEFAULT 'sent',
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            responded_at TIMESTAMP NULL,
            
            FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
            FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
            
            UNIQUE KEY unique_ride_driver (ride_id, driver_id),
            INDEX idx_driver_status (driver_id, status)
        )
    ''')

    # Notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('ride_request', 'ride_accepted', 'ride_started', 'ride_completed', 'ride_cancelled', 'system') NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            ride_id INT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
            
            INDEX idx_user (user_id),
            INDEX idx_type (type),
            INDEX idx_is_read (is_read)
        )
    ''')

    # Driver availability
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS driver_availability (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL,
            is_available BOOLEAN DEFAULT TRUE,
            current_location VARCHAR(255),
            max_distance INT DEFAULT 10, -- km
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_driver (driver_id)
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Ride management tables created!")

# ============================================
# RIDE FUNCTIONS
# ============================================

def create_ride(student_id, pickup_location, dropoff_location, pickup_time, notes=None):
    """Create a new ride request."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO rides (student_id, pickup_location, dropoff_location, pickup_time, notes)
        VALUES (%s, %s, %s, %s, %s)
    ''', (student_id, pickup_location, dropoff_location, pickup_time, notes))
    
    ride_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    
    return ride_id

def get_available_drivers():
    """Get all available drivers."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT u.*, da.current_location, da.max_distance
        FROM users u
        JOIN driver_availability da ON u.id = da.driver_id
        WHERE u.user_type = 'driver' 
        AND u.is_verified = TRUE 
        AND u.is_approved = TRUE
        AND da.is_available = TRUE
    ''')
    
    drivers = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return drivers

def send_ride_requests(ride_id, driver_ids):
    """Send ride requests to multiple drivers."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for driver_id in driver_ids:
        cursor.execute('''
            INSERT INTO ride_requests (ride_id, driver_id)
            VALUES (%s, %s)
        ''', (ride_id, driver_id))
    
    conn.commit()
    cursor.close()
    conn.close()

def accept_ride(ride_id, driver_id):
    """Driver accepts a ride."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Update ride status
    cursor.execute('''
        UPDATE rides 
        SET driver_id = %s, status = 'accepted'
        WHERE id = %s AND status = 'pending'
    ''', (driver_id, ride_id))
    
    # Update ride request
    cursor.execute('''
        UPDATE ride_requests 
        SET status = 'accepted', responded_at = NOW()
        WHERE ride_id = %s AND driver_id = %s
    ''', (ride_id, driver_id))
    
    # Decline other requests for this ride
    cursor.execute('''
        UPDATE ride_requests 
        SET status = 'declined', responded_at = NOW()
        WHERE ride_id = %s AND driver_id != %s
    ''', (ride_id, driver_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return cursor.rowcount > 0

def get_student_rides(student_id, status=None):
    """Get rides for a student."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = '''
        SELECT r.*, u.full_name as driver_name, u.phone as driver_phone
        FROM rides r
        LEFT JOIN users u ON r.driver_id = u.id
        WHERE r.student_id = %s
    '''
    params = [student_id]
    
    if status:
        query += ' AND r.status = %s'
        params.append(status)
    
    query += ' ORDER BY r.created_at DESC'
    
    cursor.execute(query, params)
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides

def get_driver_rides(driver_id, status=None):
    """Get rides for a driver."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = '''
        SELECT r.*, u.full_name as student_name, u.phone as student_phone
        FROM rides r
        JOIN users u ON r.student_id = u.id
        WHERE r.driver_id = %s
    '''
    params = [driver_id]
    
    if status:
        query += ' AND r.status = %s'
        params.append(status)
    
    query += ' ORDER BY r.created_at DESC'
    
    cursor.execute(query, params)
    rides = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return rides

def update_ride_status(ride_id, status, driver_id=None):
    """Update ride status."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'UPDATE rides SET status = %s'
    params = [status]
    
    if driver_id:
        query += ', driver_id = %s'
        params.append(driver_id)
    
    query += ' WHERE id = %s'
    params.append(ride_id)
    
    cursor.execute(query, params)
    conn.commit()
    cursor.close()
    conn.close()
    
    return cursor.rowcount > 0

def create_notification(user_id, type, title, message, ride_id=None):
    """Create a notification."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO notifications (user_id, type, title, message, ride_id)
        VALUES (%s, %s, %s, %s, %s)
    ''', (user_id, type, title, message, ride_id))
    
    conn.commit()
    cursor.close()
    conn.close()

def get_user_notifications(user_id, unread_only=False):
    """Get notifications for a user."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = '''
        SELECT * FROM notifications 
        WHERE user_id = %s
    '''
    params = [user_id]
    
    if unread_only:
        query += ' AND is_read = FALSE'
    
    query += ' ORDER BY created_at DESC'
    
    cursor.execute(query, params)
    notifications = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return notifications

def mark_notification_read(notification_id):
    """Mark notification as read."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = %s
    ''', (notification_id,))
    
    conn.commit()
    cursor.close()
    conn.close()

def set_driver_availability(driver_id, is_available, current_location=None):
    """Set driver availability."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO driver_availability (driver_id, is_available, current_location)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE 
        is_available = VALUES(is_available),
        current_location = VALUES(current_location),
        last_updated = NOW()
    ''', (driver_id, is_available, current_location))
    
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    create_ride_tables()
