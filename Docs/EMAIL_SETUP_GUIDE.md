# Email Verification Setup Guide

## 📧 Overview

The Student Transport Platform now includes a complete email verification system with:
- ✅ Email verification on registration
- ✅ Password reset via email
- ✅ Beautiful HTML email templates
- ✅ Secure token-based authentication

---

## 🚀 Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable it

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type "Student Transport"
4. Click **Generate**
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Your `.env` File

Edit `Backend/.env` and add:

```env
# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # ← Paste your app password (no spaces!)

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Important:** Remove spaces from the app password!

---

## 🔧 Configuration Options

### For Development (Localhost)
```env
FRONTEND_URL=http://localhost:3000
```

### For Production (Deployed)
```env
FRONTEND_URL=https://yourdomain.com
```

### For Network Testing (Same WiFi)
```env
FRONTEND_URL=http://192.168.1.x:3000  # Your computer's IP
```

---

## 📝 API Endpoints

### 1. Register (Sends Verification Email)
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "user_type": "student"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user_id": 1,
  "email_sent": true
}
```

### 2. Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "message": "Email verified successfully! You can now login."
}
```

### 3. Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "student@example.com"
}
```

### 4. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "student@example.com"
}
```

### 5. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "new_password123"
}
```

---

## 🎨 Email Templates

### Verification Email
- 🚗 Student Transport branding
- ✓ Big verification button
- 📋 What's next checklist
- 🎨 Modern gradient design

### Password Reset Email
- 🔐 Security-focused design
- ⚠️ Expiry warning (1 hour)
- 🔒 "Didn't request this?" section
- 🎨 Professional layout

---

## 🔐 Security Features

### Email Verification
- Secure random tokens (32 bytes URL-safe)
- Tokens stored in database
- One-time use (deleted after verification)

### Password Reset
- Tokens expire after 1 hour
- Secure token generation
- One-time use
- Doesn't reveal if email exists (security best practice)

---

## 🧪 Testing

### Test Email Sending

1. Start the backend:
```bash
cd Backend
python app.py
```

2. Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@gmail.com",
    "password": "test123",
    "full_name": "Test User",
    "user_type": "student"
  }'
```

3. Check your email inbox!

### Test Verification Flow

1. Click the verification link in the email
2. Frontend should show success message
3. Try logging in - should work!

---

## 🐛 Troubleshooting

### Email Not Sending?

**Error: "Authentication failed"**
- ✅ Check you enabled 2-Factor Authentication
- ✅ Check you're using App Password, not regular password
- ✅ Remove spaces from app password in `.env`

**Error: "Connection refused"**
- ✅ Check your internet connection
- ✅ Check firewall isn't blocking port 587
- ✅ Try port 465 with SSL (change SMTP_PORT=465)

**Email goes to Spam**
- ✅ Normal for development
- ✅ Check spam folder
- ✅ For production, use proper email service (SendGrid, AWS SES)

### Verification Link Not Working?

**Check:**
1. FRONTEND_URL in `.env` matches where frontend is running
2. Token in URL is complete (not truncated)
3. Token hasn't been used already
4. Frontend has verification page implemented

---

## 📱 Frontend Integration

### Create Verification Page

Create `Frontend/app/verify-email/page.jsx`:

```jsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // Verify email
    fetch('http://localhost:5000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    })
    .catch(err => {
      setStatus('error');
      setMessage('Network error');
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold mb-2">Verifying Email...</h1>
            <p className="text-gray-600">Please wait</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Email Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
              Go to Login
            </a>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <a href="/" className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700">
              Back to Home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
```

### Update Registration to Show Email Sent Message

In your registration form, show a message after successful registration:

```jsx
if (response.email_sent) {
  alert('Registration successful! Please check your email to verify your account.');
}
```

---

## 🎓 For Classmates

### Shared Email Setup (Optional)

If everyone wants to use the same Gmail account for testing:

1. Create a shared Gmail account (e.g., `studenttransport2025@gmail.com`)
2. Enable 2FA and generate app password
3. Share the credentials in your `.env.example`:

```env
SMTP_USER=studenttransport2025@gmail.com
SMTP_PASSWORD=shared_app_password_here
```

**Note:** This is only for class projects! Never share credentials in production!

---

## 🔄 Optional: Enforce Email Verification

To require users to verify email before logging in, uncomment these lines in `app.py`:

```python
# In the login endpoint
if not user.get('is_verified'):
    return jsonify({'error': 'Please verify your email before logging in'}), 403
```

---

## 📊 Database Changes

The `users` table now includes:

| Column | Type | Description |
|--------|------|-------------|
| `is_verified` | BOOLEAN | Email verification status |
| `verification_token` | VARCHAR(255) | Token for email verification |
| `reset_token` | VARCHAR(255) | Token for password reset |
| `reset_token_expiry` | DATETIME | When reset token expires |

**To update existing database:**
```bash
cd Backend
python models.py
```

This will add the new columns automatically!

---

## 🎉 Summary

**What You Get:**
- ✅ Professional email verification system
- ✅ Password reset functionality
- ✅ Beautiful HTML email templates
- ✅ Secure token-based authentication
- ✅ Production-ready code

**Setup Time:** ~5 minutes  
**Cost:** Free (using Gmail)

**Ready to send emails!** 🚀📧
