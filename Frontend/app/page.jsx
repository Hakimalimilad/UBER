'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    user_type: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // Track resend status

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Handle email verification required
          if (data.error?.toLowerCase().includes('verify') || data.error?.toLowerCase().includes('email')) {
            throw new Error('Please verify your email address before logging in. Check your email for the verification link.');
          }
          throw new Error(data.error || 'Access denied');
        }

        throw new Error(data.error || `Login failed (${response.status})`);
      }

      // Handle registration vs login differently
      if (!isLogin) {
        // Registration successful - show success message (persistent)
        setRegistrationSuccess(true);
        setRegisteredEmail(formData.email);
        setError(''); // Clear any previous errors

        // Don't auto-reset - let user manually switch modes or refresh
      } else {
        // Login successful - store token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on user type
        const userType = data.user?.user_type;
        if (userType === 'admin') {
          router.push('/admin');
        } else if (userType === 'driver') {
          router.push('/driver');
        } else {
          router.push('/student');
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setError('');
      setLoading(true);
      setResendStatus('sending');

      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendStatus('sent');
        setError('');
        alert(`✅ Verification email sent successfully to ${email}\n\nPlease check your email for the verification link.`);
      } else {
        throw new Error(data.error || 'Failed to resend verification email');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.message);
      setResendStatus('error');
    } finally {
      setLoading(false);
      // Reset resend status after a delay
      setTimeout(() => setResendStatus(''), 3000);
    }
  };

  // Quick login buttons for testing
  const quickLogin = (email, password) => {
    setFormData({ ...formData, email, password });
    setIsLogin(true);

    // Auto-submit after setting data
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Student Transport</h1>
          <p className="text-gray-600 mt-2">Connect. Commute. Campus.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${isLogin
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${!isLogin
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Register
            </button>
          </div>

          {/* Success Message for Registration */}
          {registrationSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700">
                  ✓ Registration successful! Check <span className="font-semibold">{registeredEmail}</span> for verification link
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !registrationSuccess && (
            <div className={`mb-4 p-3 border rounded-lg text-sm ${
              error.includes('verify your email')
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <svg className={`w-4 h-4 mr-2 ${
                  error.includes('verify your email') ? 'text-yellow-500' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {error.includes('verify your email') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {error}
              </div>

              {/* Resend verification email option */}
              {error.includes('verify your email') && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <button
                    type="button"
                    onClick={() => resendVerificationEmail(formData.email)}
                    disabled={loading || resendStatus === 'sent'}
                    className={`text-xs px-3 py-1 rounded-md transition-colors ${
                      resendStatus === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : loading
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {resendStatus === 'sent'
                      ? '✓ Email sent!'
                      : loading
                      ? 'Sending...'
                      : 'Resend verification email'
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          {/* Quick Login for Testing - Hidden during registration success */}
          {isLogin && !registrationSuccess && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">Quick Login (Testing)</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickLogin('admin@transport.com', 'admin123')}
                  className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('student@test.com', 'student123')}
                  className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Student
                </button>
                <button
                  onClick={() => quickLogin('driver@test.com', 'driver123')}
                  className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Driver
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Secure campus transportation for students
        </p>
      </div>
    </div>
  );
}