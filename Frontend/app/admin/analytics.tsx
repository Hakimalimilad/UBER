import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Activity, 
  Calendar,
  DollarSign,
  Route,
  AlertTriangle,
  Star,
  Zap,
  Loader2
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

interface AnalyticsData {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalStudents: number;
  activeStudents: number;
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number;
  totalRevenue: number;
  rideVolumeData: Array<{ date: string; rides: number; completed: number; cancelled: number }>;
  driverPerformanceData: Array<{ driver: string; rides: number; rating: number }>;
  routeEfficiencyData: Array<{ route: string; efficiency: number; time: number }>;
  safetyIncidents: number;
  onTimePercentage: number;
}

const AdminAnalytics = () => {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalyticsData(response.data || null);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      if (error.response?.status === 401) {
        setMessage('Please log in to access admin features');
        setMessageType('error');
        router.push('/login');
      } else {
        setMessage('Failed to load analytics data');
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-none sm:max-w-7xl sm:mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transport Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitor student transport operations and performance metrics
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
                <AlertTriangle className="h-5 w-5 text-red-400" />
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalRides || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.activeStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Car className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.activeDrivers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On-Time Percentage</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.onTimePercentage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safety Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.safetyIncidents || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Volume Chart */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daily Ride Volume</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track ride requests and completions over the last 7 days
          </p>
        </div>
        <div className="p-6">
          {analyticsData?.rideVolumeData && analyticsData.rideVolumeData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.rideVolumeData.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-900">{formatDate(day.date)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.rides / Math.max(...analyticsData.rideVolumeData.map(d => d.rides))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{day.rides} rides</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No ride data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Performance */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Driver Performance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Top performing drivers based on rides completed and ratings
          </p>
        </div>
        <div className="p-6">
          {analyticsData?.driverPerformanceData && analyticsData.driverPerformanceData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.driverPerformanceData.slice(0, 5).map((driver, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-800">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{driver.driver}</p>
                      <p className="text-sm text-gray-600">{driver.rides} rides completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{driver.rating}/5</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No driver performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Route Efficiency */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Route Efficiency</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitor route performance and average travel times
          </p>
        </div>
        <div className="p-6">
          {analyticsData?.routeEfficiencyData && analyticsData.routeEfficiencyData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.routeEfficiencyData.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Route className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{route.route}</p>
                      <p className="text-sm text-gray-600">{route.time} minutes average</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{route.efficiency}%</p>
                    <p className="text-sm text-gray-600">Efficiency</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No route data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <EthiraGlobalLoader size="lg" message={getEthicalLoadingMessage('admin')} />
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
