"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import Card from "../../../components/Card";
import DriverRideCard from "../../../components/DriverRideCard";
import EmptyState from "../../../components/EmptyState";
import { Clock, RefreshCw, Car } from "lucide-react";

interface RideRequest {
  id: number;
  student_id: number;
  student_name: string;
  student_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  notes?: string;
  created_at: string;
}

export default function DriverAvailableRides() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRides, setAvailableRides] = useState<RideRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [stats, setStats] = useState({
    availableNow: 0,
    totalToday: 0,
    responseRate: 0,
  });

  const fetchAvailableRides = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        "http://localhost:5000/api/driver/available-rides",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableRides(data.rides || []);

        // Fetch driver's own rides for stats
        const driverResponse = await fetch(
          "http://localhost:5000/api/driver/my-rides",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (driverResponse.ok) {
          const driverData = await driverResponse.json();
          const myRides = driverData.rides || [];

          // Get today's date
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Calculate today's rides
          const todayRides = myRides.filter((ride) => {
            if (!ride.pickup_time) return false;
            const rideDate = new Date(ride.pickup_time);
            rideDate.setHours(0, 0, 0, 0);
            return rideDate.getTime() === today.getTime();
          });

          // Calculate response rate (responded rides / total opportunities)
          // Count all rides the driver has ever accepted (accepted, in_progress, completed)
          const availableNowCount = data.rides?.length || 0;
          const respondedRides = myRides.filter(
            (r) => r.status === "accepted" || r.status === "in_progress" || r.status === "completed"
          ).length;
          const totalOpportunities = respondedRides + availableNowCount;
          const responseRate =
            totalOpportunities > 0
              ? Math.round((respondedRides / totalOpportunities) * 100)
              : 0;

          setStats({
            availableNow: data.rides?.length || 0,
            totalToday: todayRides.length,
            responseRate: responseRate,
          });
        }
      } else {
        console.error("Failed to fetch available rides");
        setMessage("Failed to load available rides");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching available rides:", error);
      setMessage("Error loading available rides");
      setMessageType("error");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/driver/accept-ride/${rideId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setMessage("Ride accepted successfully!");
        setMessageType("success");
        // Refresh the list
        fetchAvailableRides();
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to accept ride");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
      setMessage("Error accepting ride");
      setMessageType("error");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.user_type !== "driver") {
      router.push("/");
      return;
    }

    setCurrentUser(user);
    fetchAvailableRides();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Available Rides
                </h1>
              </div>
              <button
                onClick={fetchAvailableRides}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <p className="text-gray-600 ml-5">
              Accept new ride requests from students
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Available Rides */}
          {availableRides.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableRides.map((ride) => (
                <DriverRideCard
                  key={ride.id}
                  ride={ride}
                  onAccept={() => handleAcceptRide(ride.id)}
                  onDecline={() => {
                    // For now, just remove from list (in real app, would update backend)
                    setAvailableRides((prev) =>
                      prev.filter((r) => r.id !== ride.id)
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-lg">
              <EmptyState
                icon={<Car className="w-12 h-12 text-gray-400" />}
                title="No available rides"
                description="There are currently no ride requests available. Check back later!"
              />
            </Card>
          )}

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">
                    Available Now
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.availableNow}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">
                    Total Today
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.totalToday}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.responseRate}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
