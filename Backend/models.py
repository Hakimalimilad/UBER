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
    """Create users table only """
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
            INDEX idx_email (email),
            INDEX idx_verification_token (verification_token),
            INDEX idx_reset_token (reset_token),
            INDEX idx_approval_status (is_approved, is_verified)
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Users table created with approval system!")
    


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


if __name__ == '__main__':
    """ this to create tables."""
    print("🚀 Creating database tables...")
    try:
        create_tables()
        print("✅ Database ready!")
    except Exception as e:
        print(f"❌ Error: {e}")
