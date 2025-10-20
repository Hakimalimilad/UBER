'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../components/MainLayout';
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Navigation, 
  Star,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminRides() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock rides data with more details
  const [allRides] = useState([
    {
      id: 1,
      student: 'Alice Johnson',
      studentId: 'STU001',
      driver: 'John Driver',
      driverId: 'DRV001',
      pickup: 'Main Campus Gate',
      dropoff: 'Downtown Mall',
      status: 'completed',
      date: '2024-10-19',
      time: '2:30 PM',
      duration: '25 min',
      distance: '8.5 km',
      cost: 12.50,
      rating: 5,
      paymentMethod: 'Card'
    },
    {
      id: 2,
      student: 'Bob Smith',
      studentId: 'STU002',
      driver: 'Sarah Driver',
      driverId: 'DRV002',
      pickup: 'Library Building',
      dropoff: 'Student Dorms A',
      status: 'completed',
      date: '2024-10-19',
      time: '6:15 PM',
      duration: '15 min',
      distance: '4.2 km',
      cost: 8.75,
      rating: 4,
      paymentMethod: 'Cash'
    },
    {
      id: 3,
      student: 'Carol Davis',
      studentId: 'STU003',
      driver: 'Mike Driver',
      driverId: 'DRV003',
      pickup: 'Sports Complex',
      dropoff: 'Coffee Shop Plaza',
      status: 'ongoing',
      date: '2024-10-19',
      time: '8:20 PM',
      duration: '10 min',
      distance: '3.1 km',
      cost: 7.50,
      rating: null,
      paymentMethod: 'Card'
    },
    {
      id: 4,
      student: 'David Wilson',
      studentId: 'STU004',
      driver: 'Emma Driver',
      driverId: 'DRV004',
      pickup: 'Engineering Block',
      dropoff: 'City Center',
      status: 'cancelled',
      date: '2024-10-18',
      time: '3:45 PM',
      duration: '-',
      distance: '-',
      cost: 0,
      rating: null,
      paymentMethod: '-'
    },
    {
      id: 5,
      student: 'Emma Brown',
      studentId: 'STU005',
      driver: 'Tom Driver',
      driverId: 'DRV005',
      pickup: 'Medical Center',
      dropoff: 'Airport Terminal',
      status: 'completed',
      date: '2024-10-18',
      time: '11:00 AM',
      duration: '45 min',
      distance: '22.3 km',
      cost: 35.00,
      rating: 5,
      paymentMethod: 'Card'
    }
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Filter rides based on search and status
  const filteredRides = allRides.filter(ride => {
    const matchesSearch = 
      ride.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.dropoff.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: allRides.length,
    completed: allRides.filter(r => r.status === 'completed').length,
    ongoing: allRides.filter(r => r.status === 'ongoing').length,
    cancelled: allRides.filter(r => r.status === 'cancelled').length,
    totalRevenue: allRides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.cost, 0)
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'ongoing': return <Activity className="w-4 h-4 animate-pulse" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rides Management</h1>
          <p className="text-gray-700 mt-2">Monitor and manage all ride operations in real-time</p>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Rides */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Rides</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Car className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Ongoing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Ongoing</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.ongoing}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Cancelled */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Revenue</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student, driver, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('ongoing')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ongoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Rides ({filteredRides.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => (
                <div key={ride.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Left Section - Ride Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ride.status)}`}>
                          {getStatusIcon(ride.status)}
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>

                        {/* Ride ID */}
                        <span className="text-sm text-gray-500">#{ride.id.toString().padStart(4, '0')}</span>
                      </div>

                      {/* Student and Driver Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Student</p>
                            <p className="font-semibold text-gray-900">{ride.student}</p>
                            <p className="text-xs text-gray-500">{ride.studentId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Car className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Driver</p>
                            <p className="font-semibold text-gray-900">{ride.driver}</p>
                            <p className="text-xs text-gray-500">{ride.driverId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">{ride.pickup}</p>
                          </div>
                          <div className="ml-1 border-l-2 border-gray-300 h-4"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">{ride.dropoff}</p>
                          </div>
                        </div>
                      </div>

                      {/* Time and Distance */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{ride.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{ride.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4" />
                          <span>{ride.distance}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>{ride.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Cost and Rating */}
                    <div className="text-right">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Cost</p>
                        <p className="text-2xl font-bold text-gray-900">${ride.cost.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{ride.paymentMethod}</p>
                      </div>

                      {ride.rating && (
                        <div className="flex items-center justify-end gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < ride.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({ride.rating})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
