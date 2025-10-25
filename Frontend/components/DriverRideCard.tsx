"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Ride {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  notes?: string;
  student_name: string;
  student_phone?: string;
  created_at: string;
}

interface DriverRideCardProps {
  ride: Ride;
  onAccept: (rideId: number) => void;
  onDecline: (rideId: number) => void;
  loading?: boolean;
}

export default function DriverRideCard({
  ride,
  onAccept,
  onDecline,
  loading = false,
}: DriverRideCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilPickup = (pickupTime: string) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diffMs = pickup.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      return "Overdue";
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const isUrgent = () => {
    const now = new Date();
    const pickup = new Date(ride.pickup_time);
    const diffMs = pickup.getTime() - now.getTime();
    return diffMs < 30 * 60 * 1000; // Less than 30 minutes
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-l-4 ${
        isUrgent() ? "border-red-500" : "border-indigo-500"
      } transition-all duration-200 hover:shadow-lg`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {ride.pickup_location} → {ride.dropoff_location}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDateTime(ride.pickup_time)}</span>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
                {getTimeUntilPickup(ride.pickup_time)}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{ride.student_name}</span>
              {ride.student_phone && (
                <span className="ml-2 text-gray-500">
                  • {ride.student_phone}
                </span>
              )}
            </div>
          </div>

          {isUrgent() && (
            <div className="flex items-center text-red-600 text-xs font-medium">
              <AlertCircle className="w-4 h-4 mr-1" />
              URGENT
            </div>
          )}
        </div>

        {/* Notes Preview */}
        {ride.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <span className="font-medium">Note:</span>{" "}
            {ride.notes.length > 100
              ? `${ride.notes.substring(0, 100)}...`
              : ride.notes}
            {ride.notes.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-indigo-600 hover:text-indigo-800"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Expanded Notes */}
        {isExpanded && ride.notes && ride.notes.length > 100 && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
            {ride.notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex space-x-3">
        <button
          onClick={() => onAccept(ride.id)}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept Ride
        </button>

        <button
          onClick={() => onDecline(ride.id)}
          disabled={loading}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Decline
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
}
