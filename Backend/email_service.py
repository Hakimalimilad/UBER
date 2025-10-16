"""
Email Service for Student Transport Platform
Handles verification and notification emails with beautiful HTML templates
"""

import smtplib
import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Configure logging
logger = logging.getLogger(__name__)

class TransportEmailService:
    """Professional email service for Student Transport Platform"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USER')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        
    def _send_email_with_retry(self, msg, to_email, email_type="email"):
        """Send email with retry logic"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=30) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
                    logger.info(f"{email_type} sent successfully to {to_email} (attempt {attempt + 1})")
                    return True
                    
            except Exception as e:
                logger.warning(f"SMTP attempt {attempt + 1} failed: {e}")
                
                if attempt < max_retries - 1:
                    import time
                    wait_time = 2 ** attempt
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Failed to send {email_type} to {to_email} after {max_retries} attempts")
                    return False
        
        return False
    
    def _get_verification_html_template(self, name, verification_link):
        """Professional HTML template for email verification"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Student Transport</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; color: #1f2937;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 40px 32px; text-align: center;">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 48px;">🚗</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Welcome to Student Transport</h1>
                    <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 18px; font-weight: 500;">Connect. Commute. Campus.</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 48px 32px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 700;">Hi {name},</h2>
                    <p style="color: #4b5563; margin: 0 0 32px; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up! Please verify your email address to activate your account and start using the platform.
                    </p>
                    
                    <!-- Verification Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); transition: all 0.2s;">
                            ✓ Verify Email Address
                        </a>
                    </div>
                    
                    <!-- Next Steps -->
                    <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin: 32px 0; border-left: 4px solid #4f46e5;">
                        <h3 style="color: #1f2937; margin: 0 0 16px; font-size: 18px; font-weight: 600;">🚀 What's next?</h3>
                        <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                            <li style="margin-bottom: 8px;">Click the verification button above</li>
                            <li style="margin-bottom: 8px;">Your account will be activated instantly</li>
                            <li style="margin-bottom: 8px;">Book rides or offer transportation</li>
                            <li>Connect with students on campus</li>
                        </ul>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 13px; margin: 32px 0 0; text-align: center;">
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <div style="margin-bottom: 16px;">
                        <span style="display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px; font-weight: 500;">
                            <span>🚗</span> Student Transport Platform
                        </span>
                    </div>
                    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                        Safe & Reliable Campus Transportation<br/>
                        © 2025 Student Transport. All rights reserved.
                    </p>
                </div>
                
            </div>
        </body>
        </html>
        """
    
    def _get_password_reset_html_template(self, name, reset_link):
        """Professional HTML template for password reset"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Student Transport</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; color: #1f2937;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 32px; text-align: center;">
                    <div style="margin-bottom: 24px;">
                        <span style="font-size: 48px;">🔐</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.025em;">Student Transport</h1>
                    <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 18px; font-weight: 500;">Password Reset Request</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 48px 32px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px; font-weight: 700;">Hi {name},</h2>
                    <p style="color: #4b5563; margin: 0 0 32px; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your Student Transport account.
                    </p>
                    
                    <!-- Security Warning -->
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 32px 0;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">⚠️</span>
                            <div>
                                <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">Security Notice</p>
                                <p style="margin: 4px 0 0; color: #92400e; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reset Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); transition: all 0.2s;">
                            🔐 Reset My Password
                        </a>
                    </div>
                    
                    <!-- Security Info -->
                    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 32px 0;">
                        <h3 style="margin: 0 0 12px; color: #0c4a6e; font-size: 16px; font-weight: 600;">🔒 Didn't request this?</h3>
                        <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
                            If you didn't request a password reset, you can safely ignore this email. 
                            Your password will remain unchanged and your account stays secure.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <div style="margin-bottom: 16px;">
                        <span style="display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px; font-weight: 500;">
                            <span>🚗</span> Student Transport Platform
                        </span>
                    </div>
                    <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                        This is an automated security message.<br/>
                        Safe & Reliable Campus Transportation
                    </p>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            © 2025 Student Transport. All rights reserved.
                        </p>
                    </div>
                </div>
                
            </div>
        </body>
        </html>
        """
    
    def send_verification_email(self, email, name, verification_token):
        """Send professional verification email with HTML template"""
        try:
            verification_link = f"{self.frontend_url}/verify-email?token={verification_token}"
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Verify Your Email - Student Transport"
            msg['From'] = f"Student Transport <{self.smtp_username}>"
            msg['To'] = email
            
            html_content = self._get_verification_html_template(name, verification_link)
            msg.attach(MIMEText(html_content, 'html'))
            
            return self._send_email_with_retry(msg, email, "Verification email")
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {e}")
            return False
    
    def send_password_reset_email(self, email, name, reset_token):
        """Send professional password reset email with HTML template"""
        try:
            reset_link = f"{self.frontend_url}/reset-password?token={reset_token}"
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Password Reset Request - Student Transport"
            msg['From'] = f"Student Transport <{self.smtp_username}>"
            msg['To'] = email
            
            html_content = self._get_password_reset_html_template(name, reset_link)
            msg.attach(MIMEText(html_content, 'html'))
            
            return self._send_email_with_retry(msg, email, "Password reset email")
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {e}")
            return False


# Create global email service instance
email_service = TransportEmailService()

# Convenience functions
def send_verification_email(email, name, verification_token):
    """Send verification email using the professional email service"""
    return email_service.send_verification_email(email, name, verification_token)

def send_password_reset_email(email, name, reset_token):
    """Send password reset email using the professional email service"""
    return email_service.send_password_reset_email(email, name, reset_token)
