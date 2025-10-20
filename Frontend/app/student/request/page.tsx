'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/MainLayout';
import Card from '../../../components/Card';
import RideRequestForm from '../../../components/RideRequestForm';
import { MapPin, Clock, Car, CheckCircle } from 'lucide-react';

export default function StudentRequestRide() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleRideRequest = async (rideData) => {
    try {
      // Here you would typically make an API call to submit the ride request
      console.log('Ride request submitted:', rideData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequestSuccess(true);

      // Redirect to rides page after a delay
      setTimeout(() => {
        router.push('/student/rides');
      }, 2000);

    } catch (error) {
      console.error('Error submitting ride request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (requestSuccess) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-8">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ride Requested Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your ride request has been submitted. You'll be notified when a driver accepts your request.
            </p>
            <p className="text-sm text-gray-500">
              Estimated pickup time will be sent to your email
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
              Request a Ride
            </h1>
          </div>
          <p className="text-gray-600 ml-5">
            Fill out the form below to request a ride from our available drivers
          </p>
        </div>

        {/* Request Form Card */}
        <Card className="shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Ride Request Form</h2>
                <p className="text-gray-600">Please provide your trip details</p>
              </div>
            </div>

            <RideRequestForm onSubmit={handleRideRequest} />
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}
