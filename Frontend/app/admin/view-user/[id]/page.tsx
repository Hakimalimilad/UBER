'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '../../../../components/MainLayout';
import { ArrowLeft, CheckCircle, User, GraduationCap, Car, XCircle, Loader2, AlertTriangle, Info, Clock } from 'lucide-react';

export default function ViewUserProfile() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('success');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      setCurrentUserId(user.id);
    }
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        
        // Only show message for unverified users or if there's an error
        if (!data.user.is_verified) {
          setMessage('User email is not verified yet');
          setMessageType('error');
        } else if (data.user.is_approved) {
          setMessage('User is approved and verified');
          setMessageType('success');
        } else {
          // Clear any existing messages for pending users
          setMessage('');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }
    } catch (error: any) {
      console.error('Failed to fetch user data:', error);
      setMessage(error.message || 'Failed to load user data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async () => {
    try {
      setProcessing(true);
      setMessage('');
      const response = await fetch(
        `http://localhost:5000/api/admin/approve-user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'User approved successfully!');
        setMessageType('success');
        // Update the user data to reflect the approval
        setUserData((prev: any) => ({
          ...prev,
          is_approved: true,
          is_verified: true,
        }));
      } else {
        throw new Error(data.error || 'Failed to approve user');
      }
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      setMessage(error.message || 'Failed to approve user');
      setMessageType('error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!userData) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>User not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/users')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile Review</h1>
              <p className="text-gray-600 mt-1">Review user information before approval</p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-lg flex items-center ${
            !userData.is_verified 
              ? 'bg-yellow-100 text-yellow-800' 
              : !userData.is_approved 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
          }`}>
            {!userData.is_verified ? (
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Email Not Verified
              </>
            ) : !userData.is_approved ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Pending Approval
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Approved
              </>
            )}
          </div>
        </div>

        {/* Read-Only Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Information Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600">
                  {userData.user_type === 'admin' 
                    ? 'Administrator details' 
                    : userData.user_type === 'driver'
                    ? 'Driver profile and vehicle information'
                    : 'Student profile information'}
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                  {userData.full_name || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                  {userData.email || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                  {userData.phone || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                  {userData.user_type?.charAt(0).toUpperCase() + userData.user_type?.slice(1) || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Driver-Specific Fields */}
          {userData.user_type === 'driver' && (
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Driver & Vehicle Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                    {userData.license_number || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                    {userData.vehicle_model || 'Not provided'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Plate Number</label>
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                    {userData.vehicle_plate || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Color</label>
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                    {userData.vehicle_color || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student-Specific Fields */}
          {userData.user_type === 'student' && (
            <>
              <div className="p-8 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.student_id || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.major || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.year ? `${userData.year}${userData.year === '1' ? 'st' : userData.year === '2' ? 'nd' : userData.year === '3' ? 'rd' : 'th'} Year` : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campus Location</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.campus_location || 'Not provided'}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-4 mt-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Name</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.parent_name || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.parent_phone || 'Not provided'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 bg-gray-50">
                      {userData.emergency_contact || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/admin/users')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Back to Users
            </button>
            {currentUserId !== userData.id && !userData.is_approved && (
              <button
                onClick={approveUser}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve User
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Message Display */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg ${
              messageType === 'success'
                ? 'bg-green-100 border-l-4 border-green-500'
                : messageType === 'error'
                ? 'bg-red-100 border-l-4 border-red-500'
                : 'bg-blue-100 border-l-4 border-blue-500'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            ) : messageType === 'error' ? (
              <XCircle className="h-6 w-6 text-red-600 mr-3" />
            ) : (
              <Info className="h-6 w-6 text-blue-600 mr-3" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message}
              </p>
            </div>
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
