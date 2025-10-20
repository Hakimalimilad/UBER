'use client';

import { useState } from 'react';

interface ProfileFormProps {
  user: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const ProfileForm = ({ user, onSubmit, loading = false }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Student specific fields
    student_id: user?.student_id || '',
    pickup_location: user?.pickup_location || '',
    dropoff_location: user?.dropoff_location || '',
    parent_name: user?.parent_name || '',
    parent_phone: user?.parent_phone || '',
    emergency_contact: user?.emergency_contact || '',
    // Driver specific fields
    license_number: user?.license_number || '',
    vehicle_type: user?.vehicle_type || 'Sedan',
    vehicle_model: user?.vehicle_model || '',
    vehicle_plate: user?.vehicle_plate || '',
    capacity: user?.capacity || 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // shared input class for consistent styling and strong contrast
  const inputClass =
    'w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition';

  const selectClass =
    'w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition';

  const labelClass = 'block text-sm font-semibold text-gray-800 mb-1';

  return (
    // panel background so white inputs are visible on white pages
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Email {user?.user_type === 'student' && '(Readonly - contact admin to change)'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={user?.user_type === 'student'}
              className={`${inputClass} ${user?.user_type === 'student' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        {user?.user_type === 'student' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Student Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Student ID</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. STU001"
                />
              </div>

              <div>
                <label className={labelClass}>Parent Name</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Parent Phone</label>
                <input
                  type="tel"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Pickup Location</label>
                <input
                  type="text"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Main Campus Gate"
                />
              </div>

              <div>
                <label className={labelClass}>Drop-off Location</label>
                <input
                  type="text"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Downtown Mall"
                />
              </div>
            </div>
          </div>
        )}

        {/* Driver Specific Fields */}
        {user?.user_type === 'driver' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Driver Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>License Number</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. DL123456"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Vehicle Capacity</label>
                <select
                  name="capacity"
                  value={String(formData.capacity)}
                  onChange={handleChange}
                  className={selectClass}
                  required
                >
                  <option value="1">1 passenger</option>
                  <option value="2">2 passengers</option>
                  <option value="3">3 passengers</option>
                  <option value="4">4 passengers</option>
                  <option value="5">5 passengers</option>
                  <option value="6">6 passengers</option>
                  <option value="7">7 passengers</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  className={selectClass}
                  required
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Vehicle Model</label>
                <input
                  type="text"
                  name="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Toyota Camry 2020"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Vehicle Plate Number</label>
              <input
                type="text"
                name="vehicle_plate"
                value={formData.vehicle_plate}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. ABC123"
                required
              />
            </div>
          </div>
        )}

        {/* Admin Specific Fields */}
        {user?.user_type === 'admin' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Admin Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                As an admin, you have full access to the system. Your profile information is used for system notifications and audit logs.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
