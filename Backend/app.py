"""
Flask App - Minimal setup for authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from functools import wraps
from models import (create_user, get_user_by_email, get_user_by_id, verify_password, get_all_users, update_user_role,
                    generate_verification_token, save_verification_token, verify_email_token,
                    save_reset_token, verify_reset_token, reset_password)
from email_service import send_verification_email, send_password_reset_email
import mysql.connector


load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'change-this-secret-key')
CORS(app)

mydb = mysql.connector.connect(
    host=os.getenv('MYSQL_HOST'),
    user=os.getenv('MYSQL_USER'),
    password=os.getenv('MYSQL_PASSWORD'),
    database=os.getenv('MYSQL_DATABASE')
)

def generate_token(user_id, user_type):
    """Generate JWT token."""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def token_required(f):
    """Decorator to protect routes with JWT authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = {
                'user_id': data['user_id'],
                'user_type': data['user_type']
            }
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorator to require admin role."""
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user['user_type'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


@app.route('/api/health', methods=['GET'])
def health():
    """Health check."""
    return jsonify({'status': 'ok'}), 200


@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user."""
    try:
        data = request.get_json()
        
        # Check if user exists
        if get_user_by_email(data['email']):
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user
        user_id = create_user(
            email=data['email'],
            password=data['password'],
            full_name=data['full_name'],
            user_type=data.get('user_type', 'student')
        )
        
        # Generate and save verification token
        verification_token = generate_verification_token()
        save_verification_token(user_id, verification_token)
        
        # Send verification email
        email_sent = send_verification_email(
            email=data['email'],
            name=data['full_name'],
            verification_token=verification_token
        )
        
        if not email_sent:
            print(f"⚠️ Warning: Failed to send verification email to {data['email']}")
        
        return jsonify({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'user_id': user_id,
            'email_sent': email_sent,
            'email': data['email']  # Include email for frontend reference
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user."""
    try:
        data = request.get_json()
        
        # Get user
        user = get_user_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not verify_password(user['password_hash'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if email is verified - ENFORCED for security
        if not user.get('is_verified'):
            return jsonify({'error': 'Please verify your email before logging in'}), 403
        
        # Generate token
        token = generate_token(user['id'], user['user_type'])
        
        # Remove password from response
        user.pop('password_hash', None)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user info from token."""
    try:
        user = get_user_by_id(current_user['user_id'])
        if user:
            user.pop('password_hash', None)
            return jsonify({'user': user}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# EMAIL VERIFICATION ENDPOINTS
# ============================================

@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    """Verify email using token from email link."""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Verification token is required'}), 400
        
        # Verify the token
        success = verify_email_token(token)
        
        if success:
            return jsonify({'message': 'Email verified successfully! You can now login.'}), 200
        else:
            return jsonify({'error': 'Invalid or expired verification token'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email."""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Get user
        user = get_user_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already verified
        if user.get('is_verified'):
            return jsonify({'message': 'Email is already verified'}), 200
        
        # Generate new token
        verification_token = generate_verification_token()
        save_verification_token(user['id'], verification_token)
        
        # Send email
        email_sent = send_verification_email(
            email=email,
            name=user['full_name'],
            verification_token=verification_token
        )
        
        if email_sent:
            return jsonify({'message': 'Verification email sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send verification email'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset email."""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Get user
        user = get_user_by_email(email)
        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
        
        # Generate reset token
        reset_token = generate_verification_token()
        save_reset_token(email, reset_token)
        
        # Send reset email
        email_sent = send_password_reset_email(
            email=email,
            name=user['full_name'],
            reset_token=reset_token
        )
        
        return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password_endpoint():
    """Reset password using token from email."""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        # Reset password
        success = reset_password(token, new_password)
        
        if success:
            return jsonify({'message': 'Password reset successfully! You can now login with your new password.'}), 200
        else:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """Get all users (admin only)."""
    try:
        users = get_all_users()
        # Remove password hashes
        for user in users:
            user.pop('password_hash', None)
        
        return jsonify({
            'users': users,
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_role(current_user, user_id):
    """Update user role (admin only)."""
    try:
        data = request.get_json()
        new_role = data.get('user_type')
        
        if new_role not in ['student', 'driver', 'admin']:
            return jsonify({'error': 'Invalid user type'}), 400
        
        # Prevent admin from demoting themselves
        if user_id == current_user['user_id'] and new_role != 'admin':
            return jsonify({'error': 'Cannot change your own admin role'}), 400
        
        success = update_user_role(user_id, new_role)
        
        if success:
            return jsonify({'message': 'User role updated successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    from models import create_tables
    
    print("🚀 Starting Student Transportation Platform...")
    
    # Create tables if they don't exist
    try:
        create_tables()
    except:
        pass
    
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)
