'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { Users, Car, Clock, CheckCircle, TrendingUp, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRides: number;
  activeRides: number;
  totalDrivers: number;
  activeDrivers: number;
  totalStudents: number;
  pendingApprovals: number;
  todayRides: number;
  completedRides: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRides: 0,
    activeRides: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    totalStudents: 0,
    pendingApprovals: 0,
    todayRides: 0,
    completedRides: 0
  });

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5000/api/admin/pending-users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      let users: any[] = [];
      let pending: any[] = [];

      if (usersRes.ok) {
        const data = await usersRes.json();
        users = data.users || [];
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        pending = data.users || [];
      }

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.is_verified && u.is_approved).length,
        totalDrivers: users.filter((u: any) => u.user_type === 'driver').length,
        activeDrivers: users.filter((u: any) => u.user_type === 'driver' && u.is_approved).length,
        totalStudents: users.filter((u: any) => u.user_type === 'student').length,
        pendingApprovals: pending.length,
        totalRides: 0,
        activeRides: 0,
        todayRides: 0,
        completedRides: 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.user_type !== 'admin') {
      router.push('/');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await fetchDashboardStats();
      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-700 mt-2">Welcome back! Here's what's happening with your platform today.</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 mt-2">
                  <span className="font-medium">{stats.activeUsers}</span> active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Drivers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDrivers}</p>
                <p className="text-sm text-green-600 mt-2">
                  <span className="font-medium">{stats.activeDrivers}</span> active
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Car className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</p>
                <p className="text-sm text-gray-700 mt-2">Registered</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
                <p className="text-sm text-yellow-600 mt-2">Awaiting review</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Rides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedRides}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Rides</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayRides}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
