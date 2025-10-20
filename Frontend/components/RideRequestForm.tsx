'use client';

import { useState } from 'react';

interface RideRequestFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const RideRequestForm = ({ onSubmit, loading = false }: RideRequestFormProps) => {
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    datetime: '',
    seats_required: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
        <input
          type="text"
          name="pickup"
          value={formData.pickup}
          onChange={handleChange}
          placeholder="e.g., Main Campus Gate"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
        <input
          type="text"
          name="dropoff"
          value={formData.dropoff}
          onChange={handleChange}
          placeholder="e.g., Downtown Mall"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
        <input
          type="datetime-local"
          name="datetime"
          value={formData.datetime}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Seats Required</label>
        <input
          type="number"
          name="seats_required"
          value={formData.seats_required}
          onChange={handleChange}
          min="1"
          max="8"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? 'Requesting...' : 'Request Ride'}
      </button>
    </form>
  );
};

export default RideRequestForm;
