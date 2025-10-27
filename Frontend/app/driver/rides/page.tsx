"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import Card from "../../../components/Card";
import Table from "../../../components/Table";
import EmptyState from "../../../components/EmptyState";
import {
  Car,
  MapPin,
  Clock,
  User,
  Star,
  Route,
  CheckCircle,
  DollarSign,
  XCircle,
  Play,
  MapPinIcon,
} from "lucide-react";

export default function DriverRides() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRides, setMyRides] = useState([]);

  const fetchRidesData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/driver/my-rides",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyRides(data.rides || []);
        setCurrentUser(data.user);
      } else {
        console.error("Failed to fetch rides data");
      }
    } catch (error) {
      console.error("Error fetching rides data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ride/${rideId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Refresh the rides data
        fetchRidesData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update ride status");
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
      alert("Error updating ride status");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.user_type !== "driver") {
      router.push("/");
      return;
    }

    fetchRidesData();
  }, [router]);

  const tableColumns = [
    { key: "student", label: "Student", sortable: true },
    { key: "route", label: "Route", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "earnings", label: "Earnings", sortable: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-700 mt-2">
            View your completed rides, track earnings, and manage ongoing trips
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Rides</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {myRides.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg">
                <Route className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {myRides.filter((ride) => ride.status === "Completed").length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  $
                  {myRides
                    .reduce((sum, ride) => sum + (ride.earnings || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ride History ({myRides.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {myRides.length > 0 ? (
              myRides.map((ride) => (
                <div
                  key={ride.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section - Ride Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                            ride.status === "completed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ride.status === "accepted" ||
                                ride.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {ride.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : ride.status === "accepted" ||
                            ride.status === "in_progress" ? (
                            <Car className="w-4 h-4 animate-pulse" />
                          ) : ride.status === "cancelled" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {ride.status
                            ? ride.status.charAt(0).toUpperCase() +
                              ride.status.slice(1).replace("_", " ")
                            : "Pending"}
                        </span>

                        {/* Ride ID */}
                        <span className="text-sm text-gray-500">
                          #
                          {ride.id
                            ? ride.id.toString().padStart(4, "0")
                            : "N/A"}
                        </span>
                      </div>

                      {/* Passengers Info */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Passengers ({ride.passengers?.length || 1})
                        </p>
                        <div className="space-y-2">
                          {(
                            ride.passengers || [
                              {
                                student_name:
                                  ride.student_name ||
                                  ride.student ||
                                  "Student",
                                student_phone: ride.student_phone || "No phone",
                                student_email: ride.student_email || "",
                              },
                            ]
                          ).map((passenger, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="p-1.5 bg-indigo-100 rounded">
                                <User className="h-3.5 w-3.5 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {passenger.student_name || "Student"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {passenger.student_phone && (
                                    <span className="flex items-center gap-1">
                                      <span>📞</span> {passenger.student_phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {passenger.student_phone && (
                                <a
                                  href={`tel:${passenger.student_phone}`}
                                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                  title="Call student"
                                >
                                  Call
                                </a>
                              )}
                            </div>
                          ))}
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
                            <p className="text-sm font-medium text-gray-900">
                              {ride.pickup_location ||
                                ride.pickup ||
                                "Pickup location"}
                            </p>
                          </div>
                          <div className="ml-1 border-l-2 border-gray-300 h-4"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">
                              {ride.dropoff_location ||
                                ride.dropoff ||
                                "Destination"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time and Date Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {ride.pickup_time || ride.time || "Scheduled time"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {ride.pickup_time
                              ? new Date(ride.pickup_time).toLocaleDateString()
                              : ride.date || "Date"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Earnings and Actions */}
                    <div className="text-right ml-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Earnings</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${ride.earnings || 0}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                            ride.status === "completed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ride.status === "accepted" ||
                                ride.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {ride.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : ride.status === "accepted" ||
                            ride.status === "in_progress" ? (
                            <Car className="w-4 h-4 animate-pulse" />
                          ) : ride.status === "cancelled" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {ride.status
                            ? ride.status.charAt(0).toUpperCase() +
                              ride.status.slice(1).replace("_", " ")
                            : "Pending"}
                        </span>
                      </div>

                      {/* Status Update Buttons */}
                      {ride.status === "accepted" && (
                        <button
                          onClick={() =>
                            updateRideStatus(ride.id, "in_progress")
                          }
                          className="w-full mb-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Start Ride
                        </button>
                      )}
                      {ride.status === "in_progress" && (
                        <button
                          onClick={() => updateRideStatus(ride.id, "completed")}
                          className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <MapPinIcon className="w-4 h-4" />
                          Complete Ride
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No rides yet
                </h3>
                <p className="text-gray-600">
                  You haven't completed any rides yet. Accept ride requests to
                  get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ongoing Rides Section */}
        {myRides.some((ride) => ride.status === "Ongoing") && (
          <Card className="mt-8 shadow-lg border-orange-200 bg-orange-50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Ongoing Rides
                  </h2>
                  <p className="text-gray-600">Rides currently in progress</p>
                </div>
              </div>

              <div className="space-y-4">
                {myRides
                  .filter((ride) => ride.status === "Ongoing")
                  .map((ride) => (
                    <div
                      key={ride.id}
                      className="bg-white rounded-lg p-4 border border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {ride.student}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {ride.route}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Earnings so far
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ${ride.earnings}
                          </div>
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
            onClick={() => router.push("/driver")}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
