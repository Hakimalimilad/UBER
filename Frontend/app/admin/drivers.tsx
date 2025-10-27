import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { Users, Search, Filter, Eye, XCircle, CheckCircle, Clock, Car, Phone, Calendar, User, Trash2, X, MapPin, Shield, Loader2 } from 'lucide-react';
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
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_plate: string;
  capacity: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  rides_completed: number;
  rating: number;
  total_ratings: number;
}

interface Statistics {
  total_drivers: number;
  active_drivers: number;
  inactive_drivers: number;
  verified_drivers: number;
}

const AdminDriversPage = () => {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total_drivers: 0,
    active_drivers: 0,
    inactive_drivers: 0,
    verified_drivers: 0
  });
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedDriverReviews, setSelectedDriverReviews] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    fetchAllDrivers();
  }, []);

  const fetchAllDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/all-drivers');
      setDrivers(response.data.drivers || []);
      setStatistics(response.data.statistics || {
        total_drivers: 0,
        active_drivers: 0,
        inactive_drivers: 0,
        verified_drivers: 0
      });
    } catch (error: any) {
      console.error('Failed to fetch drivers:', error);
      if (error.response?.status === 401) {
        setMessage('Please log in to access admin features');
        setMessageType('error');
        router.push('/login');
      } else {
        setMessage('Failed to load drivers');
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (driver: Driver) => {
    if (!driver.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Unverified
        </span>
      );
    } else if (!driver.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Inactive
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const viewDriverReviews = async (driver: Driver) => {
    try {
      setIsLoadingReviews(true);
      setSelectedDriver(driver);
      const response = await api.get(`/api/admin/driver/${driver.id}/ratings`);
      setSelectedDriverReviews(response.data);
      setShowReviewsModal(true);
    } catch (error: any) {
      console.error('Failed to fetch driver reviews:', error);
      setMessage('Failed to load driver reviews');
      setMessageType('error');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleActivateDriver = async (driverId: number) => {
    try {
      const response = await api.post(`/admin/activate-driver/${driverId}`,{});
      if (response.status === 200) {
        setDrivers(drivers.map(driver => 
          driver.id === driverId ? { ...driver, is_active: true } : driver
        ));
        setSelectedDriver(prev => prev ? { ...prev, is_active: true } : null);
        setMessage('Driver reactivated successfully!');
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Error reactivating driver:', error);
      setMessage(error.response?.data?.error || 'Failed to reactivate driver');
      setMessageType('error');
    }
  };

  const handleDeleteDriver = (driverId: number) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;

    try {
      const response = await api.delete(`/admin/delete-driver/${driverToDelete.id}`);
      if (response.status === 200) {
        setDrivers(drivers.filter(d => d.id !== driverToDelete.id));
        setSelectedDriver(null);
        setMessage(`Driver ${driverToDelete.name} has been deleted.`);
        setMessageType('success');
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      setMessage(error.response?.data?.error || 'Failed to delete driver');
      setMessageType('error');
    } finally {
      setShowDeleteModal(false);
      setDriverToDelete(null);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-none sm:max-w-7xl sm:mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage driver accounts and vehicle information
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
                <XCircle className="h-5 w-5 text-red-400" />
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
              <p className="text-2xl font-bold text-gray-900">{statistics.total_drivers}</p>
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
              <p className="text-2xl font-bold text-gray-900">{statistics.active_drivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.inactive_drivers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.verified_drivers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Drivers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete list of registered drivers with vehicle and performance details
          </p>
        </div>

        <div className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <EthiraGlobalLoader size="lg" message={getEthicalLoadingMessage('admin')} />
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
                      Contact Info
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.email}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
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
                            onClick={() => viewDriverDetails(driver)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => viewDriverReviews(driver)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Reviews"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
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

      {/* Driver Details Modal */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-300">
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Driver Details</h2>
                <button
                  onClick={() => {
                    setSelectedDriver(null);
                    setShowDriverModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.phone}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">License Number</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.license_number}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle Type</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.vehicle_type}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle Model</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.vehicle_model}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle Plate</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.vehicle_plate}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Capacity</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.capacity} passengers</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rides Completed</label>
                  <p className="text-sm font-medium text-gray-900">{selectedDriver.rides_completed}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Rating</label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDriver.rating}/5 ({selectedDriver.total_ratings} reviews)
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Registration Date</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedDriver.created_at)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Last Login</label>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedDriver.last_login)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && driverToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-300">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900">Delete Driver</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete {driverToDelete.name}? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 p-5 border-t">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDriverToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDriver}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
