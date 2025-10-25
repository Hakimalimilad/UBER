'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/MainLayout';
import Card from '../../components/Card';
import Table from '../../components/Table';
import ProfileForm from '../../components/ProfileForm';
import RideRequestForm from '../../components/RideRequestForm';
import EmptyState from '../../components/EmptyState';
import { Car, Clock, User, Plus } from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState('');
  const [stats, setStats] = useState({
    activeRides: 0,
    pastRides: 0,
    totalSpent: 0
  });
  const [myRides, setMyRides] = useState([]);

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
          totalSpent: data.stats.total_spent || 0
        });
        setMyRides(data.recent_rides);
        setCurrentUser(data.user);
      } else {
        console.error('Failed to fetch dashboard data');
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
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                title="Active Rides"
                value={stats.activeRides}
                icon={<Car className="w-6 h-6 text-blue-600" />}
              />
              <Card
                title="Past Rides"
                value={stats.pastRides}
                icon={<Clock className="w-6 h-6 text-green-600" />}
              />
              <Card
                title="Total Spent"
                value={`$${stats.totalSpent}`}
                icon={<User className="w-6 h-6 text-purple-600" />}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Rides</h2>
              {myRides.length > 0 ? (
                <Table columns={tableColumns} data={myRides} />
              ) : (
                <EmptyState
                  icon={<Car className="w-12 h-12" />}
                  title="No rides yet"
                  description="Request your first ride to get started"
                  action={
                    <button
                      onClick={() => setActiveTab('request')}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Request Ride
                    </button>
                  }
                />
              )}
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
