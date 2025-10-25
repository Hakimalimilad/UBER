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
                    save_reset_token, verify_reset_token, reset_password, update_user_profile)
from email_service import send_verification_email, send_password_reset_email, send_approval_email
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ride_models import (create_ride, get_available_drivers, accept_ride, 
                        get_student_rides, get_driver_rides, update_ride_status, 
                        get_pending_rides, get_ride_by_id)
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

        # Check if email is verified - ENFORCED for security, except for admin
        if not user.get('is_verified') and user.get('user_type') != 'admin':
            return jsonify({'error': 'Please verify your email before logging in'}), 403

        # Check if user is approved - Allow login but mark as pending approval for non-admins
        if not user.get('is_approved') and user.get('user_type') != 'admin':
            # Generate token for unapproved user (limited access)
            token = generate_token(user['id'], user['user_type'])

            # Remove password from response
            user.pop('password_hash', None)

            return jsonify({
                'message': 'Login successful but account is pending admin approval',
                'token': token,
                'user': user,
                'requires_approval': True
            }), 200

        # Generate token for approved user
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


@app.route('/api/auth/update-profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile with all fields including profile picture."""
    try:
        data = request.get_json()
        
        # Basic fields (all users)
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        profile_picture = data.get('profilePicture')

        if not full_name or not email:
            return jsonify({'error': 'Full name and email are required'}), 400

        # Student specific fields
        student_id = data.get('student_id')
        major = data.get('major')
        year = data.get('year')
        campus_location = data.get('campus_location')
        pickup_location = data.get('pickup_location')
        dropoff_location = data.get('dropoff_location')
        parent_name = data.get('parent_name')
        parent_phone = data.get('parent_phone')
        emergency_contact = data.get('emergency_contact')

        # Driver specific fields
        license_number = data.get('license_number')
        vehicle_type = data.get('vehicle_type')
        vehicle_model = data.get('vehicle_model')
        vehicle_plate = data.get('vehicle_plate')
        vehicle_color = data.get('vehicle_color')
        capacity = data.get('capacity')

        # Update profile with all fields
        success = update_user_profile(
            user_id=current_user['user_id'],
            full_name=full_name,
            email=email,
            phone=phone,
            profile_picture=profile_picture,
            # Student fields
            student_id=student_id,
            major=major,
            year=year,
            campus_location=campus_location,
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            parent_name=parent_name,
            parent_phone=parent_phone,
            emergency_contact=emergency_contact,
            # Driver fields
            license_number=license_number,
            vehicle_type=vehicle_type,
            vehicle_model=vehicle_model,
            vehicle_plate=vehicle_plate,
            vehicle_color=vehicle_color,
            capacity=capacity
        )

        if success:
            # Get updated user data
            user = get_user_by_id(current_user['user_id'])
            user.pop('password_hash', None)
            return jsonify({
                'message': 'Profile updated successfully',
                'user': user
            }), 200
        else:
            return jsonify({'error': 'Failed to update profile'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change user password."""
    try:
        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return jsonify({'error': 'Both old and new passwords are required'}), 400

        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400

        # Get user from database
        user = get_user_by_id(current_user['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Verify old password
        if not verify_password(user['password_hash'], old_password):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Update password using the reset_password function with a temporary token
        from werkzeug.security import generate_password_hash
        from models import get_db_connection
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        new_password_hash = generate_password_hash(new_password)
        cursor.execute(
            'UPDATE users SET password_hash = %s WHERE id = %s',
            (new_password_hash, current_user['user_id'])
        )
        
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Password changed successfully'}), 200

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


@app.route('/api/auth/validate-reset-token', methods=['POST'])
def validate_reset_token_endpoint():
    """Validate password reset token."""
    try:
        data = request.get_json()
        token = data.get('token')

        if not token:
            return jsonify({'error': 'Token is required'}), 400

        # Verify token
        user = verify_reset_token(token)

        if user:
            return jsonify({
                'valid': True,
                'message': 'Token is valid'
            }), 200
        else:
            return jsonify({
                'valid': False,
                'error': 'Invalid or expired reset token'
            }), 400

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


@app.route('/api/admin/user/<int:user_id>', methods=['GET'])
@admin_required
def get_user_by_id_admin(current_user, user_id):
    """Get a specific user by ID (admin only)."""
    try:
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove password hash
        user.pop('password_hash', None)
        
        return jsonify({'user': user}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """Get all users (admin only)."""
    try:
        users = get_all_users()
        # Remove password hashes and map fields for frontend
        for user in users:
            user.pop('password_hash', None)
            # Ensure required fields exist for frontend
            user['full_name'] = user.get('full_name', 'Unknown User')
            user['email'] = user.get('email', '')
            user['user_type'] = user.get('user_type', 'student')
            user['created_at'] = user.get('created_at', '')
            user['is_verified'] = user.get('is_verified', False)
            user['is_approved'] = user.get('is_approved', False)

        return jsonify({
            'users': users,
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/students', methods=['GET'])
@admin_required
def get_students(current_user):
    """Get all students (admin only)."""
    try:
        # For now, return users with student role
        # In a real app, you'd have a separate students table
        users = get_all_users()
        students = [user for user in users if user.get('user_type') == 'student']

        # Add mock student data for demonstration and map fields properly for frontend
        for student in students:
            # Map user fields to student fields expected by frontend
            student['name'] = student.get('full_name', 'Unknown Student')
            student['email'] = student.get('email', '')
            student['student_id'] = f"STU{student['id']:03d}"
            student['pickup_location'] = 'Main Campus'
            student['dropoff_location'] = 'Downtown'
            student['parent_name'] = 'Parent Name'
            student['parent_phone'] = '+1234567890'
            student['emergency_contact'] = '+0987654321'
            student['is_active'] = True
            student['is_verified'] = student.get('is_verified', False)
            student['rides_count'] = 0

        return jsonify({
            'students': students,
            'total': len(students)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/drivers', methods=['GET'])
@admin_required
def get_drivers(current_user):
    """Get all drivers (admin only)."""
    try:
        # For now, return users with driver role
        # In a real app, you'd have a separate drivers table
        users = get_all_users()
        drivers = [user for user in users if user.get('user_type') == 'driver']

        # Add mock driver data for demonstration and map fields properly for frontend
        for driver in drivers:
            # Map user fields to driver fields expected by frontend
            driver['name'] = driver.get('full_name', 'Unknown Driver')
            driver['email'] = driver.get('email', '')
            driver['license_number'] = f"DL{driver['id']:06d}"
            driver['vehicle_type'] = 'Sedan'
            driver['vehicle_model'] = 'Toyota Camry'
            driver['vehicle_plate'] = f"ABC{driver['id']:03d}"
            driver['capacity'] = 4
            driver['is_active'] = True
            driver['is_verified'] = driver.get('is_verified', False)
            driver['rides_completed'] = 0
            driver['rating'] = 4.5

        return jsonify({
            'drivers': drivers,
            'statistics': {
                'total_drivers': len(drivers),
                'active_drivers': len([d for d in drivers if d.get('is_active', False)]),
                'inactive_drivers': len([d for d in drivers if not d.get('is_active', False)]),
                'verified_drivers': len([d for d in drivers if d.get('is_verified', False)])
            },
            'total': len(drivers)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/pending-users', methods=['GET'])
@admin_required
def get_pending_users_endpoint(current_user):
    """Get all users pending admin approval."""
    try:
        from models import get_pending_users
        users = get_pending_users()

        return jsonify({
            'users': users,
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/student/dashboard', methods=['GET'])
@token_required
def get_student_dashboard(current_user):
    """Get student dashboard data."""
    try:
        if current_user['user_type'] != 'student':
            return jsonify({'error': 'Access denied'}), 403
        
        # Get user's rides (mock data for now)
        rides = [
            {
                'id': 1,
                'route': 'Campus to Downtown',
                'driver': 'John Driver',
                'status': 'Ongoing',
                'date': '2024-10-15',
                'pickup_time': '08:00 AM',
                'dropoff_time': '08:30 AM'
            },
            {
                'id': 2,
                'route': 'Library to Dorms',
                'driver': 'Sarah Driver',
                'status': 'Completed',
                'date': '2024-10-14',
                'pickup_time': '17:00 PM',
                'dropoff_time': '17:25 PM'
            }
        ]
        
        # Calculate stats
        active_rides = len([r for r in rides if r['status'] == 'Ongoing'])
        completed_rides = len([r for r in rides if r['status'] == 'Completed'])
        total_spent = completed_rides * 5  # Mock calculation
        
        return jsonify({
            'stats': {
                'active_rides': active_rides,
                'completed_rides': completed_rides,
                'total_spent': total_spent
            },
            'recent_rides': rides[:5],
            'user': current_user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/driver/dashboard', methods=['GET'])
@token_required
def get_driver_dashboard(current_user):
    """Get driver dashboard data."""
    try:
        if current_user['user_type'] != 'driver':
            return jsonify({'error': 'Access denied'}), 403
        
        # Get driver's rides (mock data for now)
        rides = [
            {
                'id': 1,
                'student': 'Alice Student',
                'route': 'Main Campus → Downtown',
                'time': '08:00 AM',
                'date': '2024-10-15',
                'status': 'Confirmed',
                'passengers': 2,
                'pickup_location': 'Main Campus',
                'dropoff_location': 'Downtown'
            },
            {
                'id': 2,
                'student': 'Bob Student',
                'route': 'Main Campus → Downtown',
                'time': '08:00 AM',
                'date': '2024-10-15',
                'status': 'Confirmed',
                'passengers': 1,
                'pickup_location': 'Main Campus',
                'dropoff_location': 'Downtown'
            }
        ]
        
        # Calculate earnings (mock data)
        earnings = {
            'today': 15,
            'week': 85,
            'month': 320
        }
        
        # Driver performance stats
        performance = {
            'total_rides': 47,
            'rating': 4.8,
            'completion_rate': 98
        }
        
        return jsonify({
            'earnings': earnings,
            'performance': performance,
            'today_rides': rides,
            'user': current_user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/approve-user/<int:user_id>', methods=['POST'])
@admin_required
def approve_user_endpoint(current_user, user_id):
    """Approve a user for full system access."""
    try:
        from models import approve_user, get_user_by_id

        # Get user details for email
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Approve the user
        success = approve_user(user_id)

        if success:
            # Send approval email
            email_sent = send_approval_email(
                email=user['email'],
                name=user['full_name'],
                user_type=user['user_type']
            )

            return jsonify({
                'message': f'User {user["full_name"]} approved successfully!',
                'email_sent': email_sent
            }), 200
        else:
            return jsonify({'error': 'Failed to approve user'}), 400

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


# ============================================
# EMAIL FUNCTIONS FOR RIDES
# ============================================

def send_ride_notification_email(driver_email, driver_name, student_name, pickup_location, dropoff_location, pickup_time):
    """Send ride notification email to driver."""
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv('MAIL_USERNAME')
        msg['To'] = driver_email
        msg['Subject'] = f"New Ride Request - {pickup_location} to {dropoff_location}"
        
        body = f"""
        Hello {driver_name},
        
        A new ride request is available:
        
        Student: {student_name}
        From: {pickup_location}
        To: {dropoff_location}
        Time: {pickup_time}
        
        Please log in to your driver dashboard to accept this ride.
        
        Best regards,
        University Transportation Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(os.getenv('MAIL_SERVER'), int(os.getenv('MAIL_PORT')))
        server.starttls()
        server.login(os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD'))
        text = msg.as_string()
        server.sendmail(os.getenv('MAIL_USERNAME'), driver_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending ride notification email: {e}")
        return False

def send_ride_accepted_email(student_email, student_name, driver_name, driver_phone, pickup_location, dropoff_location):
    """Send ride accepted email to student."""
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv('MAIL_USERNAME')
        msg['To'] = student_email
        msg['Subject'] = f"Ride Accepted - {pickup_location} to {dropoff_location}"
        
        body = f"""
        Hello {student_name},
        
        Great news! Your ride request has been accepted.
        
        Driver: {driver_name}
        Phone: {driver_phone}
        From: {pickup_location}
        To: {dropoff_location}
        
        Your driver will contact you shortly for pickup details.
        
        Best regards,
        University Transportation Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(os.getenv('MAIL_SERVER'), int(os.getenv('MAIL_PORT')))
        server.starttls()
        server.login(os.getenv('MAIL_USERNAME'), os.getenv('MAIL_PASSWORD'))
        text = msg.as_string()
        server.sendmail(os.getenv('MAIL_USERNAME'), student_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending ride accepted email: {e}")
        return False

# ============================================
# RIDE MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/student/request-ride', methods=['POST'])
@token_required
def request_ride(current_user):
    """Student requests a ride."""
    try:
        if current_user['user_type'] != 'student':
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        pickup_location = data.get('pickup_location')
        dropoff_location = data.get('dropoff_location')
        pickup_time = data.get('pickup_time')
        notes = data.get('notes', '')
        
        if not all([pickup_location, dropoff_location, pickup_time]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create ride
        ride_id = create_ride(
            student_id=current_user['user_id'],
            pickup_location=pickup_location,
            dropoff_location=dropoff_location,
            pickup_time=pickup_time,
            notes=notes
        )
        
        # Get available drivers for email notifications
        available_drivers = get_available_drivers()
        
        # Send email notifications to drivers (using existing email system)
        emails_sent = 0
        for driver in available_drivers:
            try:
                # Use your existing email service
                send_ride_notification_email(
                    driver['email'],
                    driver['full_name'],
                    current_user.get('full_name', 'Student'),
                    pickup_location,
                    dropoff_location,
                    pickup_time
                )
                emails_sent += 1
            except Exception as e:
                print(f"Failed to send email to {driver['email']}: {e}")
        
        return jsonify({
            'message': 'Ride request sent successfully',
            'ride_id': ride_id,
            'drivers_notified': emails_sent
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/driver/available-rides', methods=['GET'])
@token_required
def get_available_rides(current_user):
    """Get available rides for driver."""
    try:
        if current_user['user_type'] != 'driver':
            return jsonify({'error': 'Access denied'}), 403
        
        rides = get_pending_rides()
        return jsonify({'rides': rides}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/driver/accept-ride/<int:ride_id>', methods=['POST'])
@token_required
def accept_ride_endpoint(current_user, ride_id):
    """Driver accepts a ride."""
    try:
        if current_user['user_type'] != 'driver':
            return jsonify({'error': 'Access denied'}), 403
        
        success = accept_ride(ride_id, current_user['user_id'])
        
        if success:
            # Get ride details for email notification
            ride = get_ride_by_id(ride_id)
            if ride:
                # Send email to student
                send_ride_accepted_email(
                    ride['student_email'],
                    ride['student_name'],
                    current_user.get('full_name', 'Driver'),
                    current_user.get('phone', 'N/A'),
                    ride['pickup_location'],
                    ride['dropoff_location']
                )
            
            return jsonify({'message': 'Ride accepted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to accept ride'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/student/my-rides', methods=['GET'])
@token_required
def get_my_rides_student(current_user):
    """Get student's rides."""
    try:
        if current_user['user_type'] != 'student':
            return jsonify({'error': 'Access denied'}), 403
        
        rides = get_student_rides(current_user['user_id'])
        return jsonify({'rides': rides}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/driver/my-rides', methods=['GET'])
@token_required
def get_my_rides_driver(current_user):
    """Get driver's rides."""
    try:
        if current_user['user_type'] != 'driver':
            return jsonify({'error': 'Access denied'}), 403
        
        rides = get_driver_rides(current_user['user_id'])
        return jsonify({'rides': rides}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ride/<int:ride_id>/status', methods=['PUT'])
@token_required
def update_ride_status_endpoint(current_user, ride_id):
    """Update ride status."""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['in_progress', 'completed', 'cancelled']:
            return jsonify({'error': 'Invalid status'}), 400
        
        success = update_ride_status(ride_id, status)
        
        if success:
            return jsonify({'message': 'Ride status updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update ride status'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    from models import create_tables
    from ride_models import create_ride_tables
    
    print("🚀 Starting Student Transportation Platform...")
    
    # Create tables if they don't exist
    try:
        create_tables()
        create_ride_tables()
    except:
        pass
    
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)
