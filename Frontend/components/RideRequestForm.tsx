"use client";

import { useState } from "react";
import { MapPin, Clock, MessageSquare, Car, AlertCircle } from "lucide-react";

interface RideRequestFormProps {
  onSubmit: (data: RideRequestData) => void;
  loading?: boolean;
}

interface RideRequestData {
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  notes: string;
}

export default function RideRequestForm({
  onSubmit,
  loading = false,
}: RideRequestFormProps) {
  const [formData, setFormData] = useState<RideRequestData>({
    pickup_location: "",
    dropoff_location: "",
    pickup_time: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = "Pickup location is required";
    }

    if (!formData.dropoff_location.trim()) {
      newErrors.dropoff_location = "Dropoff location is required";
    }

    if (!formData.pickup_time) {
      newErrors.pickup_time = "Pickup time is required";
    } else {
      const selectedTime = new Date(formData.pickup_time);
      const now = new Date();

      if (selectedTime <= now) {
        newErrors.pickup_time = "Pickup time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  // shared input class for consistent styling and strong contrast
  const inputClass =
    "w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pickup Location
          </label>
          <input
            type="text"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            placeholder="e.g., Main Campus, Library, Dormitory"
            className={`${inputClass} ${
              errors.pickup_location ? "border-red-300 bg-red-50" : ""
            }`}
          />
          {errors.pickup_location && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.pickup_location}
            </p>
          )}
        </div>

        {/* Dropoff Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Dropoff Location
          </label>
          <input
            type="text"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            placeholder="e.g., Downtown, Airport, Shopping Mall"
            className={`${inputClass} ${
              errors.dropoff_location ? "border-red-300 bg-red-50" : ""
            }`}
          />
          {errors.dropoff_location && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.dropoff_location}
            </p>
          )}
        </div>

        {/* Pickup Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Preferred Pickup Time
          </label>
          <input
            type="datetime-local"
            name="pickup_time"
            value={formData.pickup_time}
            onChange={handleChange}
            min={getMinDateTime()}
            className={`${inputClass} ${
              errors.pickup_time ? "border-red-300 bg-red-50" : ""
            }`}
          />
          {errors.pickup_time && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.pickup_time}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Minimum 30 minutes from now
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any special requirements, landmarks, or instructions for the driver..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Request...
              </>
            ) : (
              <>
                <Car className="w-4 h-4 mr-2" />
                Request Ride
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works</h3>
            <div className="mt-1 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Your request will be sent to available drivers</li>
                <li>First driver to accept will be assigned to you</li>
                <li>You'll receive driver details and contact information</li>
                <li>
                  Driver will pick you up at the specified time and location
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
