"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/MainLayout";
import Card from "../../../components/Card";
import Table from "../../../components/Table";
import EmptyState from "../../../components/EmptyState";
import {
  Car,
  Clock,
  MapPin,
  Star,
  Route,
  CheckCircle,
  Users,
  XCircle,
  User,
} from "lucide-react";
import RatingModal from "../../../components/RatingModal";

export default function StudentRides() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRides, setMyRides] = useState([]);
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    rideId: null,
    driverName: "",
    route: "",
  });

  const fetchRidesData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/student/my-rides",
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

  const handleRateRide = (ride) => {
    setRatingModal({
      isOpen: true,
      rideId: ride.id,
      driverName: ride.driver || ride.driver_name || "Driver",
      route: `${ride.pickup || ride.pickup_location || "Pickup"} → ${
        ride.dropoff || ride.dropoff_location || "Destination"
      }`,
    });
  };

  const handleSubmitRating = async (rating, comment) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/ride/${ratingModal.rideId}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (response.ok) {
        // Refresh rides data to show updated rating
        await fetchRidesData();
        alert("Rating submitted successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.user_type !== "student") {
      router.push("/");
      return;
    }

    fetchRidesData();
  }, [router]);

  const tableColumns = [
    { key: "route", label: "Route", sortable: true },
    { key: "driver", label: "Driver", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "cost", label: "Cost", sortable: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-700 mt-2">
            View your ride history and track ongoing trips
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
                <p className="text-sm font-medium text-gray-700">Avg Rating</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {myRides.filter((ride) => ride.rating).length > 0
                    ? (
                        myRides
                          .filter((ride) => ride.rating)
                          .reduce((sum, ride) => sum + ride.rating, 0) /
                        myRides.filter((ride) => ride.rating).length
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                <Star className="h-8 w-8 text-purple-600" />
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
                              : ride.status === "ongoing"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {ride.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : ride.status === "ongoing" ? (
                            <Car className="w-4 h-4 animate-pulse" />
                          ) : ride.status === "cancelled" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {ride.status
                            ? ride.status.charAt(0).toUpperCase() +
                              ride.status.slice(1)
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

                      {/* Route Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">
                              {ride.pickup ||
                                ride.pickup_location ||
                                "Pickup location"}
                            </p>
                          </div>
                          <div className="ml-1 border-l-2 border-gray-300 h-4"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm font-medium text-gray-900">
                              {ride.dropoff ||
                                ride.dropoff_location ||
                                "Destination"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Driver and Time Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            Driver:{" "}
                            {ride.driver || ride.driver_name || "Not assigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {ride.date || ride.pickup_time || "Scheduled time"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Status and Actions */}
                    <div className="text-right">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                            ride.status === "completed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : ride.status === "ongoing"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {ride.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : ride.status === "ongoing" ? (
                            <Car className="w-4 h-4 animate-pulse" />
                          ) : ride.status === "cancelled" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          {ride.status
                            ? ride.status.charAt(0).toUpperCase() +
                              ride.status.slice(1)
                            : "Pending"}
                        </span>
                      </div>

                      {/* Pending Ride Message */}
                      {(!ride.status || ride.status === "pending") && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                          Waiting for driver to accept your request
                        </div>
                      )}

                      {/* Rating Button for Completed Rides */}
                      {ride.status === "completed" && (
                        <button
                          onClick={() => handleRateRide(ride)}
                          className="mt-3 px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Rate This Ride
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
                  You haven't taken any rides yet. Request your first ride to
                  get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/student")}
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

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() =>
          setRatingModal({
            isOpen: false,
            rideId: null,
            driverName: "",
            route: "",
          })
        }
        onSubmit={handleSubmitRating}
        rideId={ratingModal.rideId}
        driverName={ratingModal.driverName}
        route={ratingModal.route}
      />
    </Layout>
  );
}
