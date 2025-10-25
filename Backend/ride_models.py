"""
Ride Management Database Models
Only essential tables needed for the platform
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
    """Create the rides table."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Rides table - the only table we need
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            driver_id INT NULL,
            pickup_location VARCHAR(255) NOT NULL,
            dropoff_location VARCHAR(255) NOT NULL,
            pickup_time DATETIME NOT NULL,
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

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Rides table created!")

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
        SELECT id, full_name, email, phone
        FROM users
        WHERE user_type = 'driver' 
        AND is_verified = TRUE 
        AND is_approved = TRUE
    ''')
    
    drivers = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return drivers

def accept_ride(ride_id, driver_id):
    """Driver accepts a ride."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE rides 
        SET driver_id = %s, status = 'accepted'
        WHERE id = %s AND status = 'pending'
    ''', (driver_id, ride_id))
    
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

def get_pending_rides():
    """Get all pending rides (for drivers to see)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('''
        SELECT r.*, u.full_name as student_name, u.phone as student_phone
        FROM rides r
        JOIN users u ON r.student_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
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
               u1.full_name as student_name, u1.email as student_email, u1.phone as student_phone,
               u2.full_name as driver_name, u2.email as driver_email, u2.phone as driver_phone
        FROM rides r
        JOIN users u1 ON r.student_id = u1.id
        LEFT JOIN users u2 ON r.driver_id = u2.id
        WHERE r.id = %s
    ''', (ride_id,))
    
    ride = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return ride

if __name__ == '__main__':
    create_ride_tables()
