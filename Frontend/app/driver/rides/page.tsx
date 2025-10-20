'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/Card';
import Table from '../../../components/Table';
import Topbar from '../../../components/Topbar';
import EmptyState from '../../../components/EmptyState';
import { Car, MapPin, Clock, User, Star } from 'lucide-react';

export default function DriverRides() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock rides data
  const [myRides] = useState([
    {
      id: 1,
      student: 'Alice Johnson',
      route: 'Campus to Downtown Mall',
      status: 'Completed',
      date: '2024-10-15',
      time: '2:30 PM',
      earnings: 12.50,
      rating: 5,
      pickup: 'Student Center',
      destination: 'Downtown Mall'
    },
    {
      id: 2,
      student: 'Bob Smith',
      route: 'Library to Student Dorms',
      status: 'Completed',
      date: '2024-10-14',
      time: '6:15 PM',
      earnings: 8.75,
      rating: 4,
      pickup: 'Main Library',
      destination: 'Building A Dorms'
    },
    {
      id: 3,
      student: 'Carol Davis',
      route: 'Gym to Coffee Shop',
      status: 'Ongoing',
      date: '2024-10-13',
      time: '4:20 PM',
      earnings: 15.00,
      rating: null,
      pickup: 'Campus Gym',
      destination: 'Central Perk Coffee'
    }
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const tableColumns = [
    { key: 'student', label: 'Student', sortable: true },
    { key: 'route', label: 'Route', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'earnings', label: 'Earnings', sortable: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        user={currentUser}
        onMenuClick={() => router.push('/driver/dashboard')}
        onProfileClick={() => router.push('/settings')}
      />

      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
              My Rides
            </h1>
          </div>
          <p className="text-gray-600 ml-5">
            View your completed rides, track earnings, and manage ongoing trips
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Rides</p>
                <p className="text-2xl font-bold text-blue-900">{myRides.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {myRides.filter(ride => ride.status === 'Completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-900">
                  {myRides.filter(ride => ride.rating).length > 0
                    ? (myRides.filter(ride => ride.rating).reduce((sum, ride) => sum + ride.rating, 0) / myRides.filter(ride => ride.rating).length).toFixed(1)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rides Table */}
        <Card className="shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ride History</h2>
            {myRides.length > 0 ? (
              <Table
                data={myRides}
                columns={tableColumns}
                onRowClick={(ride) => console.log('Ride clicked:', ride)}
              />
            ) : (
              <EmptyState
                icon={<Car className="w-12 h-12 text-gray-400" />}
                title="No rides yet"
                description="You haven't completed any rides yet. Accept ride requests to get started!"
              />
            )}
          </div>
        </Card>

        {/* Ongoing Rides Section */}
        {myRides.some(ride => ride.status === 'Ongoing') && (
          <Card className="mt-8 shadow-lg border-orange-200 bg-orange-50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Ongoing Rides</h2>
                  <p className="text-gray-600">Rides currently in progress</p>
                </div>
              </div>

              <div className="space-y-4">
                {myRides.filter(ride => ride.status === 'Ongoing').map(ride => (
                  <div key={ride.id} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{ride.student}</h3>
                          <p className="text-sm text-gray-600">{ride.route}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Earnings so far</div>
                        <div className="text-lg font-bold text-green-600">${ride.earnings}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {ride.pickup}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>→</span>
                        <MapPin className="w-4 h-4" />
                        {ride.destination}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/driver/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
