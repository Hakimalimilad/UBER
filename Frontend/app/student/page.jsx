'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/MainLayout';
import Card from '../../components/Card';
import Table from '../../components/Table';
import ProfileForm from '../../components/ProfileForm';
import RideRequestForm from '../../components/RideRequestForm';
import EmptyState from '../../components/EmptyState';
import { Car, Clock, User, Plus, Star, Route, CheckCircle, MapPin, XCircle, Phone, Users } from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [stats, setStats] = useState({
    activeRides: 0,
    pastRides: 0,
    avgRating: 0
  });
  const [myRides, setMyRides] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  const tableColumns = [
    { key: 'route', label: 'Route', sortable: true },
    { key: 'driver', label: 'Driver', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true }
  ];

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          activeRides: data.stats.active_rides || 0,
          pastRides: data.stats.completed_rides || 0,
          avgRating: data.stats.avg_rating || 0
        });
        setMyRides(data.recent_rides);
        setCurrentUser(data.user);
      } else {
        console.error('Failed to fetch dashboard data');
      }

      // Fetch available drivers
      const driversResponse = await fetch('http://localhost:5000/api/available-drivers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (driversResponse.ok) {
        const driversData = await driversResponse.json();
        setAvailableDrivers(driversData.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.user_type !== 'student') {
      window.location.href = '/';
      return;
    }

    fetchDashboardData();
  }, []);

  const handleProfileUpdate = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setUpdateMessage('Profile updated successfully!');
        setCurrentUser(prev => ({ ...prev, ...data }));
      } else {
        setUpdateMessage('Failed to update profile');
      }
    } catch (error) {
      setUpdateMessage('Error updating profile');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-700 mt-2">
                Overview of your rides and activity
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Rides</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.activeRides + stats.pastRides}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg">
                    <Route className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.pastRides}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Avg Rating</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Rides ({myRides.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {myRides.length > 0 ? (
                  myRides.slice(0, 3).map((ride) => (
                    <div key={ride.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        {/* Left Section - Ride Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                                ride.status === "completed"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : ride.status === "ongoing" || ride.status === "accepted" || ride.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : ride.status === "cancelled"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {ride.status === "completed" ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : ride.status === "ongoing" || ride.status === "accepted" || ride.status === "in_progress" ? (
                                <Car className="w-4 h-4 animate-pulse" />
                              ) : ride.status === "cancelled" ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <Clock className="w-4 h-4" />
                              )}
                              {ride.status ? (ride.status.charAt(0).toUpperCase() + ride.status.slice(1)) : "Pending"}
                            </span>

                            {/* Ride ID */}
                            <span className="text-sm text-gray-500">
                              #{ride.id ? ride.id.toString().padStart(4, "0") : "N/A"}
                            </span>
                          </div>

                          {/* Route Info */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-900">
                                  {ride.pickup_location || ride.pickup || "Pickup location"}
                                </p>
                              </div>
                              <div className="ml-1 border-l-2 border-gray-300 h-4"></div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm font-medium text-gray-900">
                                  {ride.dropoff_location || ride.dropoff || "Destination"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Driver and Time Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Driver: {ride.driver_name || ride.driver || "Not assigned"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{ride.date || ride.pickup_time || "Scheduled time"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No rides yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Request your first ride to get started!
                    </p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Request Ride
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Available Drivers Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Available Drivers ({availableDrivers.length})
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">Real-time driver availability</p>
              </div>
              <div className="p-6">
                {availableDrivers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDrivers.slice(0, 6).map((driver) => (
                      <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{driver.name}</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm text-gray-600">
                                  {driver.rating} ({driver.total_ratings})
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Available
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Car className="w-4 h-4" />
                            <span>{driver.vehicle_type} • {driver.capacity} seats</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium">📞</span>
                            <span>{driver.phone}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.total_rides} completed rides
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No drivers available at the moment</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'rides' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Rides</h2>
            {myRides.length > 0 ? (
              <Table columns={tableColumns} data={myRides} />
            ) : (
              <EmptyState
                icon={<Car className="w-12 h-12" />}
                title="No rides booked"
                description="You haven't booked any rides yet"
              />
            )}
          </div>
        )}

        {activeTab === 'request' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request a Ride</h2>
            <RideRequestForm onSubmit={(data) => alert('Ride requested!')} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            {updateMessage && (
              <div className={`mb-4 p-3 rounded-lg ${updateMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {updateMessage}
              </div>
            )}
            <ProfileForm user={currentUser} onSubmit={handleProfileUpdate} />
          </div>
        )}
      </div>
    </Layout>
  );
}
