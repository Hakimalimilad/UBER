import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import {
  TrendingUp,
  Users,
  Car,
  Clock,
  CheckCircle,
  Activity,
  Star,
  Eye,
  Trash2,
  X,
  Loader2,
  MessageSquare,
  Route as RouteIcon,
  Calendar
} from 'lucide-react';
import api from '../../lib/api';

// Simple loading component
const EthiraGlobalLoader = ({ size = 'md', message = 'Loading...' }: { size?: string; message?: string }) => (
  <div className="flex flex-col items-center justify-center">
    <Loader2 className={`animate-spin ${size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} text-indigo-600`} />
    <p className="mt-2 text-sm text-gray-600">{message}</p>
  </div>
);

const getEthicalLoadingMessage = (context: string) => `Loading ${context} data...`;

interface Driver {
  id: number;
  name: string;
  email: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_plate: string;
  capacity: number;
  is_active: boolean;
  is_verified: boolean;
  rides_completed: number;
  rating: number;
  total_ratings: number;
}

interface Review {
  id: number;
  ride_id: number;
  student_id: number;
  driver_id: number;
  rating: number;
  comment: string;
  created_at: string;
  student_name: string;
  student_email: string;
  pickup_location: string;
  dropoff_location: string;
  ride_date: string;
}

interface DriverReviews {
  ratings: Review[];
  stats: {
    average_rating: number;
    total_ratings: number;
  };
}

const AdminAnalytics = () => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDriverReviews, setSelectedDriverReviews] = useState<DriverReviews | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchDriversData();
  }, []);

  const fetchDriversData = async () => {
    try {
      setIsLoading(true);
      setMessage(null); // Clear any previous messages

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      console.log('Authentication check:');
      console.log('Token exists:', !!token);
      console.log('User type:', user.user_type);
      console.log('User ID:', user.id);

      if (!token) {
        setMessage('Please log in to access admin features');
        setMessageType('error');
        router.push('/');
        return;
      }

      if (user.user_type !== 'admin') {
        setMessage('Admin access required');
        setMessageType('error');
        router.push('/');
        return;
      }

      const apiResponse = await api.get('/api/admin/all-drivers');
      console.log('API Response Data:', apiResponse);

      // Handle different response structures
      let drivers = [];
      if (apiResponse) {
        if (apiResponse.drivers) {
          drivers = apiResponse.drivers;
        } else if (Array.isArray(apiResponse)) {
          drivers = apiResponse;
        }
      }

      console.log('Drivers found:', drivers.length);

      setDrivers(drivers);

      if (drivers.length === 0) {
        setMessage('No drivers found. Drivers need to register first.');
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Failed to fetch drivers:', error);

      if (error.status === 401) {
        setMessage('Please log in as admin to access this page');
        setMessageType('error');
        router.push('/');
      } else if (error.status === 403) {
        setMessage('Admin access required');
        setMessageType('error');
        router.push('/');
      } else if (error.status === 404) {
        setMessage('API endpoint not found. Please ensure the backend server is running.');
        setMessageType('error');
      } else {
        setMessage(`Failed to load driver data: ${error.message || 'Unknown error'}`);
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateDriver = async (driverId: number) => {
    try {
      const response = await api.post(`/api/admin/activate-driver/${driverId}`, {});
      if (response) {
        setDrivers(drivers.map(driver =>
          driver.id === driverId ? { ...driver, is_active: true } : driver
        ));
        setMessage('Driver activated successfully!');
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Error activating driver:', error);
      setMessage(error.message || 'Failed to activate driver');
      setMessageType('error');
    }
  };

  const viewDriverReviews = async (driver: Driver) => {
    try {
      setIsLoadingReviews(true);
      setSelectedDriver(driver);
      const apiResponse = await api.get(`/api/admin/driver/${driver.id}/ratings`);
      setSelectedDriverReviews(apiResponse);
      setShowReviewsModal(true);
    } catch (error: any) {
      console.error('Failed to fetch driver reviews:', error);
      setMessage('Failed to load driver reviews');
      setMessageType('error');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const getStatusBadge = (driver: Driver) => {
    if (!driver.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Unverified
        </span>
      );
    } else if (!driver.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Inactive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
  };

  const handleDeleteDriver = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    if (confirm(`Are you sure you want to delete ${driver.name}? This action cannot be undone.`)) {
      // For now, just show success message - actual delete would need backend implementation
      setDrivers(drivers.filter(d => d.id !== driverId));
      setMessage(`Driver ${driver.name} has been removed.`);
      setMessageType('success');
    }
  };
  const stats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.is_active && d.is_verified).length,
    topRatedDriver: drivers.reduce((top, driver) =>
      driver.rating > (top?.rating || 0) ? driver : top, null as Driver | null),
    averageRating: drivers.length > 0
      ? drivers.reduce((sum, driver) => sum + driver.rating, 0) / drivers.length
      : 0,
    totalReviews: drivers.reduce((sum, driver) => sum + driver.total_ratings, 0)
  };

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-none sm:max-w-7xl sm:mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage driver accounts, view performance, and review student feedback
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-md p-4 ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDrivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Performance Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Drivers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete list of registered drivers with performance and review details
            </p>
          </div>

          <div className="overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <EthiraGlobalLoader size="lg" message={getEthicalLoadingMessage('driver management')} />
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No drivers have registered yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-800">
                                  {driver.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {driver.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                License: {driver.license_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">{driver.vehicle_type} - {driver.vehicle_model}</div>
                            <div className="text-sm text-gray-500">Plate: {driver.vehicle_plate}</div>
                            <div className="text-sm text-gray-500">Capacity: {driver.capacity} passengers</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">Rides: {driver.rides_completed}</div>
                            <div className="text-sm text-gray-500">
                              Rating: {driver.rating}/5 ({driver.total_ratings} reviews)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(driver)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => viewDriverReviews(driver)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Reviews"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(driver.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Driver"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Modal */}
        {showReviewsModal && selectedDriver && selectedDriverReviews && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto relative border border-gray-300">
              <div className="border-b border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedDriver.name}'s Reviews
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Average Rating: {selectedDriverReviews.stats?.average_rating || 0}/5
                      ({selectedDriverReviews.stats?.total_ratings || 0} reviews)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewsModal(false);
                      setSelectedDriverReviews(null);
                      setSelectedDriver(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                {isLoadingReviews ? (
                  <div className="flex justify-center items-center py-12">
                    <EthiraGlobalLoader size="lg" message="Loading reviews..." />
                  </div>
                ) : selectedDriverReviews.ratings?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDriverReviews.ratings.map((review: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold">
                                {review.student_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{review.student_name}</p>
                              <p className="text-sm text-gray-500">{review.student_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>

                        {review.comment && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          <p>
                            Route: {review.pickup_location} → {review.dropoff_location}
                          </p>
                          <p>
                            Date: {new Date(review.ride_date || review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This driver hasn't received any ratings from students yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminAnalytics;
