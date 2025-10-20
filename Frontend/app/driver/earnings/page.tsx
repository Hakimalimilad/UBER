'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/Card';
import Table from '../../../components/Table';
import Topbar from '../../../components/Topbar';
import EmptyState from '../../../components/EmptyState';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';

export default function DriverEarnings() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock earnings data
  const [earnings] = useState({
    totalEarned: 1250.75,
    thisMonth: 450.25,
    thisWeek: 125.50,
    today: 45.00,
    totalRides: 67,
    avgPerRide: 18.67
  });

  const [recentEarnings] = useState([
    {
      id: 1,
      date: '2024-10-15',
      rides: 5,
      amount: 95.50,
      tips: 15.00,
      status: 'Paid'
    },
    {
      id: 2,
      date: '2024-10-14',
      rides: 4,
      amount: 78.25,
      tips: 12.50,
      status: 'Paid'
    },
    {
      id: 3,
      date: '2024-10-13',
      rides: 3,
      amount: 62.00,
      tips: 8.75,
      status: 'Pending'
    }
  ]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const tableColumns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'rides', label: 'Rides Completed', sortable: true },
    { key: 'amount', label: 'Base Amount', sortable: true },
    { key: 'tips', label: 'Tips', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
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
              Earnings Dashboard
            </h1>
          </div>
          <p className="text-gray-600 ml-5">
            Track your earnings, view payment history, and manage your finances
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Earned</p>
                <p className="text-2xl font-bold text-green-900">${earnings.totalEarned.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">This Month</p>
                <p className="text-2xl font-bold text-blue-900">${earnings.thisMonth.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Avg per Ride</p>
                <p className="text-2xl font-bold text-purple-900">${earnings.avgPerRide.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Total Rides</p>
                <p className="text-2xl font-bold text-orange-900">{earnings.totalRides}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Earnings Table */}
        <Card className="shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Earnings</h2>
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>

            {recentEarnings.length > 0 ? (
              <Table
                data={recentEarnings}
                columns={tableColumns}
                onRowClick={(earning) => console.log('Earning clicked:', earning)}
              />
            ) : (
              <EmptyState
                icon={<DollarSign className="w-12 h-12 text-gray-400" />}
                title="No earnings yet"
                description="Complete some rides to start earning money!"
              />
            )}
          </div>
        </Card>

        {/* Payout Information */}
        <Card className="mt-8 shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-lg font-semibold text-gray-900">Direct Deposit</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Details</label>
                  <p className="text-lg font-semibold text-gray-900">**** **** **** 1234</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Payout Date</label>
                  <p className="text-lg font-semibold text-gray-900">October 20, 2024</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pending Amount</label>
                  <p className="text-lg font-semibold text-green-600">$62.00</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
