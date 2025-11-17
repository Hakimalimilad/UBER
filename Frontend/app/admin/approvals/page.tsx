"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";

interface PendingUser {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
  created_at: string;
}

export default function AdminApprovals() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/admin/pending-users",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.users || []);
      } else if (response.status === 403) {
        setMessage("Access denied. Please log in as admin.");
        setMessageType("error");
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
      setMessage("Failed to load pending users");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: number) => {
    try {
      setProcessingUserId(userId);
      setMessage("");
      const response = await fetch(
        `http://localhost:5000/api/admin/approve-user/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "User approved successfully!");
        setMessageType("success");
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        throw new Error(data.error || "Failed to approve user");
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to approve user");
      setMessageType("error");
    } finally {
      setProcessingUserId(null);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.user_type !== "admin") {
      router.push("/");
      return;
    }
    fetchPendingUsers();
  }, [router]);

  // Mock data removed - now using real API data

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
        {message && (
          <div
            className={`mb-6 rounded-lg p-4 shadow-md ${
              messageType === "success" 
                ? "bg-green-100 border-l-4 border-green-500" 
                : "bg-red-100 border-l-4 border-red-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {messageType === "success" ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <p 
                  className={`text-base font-semibold ${
                    messageType === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {message}
                </p>
              </div>
              <button 
                onClick={() => setMessage("")}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Dismiss message"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Email Verified
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.length}
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
                <p className="text-sm font-medium text-gray-600">
                  Ready to Approve
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending User Approvals
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Users who have verified their email and are waiting for admin
              approval
            </p>
          </div>

          <div className="overflow-hidden">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No pending users
                </h3>
                <p className="text-sm text-gray-500">
                  All registered users have been approved or there are no new
                  registrations.
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
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
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
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.user_type === "student"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.user_type.charAt(0).toUpperCase() +
                              user.user_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Email Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => approveUser(user.id)}
                            disabled={processingUserId === user.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingUserId === user.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve User
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
