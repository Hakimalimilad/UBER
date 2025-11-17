"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import {
  Users,
  CheckCircle,
  Clock,
  UserCheck,
  Mail,
  Calendar,
  Loader2,
  Eye,
  GraduationCap,
  Car,
  Search,
  Filter,
  Trash2,
  AlertTriangle,
  X
} from "lucide-react";

interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
  created_at: string;
  profile_picture?: string;
  is_verified: boolean;
  is_approved: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "student" | "driver">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "unverified"
  >("all");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      setCurrentUserId(user.id);
    }
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 403) {
        setMessage("Access denied. Please log in as admin.");
        setMessageType("error");
        router.push("/");
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      setMessage("Failed to load users");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'User deleted successfully');
        setMessageType('success');
        // Remove the deleted user from the list
        setUsers(users.filter(user => user.id !== userId));
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setMessage(error.message || 'Failed to delete user');
      setMessageType('error');
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  const getUserTypeDisplay = (userType: string) => {
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  // Filter and search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTypeFilter =
      filterType === "all" || user.user_type === filterType;

    // Status filter logic
    let matchesStatusFilter = true;
    if (statusFilter === "approved") {
      matchesStatusFilter = user.is_approved && user.is_verified;
    } else if (statusFilter === "pending") {
      matchesStatusFilter = user.is_verified && !user.is_approved;
    } else if (statusFilter === "unverified") {
      matchesStatusFilter = !user.is_verified;
    }

    return matchesSearch && matchesTypeFilter && matchesStatusFilter;
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    approved: users.filter((u) => u.is_approved && u.is_verified).length,
    pending: users.filter((u) => u.is_verified && !u.is_approved).length,
    unverified: users.filter((u) => !u.is_verified).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-indigo-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-700 mt-2">
            View and manage all registered users
          </p>
        </div>

        {/* Main Content */}
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              {messageType === "success" ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <div className="w-5 h-5 mr-2 text-red-500">⚠️</div>
              )}
              {message}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unverified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unverified}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* User Type Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as "all" | "student" | "driver"
                    )
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-gray-900"
                >
                  <option value="all" className="text-gray-900">
                    All Types
                  </option>
                  <option value="student" className="text-gray-900">
                    Students Only
                  </option>
                  <option value="driver" className="text-gray-900">
                    Drivers Only
                  </option>
                </select>
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "all"
                        | "approved"
                        | "pending"
                        | "unverified"
                    )
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-gray-900"
                >
                  <option value="all" className="text-gray-900">
                    All Status
                  </option>
                  <option value="approved" className="text-gray-900">
                    Approved
                  </option>
                  <option value="pending" className="text-gray-900">
                    Pending
                  </option>
                  <option value="unverified" className="text-gray-900">
                    Unverified
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete list of all registered users with their current status
            </p>
          </div>

          <div className="overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-sm text-gray-500">
                  No users match your current search and filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile_picture ? (
                                <img
                                  src={user.profile_picture}
                                  alt={user.full_name}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 font-semibold">
                                    {user.full_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              user.user_type === "student"
                                ? "bg-blue-100 text-blue-700"
                                : user.user_type === "driver"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {user.user_type === "student" ? (
                              <GraduationCap className="w-4 h-4 mr-1.5" />
                            ) : user.user_type === "driver" ? (
                              <Car className="w-4 h-4 mr-1.5" />
                            ) : (
                              <UserCheck className="w-4 h-4 mr-1.5" />
                            )}
                            {getUserTypeDisplay(user.user_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_approved && user.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : user.is_verified && !user.is_approved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Mail className="w-3 h-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              router.push(`/admin/view-user/${user.id}`)
                            }
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </button>
                          {currentUserId !== user.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteUserId(user.id);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                User Management Overview
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Unverified:</strong> Users who haven't verified
                    their email yet
                  </li>
                  <li>
                    <strong>Pending:</strong> Email verified users waiting for
                    admin approval
                  </li>
                  <li>
                    <strong>Approved:</strong> Fully verified and approved users
                    who can use the platform
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteUserId !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
              <button
                onClick={() => setDeleteUserId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                disabled={isDeleting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setDeleteUserId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                  onClick={() => handleDeleteUser(deleteUserId)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
