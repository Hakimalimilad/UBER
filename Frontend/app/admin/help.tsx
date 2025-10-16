import React, { useState } from 'react';
import { Car, Users, Route, Clock, DollarSign, Star, AlertTriangle, HelpCircle, BookOpen, ChevronDown, ChevronRight, TrendingUp, Activity } from 'lucide-react';

const AnalyticsHelp = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['kpi-metrics']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transport Analytics Documentation</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Complete guide to Student Transport Platform analytics metrics, formulas, and interpretations</p>
              </div>
            </div>
          </div>

          {/* Navigation Overview */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Documentation Sections
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <button onClick={() => toggleSection('kpi-metrics')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">1. KPI Metrics Overview</button>
                <button onClick={() => toggleSection('ride-analytics')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">2. Ride Analytics</button>
                <button onClick={() => toggleSection('driver-performance')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">3. Driver Performance Metrics</button>
                <button onClick={() => toggleSection('route-efficiency')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">4. Route Efficiency Analytics</button>
                <button onClick={() => toggleSection('safety-metrics')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">5. Safety & Reliability Metrics</button>
                <button onClick={() => toggleSection('data-sources')} className="w-full text-left block text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base py-1">6. Data Sources & Updates</button>
              </div>
            </div>
          </div>

          {/* KPI Metrics Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('kpi-metrics')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-200" />
                KPI Metrics Overview
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('kpi-metrics') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('kpi-metrics') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Total Rides */}
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Total Rides</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Total number of ride requests processed in the last 30 days</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs sm:text-sm font-mono overflow-x-auto">
                      <strong>SQL Query:</strong><br />
                      SELECT COUNT(*) FROM rides<br />
                      WHERE created_at &gt;= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Measures overall platform usage and transport demand</p>
                  </div>

                  {/* Active Students */}
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Active Students</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Students who have used the platform in the last 7 days</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs sm:text-sm font-mono overflow-x-auto">
                      <strong>SQL Query:</strong><br />
                      SELECT COUNT(DISTINCT student_id) FROM rides<br />
                      WHERE created_at &gt;= DATE_SUB(NOW(), INTERVAL 7 DAY)<br />
                      AND status = 'completed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Indicates student engagement and platform adoption</p>
                  </div>

                  {/* Active Drivers */}
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Car className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Active Drivers</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Drivers who have completed rides in the last 7 days</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs sm:text-sm font-mono overflow-x-auto">
                      <strong>SQL Query:</strong><br />
                      SELECT COUNT(DISTINCT driver_id) FROM rides<br />
                      WHERE created_at &gt;= DATE_SUB(NOW(), INTERVAL 7 DAY)<br />
                      AND status = 'completed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Shows driver availability and platform utilization</p>
                  </div>

                  {/* Average Rating */}
                  <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Average Rating</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Average driver rating from student feedback</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs sm:text-sm font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      AVG(rating) FROM ride_feedback<br />
                      WHERE created_at &gt;= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Measures service quality and driver performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Analytics Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('ride-analytics')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 transition-transform duration-200" />
                Ride Analytics
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('ride-analytics') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('ride-analytics') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Total Revenue</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Cumulative revenue from completed rides</p>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      SUM(ride_cost) FROM rides<br />
                      WHERE status = 'completed'<br />
                      AND created_at &gt;= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Tracks financial performance of the transport service</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">On-Time Performance</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Percentage of rides that arrived on time</p>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      (COUNT(CASE WHEN actual_arrival &lt;= scheduled_arrival THEN 1 END) / COUNT(*)) × 100<br />
                      FROM rides WHERE status = 'completed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Business Value:</strong> Measures reliability and punctuality of the service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Performance Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('driver-performance')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 transition-transform duration-200" />
                Driver Performance Metrics
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('driver-performance') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('driver-performance') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Rides Completed</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Total rides successfully completed by each driver</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs font-mono overflow-x-auto">
                      <strong>SQL Query:</strong><br />
                      SELECT driver_id, COUNT(*) as rides_completed<br />
                      FROM rides<br />
                      WHERE status = 'completed'<br />
                      GROUP BY driver_id<br />
                      ORDER BY rides_completed DESC
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Driver Ratings</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Average rating received from students</p>
                    <div className="bg-white rounded p-2 sm:p-3 text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      AVG(rating) FROM ride_feedback<br />
                      WHERE driver_id = ?<br />
                      GROUP BY driver_id
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Efficiency Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('route-efficiency')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Route className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 transition-transform duration-200" />
                Route Efficiency Analytics
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('route-efficiency') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('route-efficiency') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="space-y-3 sm:space-y-4">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Average Travel Time</h3>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      AVG(TIMESTAMPDIFF(MINUTE, pickup_time, dropoff_time))<br />
                      FROM rides WHERE status = 'completed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Performance Benchmarks:</strong></p>
                    <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-1">
                      <li>Excellent: &lt; 30 minutes</li>
                      <li>Good: 30-45 minutes</li>
                      <li>Needs optimization: &gt; 45 minutes</li>
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Route Utilization</h3>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      (rides_per_route / max_capacity) × 100<br />
                      GROUP BY route_id
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Metrics Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('safety-metrics')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 transition-transform duration-200" />
                Safety & Reliability Metrics
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('safety-metrics') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('safety-metrics') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800 text-sm sm:text-base">Safety First Priority</span>
                  </div>
                  <p className="text-red-700 text-xs sm:text-sm">Monitoring safety incidents and system reliability for student transport</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Safety Incidents Tracking</h3>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>SQL Query:</strong><br />
                      SELECT COUNT(*) FROM safety_incidents<br />
                      WHERE reported_at &gt;= DATE_SUB(NOW(), INTERVAL 30 DAY)<br />
                      AND status = 'confirmed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Target:</strong> Zero safety incidents for optimal performance</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">System Reliability</h3>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded border text-xs font-mono overflow-x-auto">
                      <strong>Calculation:</strong><br />
                      reliability = (successful_rides / total_rides) × 100<br />
                      successful_rides = status = 'completed'
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2"><strong>Target:</strong> &gt;95% for production systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 transition-all duration-300 hover:shadow-md">
            <button 
              onClick={() => toggleSection('data-sources')}
              className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all duration-200 rounded-lg sm:rounded-xl"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform duration-200" />
                Data Sources & Updates
              </h2>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isExpanded('data-sources') ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded('data-sources') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Primary Data Sources</h3>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                      <li>• <strong>students:</strong> Student registration and activity tracking</li>
                      <li>• <strong>drivers:</strong> Driver profiles and performance data</li>
                      <li>• <strong>rides:</strong> Ride requests, status, and completion data</li>
                      <li>• <strong>ride_feedback:</strong> Student ratings and feedback</li>
                      <li>• <strong>safety_incidents:</strong> Safety reports and incident tracking</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Update Frequency</h3>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                      <li>• <strong>Real-time:</strong> Ride status updates, location tracking</li>
                      <li>• <strong>Hourly:</strong> Performance aggregations</li>
                      <li>• <strong>Daily:</strong> Aggregated analytics and reports</li>
                      <li>• <strong>Weekly:</strong> Performance benchmarks and trends</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsHelp;
