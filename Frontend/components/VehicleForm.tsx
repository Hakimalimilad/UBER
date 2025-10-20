'use client';

import { useState } from 'react';

interface VehicleFormProps {
  vehicle?: any;
  onSubmit: (data: any) => void | Promise<void>;
  loading?: boolean;
}

const VehicleForm = ({ vehicle, onSubmit, loading = false }: VehicleFormProps) => {
  const [formData, setFormData] = useState({
    vehicle_type: vehicle?.vehicle_type || 'Sedan',
    seats: vehicle?.seats || 4,
    plate: vehicle?.plate || '',
    description: vehicle?.description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
        <select
          name="vehicle_type"
          value={formData.vehicle_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Van">Van</option>
          <option value="Bus">Bus</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
        <input
          type="number"
          name="seats"
          value={formData.seats}
          onChange={handleChange}
          min="1"
          max="20"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
        <input
          type="text"
          name="plate"
          value={formData.plate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? 'Saving...' : 'Save Vehicle'}
      </button>
    </form>
  );
};

export default VehicleForm;
