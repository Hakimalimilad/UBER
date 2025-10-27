"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import Card from "../../../components/Card";
import VehicleForm from "../../../components/VehicleForm";
import { Car, Settings } from "lucide-react";

export default function DriverVehicle() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleData, setVehicleData] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const loadUserData = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user);

      // Set vehicle data from user data
      if (user && Object.keys(user).length > 0) {
        setVehicleData({
          vehicle_type: user.vehicle_type || "Sedan",
          seats: user.capacity || 4,
          plate: user.vehicle_plate || "",
          description: user.vehicle_model || "",
          color: user.vehicle_color || "",
          license_number: user.license_number || "",
          make: user.vehicle_type || "Toyota",
          model: user.vehicle_model || "Camry",
          licensePlate: user.vehicle_plate || "NOT SET",
          capacity: user.capacity || 4,
          status: "active",
        });
      }
    };

    loadUserData();

    // Listen for profile updates from other pages (like settings page)
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    setLoading(false);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleVehicleUpdate = async (data) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUpdateMessage("Please login again to update vehicle information.");
        return;
      }

      // Get current user data from localStorage to ensure we send required fields
      const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");

      // Map vehicle form data to backend format
      // IMPORTANT: Include required fields (full_name and email) from current user
      const updateData = {
        full_name: currentUserData.full_name || "",
        email: currentUserData.email || "",
        vehicle_type: data.vehicle_type,
        vehicle_plate: data.plate,
        capacity: data.seats,
        vehicle_model: data.description || "",
        // Include vehicle_color if needed
        vehicle_color: data.color || "",
      };

      const response = await fetch(
        "http://localhost:5000/api/auth/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // IMPORTANT: Data has been saved to DATABASE by backend
        // Now update localStorage for UI consistency (localStorage is just a cache)
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update local state
        setVehicleData({ ...vehicleData, ...updateData });
        setUpdateMessage("Vehicle information updated successfully!");

        // Dispatch event for other pages to update
        window.dispatchEvent(new Event("profileUpdated"));

        setTimeout(() => {
          setUpdateMessage("");
        }, 3000);
      } else {
        setUpdateMessage(
          result.error || "Failed to update vehicle information"
        );
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setUpdateMessage(
        "Network error. Please check your connection and try again."
      );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
              Vehicle Management
            </h1>
          </div>
          <p className="text-gray-600 ml-5">
            Manage your vehicle information and ensure it's up to date for ride
            assignments
          </p>
        </div>

        {/* Success/Error Message */}
        {updateMessage && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              updateMessage.includes("successfully")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  updateMessage.includes("successfully")
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></div>
              {updateMessage}
            </div>
          </div>
        )}

        {/* Current Vehicle Info */}
        {vehicleData && (
          <Card className="mb-8 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Current Vehicle
                  </h2>
                  <p className="text-gray-600">
                    Your registered vehicle information
                  </p>
                </div>
                <div
                  className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                    vehicleData.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {vehicleData.status === "active"
                    ? "Active"
                    : "Pending Approval"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vehicle Make & Model
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                        {vehicleData.vehicle_type}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {vehicleData.model}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      License Plate
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicleData.licensePlate}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Color
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicleData.color}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Passenger Capacity
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicleData.capacity} passengers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Vehicle Form */}
        <Card className="shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Update Vehicle Information
                </h2>
                <p className="text-gray-600">
                  Keep your vehicle details current for optimal service
                </p>
              </div>
            </div>

            <VehicleForm vehicle={vehicleData} onSubmit={handleVehicleUpdate} />
          </div>
        </Card>

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
