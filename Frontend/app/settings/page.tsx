"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import {
  Settings,
  Lock,
  Shield,
  User,
  Building2,
  Mail,
  Camera,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const SettingsPage = () => {
  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePicture: "",
    user_type: "",
    // Driver-specific fields
    license_number: "",
    vehicle_model: "",
    vehicle_plate: "",
    vehicle_color: "",
    // Student-specific fields
    student_id: "",
    major: "",
    year: "",
    campus_location: "",
    parent_name: "",
    parent_phone: "",
    emergency_contact: "",
  });
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const router = useRouter();

  // Load user data on component mount
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.push("/");
        return;
      }

      const user = JSON.parse(userData);
      setProfileData({
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.profile_picture || user.profilePicture || "",
        user_type: user.user_type || "",
        // Driver fields
        license_number: user.license_number || "",
        vehicle_model: user.vehicle_model || "",
        vehicle_plate: user.vehicle_plate || "",
        vehicle_color: user.vehicle_color || "",
        // Student fields
        student_id: user.student_id || "",
        major: user.major || "",
        year: user.year || "",
        campus_location: user.campus_location || "",
        parent_name: user.parent_name || "",
        parent_phone: user.parent_phone || "",
        emergency_contact: user.emergency_contact || "",
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      router.push("/");
    }
  };

  useEffect(() => {
    loadUserData();

    // Listen for profile updates from other pages (like vehicle page)
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [router]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setProfileMsg("Please login again to update your profile.");
        setIsUpdatingProfile(false);
        return;
      }

      // Prepare data based on user type
      const updateData: any = {
        full_name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        profilePicture: profileData.profilePicture,
      };

      // Add driver-specific fields
      if (profileData.user_type === "driver") {
        updateData.license_number = profileData.license_number;
        updateData.vehicle_model = profileData.vehicle_model;
        updateData.vehicle_plate = profileData.vehicle_plate;
        updateData.vehicle_color = profileData.vehicle_color;
      }

      // Add student-specific fields
      if (profileData.user_type === "student") {
        updateData.student_id = profileData.student_id;
        updateData.major = profileData.major;
        updateData.year = profileData.year;
        updateData.campus_location = profileData.campus_location;
        updateData.parent_name = profileData.parent_name;
        updateData.parent_phone = profileData.parent_phone;
        updateData.emergency_contact = profileData.emergency_contact;
      }

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

      const data = await response.json();

      if (response.ok) {
        setProfileMsg("Profile updated successfully!");

        // Map backend field names to frontend field names
        const backendUser = data.user;
        const mappedUser = {
          ...backendUser,
          profilePicture:
            backendUser.profile_picture || backendUser.profilePicture,
        };

        // Update localStorage with new data
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...mappedUser };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update local state to reflect changes immediately
        setProfileData({
          ...profileData,
          profilePicture:
            mappedUser.profilePicture || profileData.profilePicture,
        });

        // Dispatch event for MainLayout to update
        window.dispatchEvent(new Event("profileUpdated"));

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setProfileMsg(null);
        }, 3000);
      } else {
        setProfileMsg(data.error || "Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setProfileMsg(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMsg(null);

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg("New password must be at least 8 characters long.");
      setIsChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setPasswordMsg("Please login again to change your password.");
        setIsChangingPassword(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPasswordMsg("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setPasswordMsg(null);
        }, 3000);
      } else {
        setPasswordMsg(
          data.error ||
            "Failed to update password. Please check your current password."
        );
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      setPasswordMsg(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      setProfileMsg("Please upload an image file.");
      return;
    }

    // Convert image to base64 for storage in profile data
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setProfileData((prev) => ({ ...prev, profilePicture: base64String }));
      setProfileMsg(
        "Profile picture updated successfully! Remember to save your profile to persist changes."
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-none sm:max-w-4xl sm:mx-auto">
        {/* Beautiful Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile, security, and integrations
          </p>
        </div>

        {/* Profile Information Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-50 rounded-lg">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h2>
                <p className="text-sm text-gray-600">
                  {profileData.user_type === "admin"
                    ? "Update your administrator details"
                    : profileData.user_type === "driver"
                    ? "Update your driver profile and vehicle information"
                    : "Update your student profile information"}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileData.profilePicture ? (
                      <img
                        src={profileData.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-500">
                    Upload a professional photo
                  </p>
                </div>
              </div>

              {/* Basic Information - All Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter your full name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    required
                    disabled={isUpdatingProfile}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter your email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    required
                    disabled={isUpdatingProfile}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  placeholder="Enter your phone number"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={isUpdatingProfile}
                />
              </div>

              {/* Driver-Specific Fields */}
              {profileData.user_type === "driver" && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Driver Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="Enter your license number"
                        value={profileData.license_number}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            license_number: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="e.g., Toyota Camry 2020"
                        value={profileData.vehicle_model}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            vehicle_model: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Plate Number
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="Enter plate number"
                        value={profileData.vehicle_plate}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            vehicle_plate: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Color
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="e.g., Black"
                        value={profileData.vehicle_color}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            vehicle_color: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Student-Specific Fields */}
              {profileData.user_type === "student" && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="Enter your student ID"
                        value={profileData.student_id}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            student_id: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Major
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="e.g., Computer Science"
                        value={profileData.major}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            major: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                        value={profileData.year}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            year: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      >
                        <option value="" className="text-gray-500">
                          Select year
                        </option>
                        <option value="1" className="text-gray-900">
                          1st Year
                        </option>
                        <option value="2" className="text-gray-900">
                          2nd Year
                        </option>
                        <option value="3" className="text-gray-900">
                          3rd Year
                        </option>
                        <option value="4" className="text-gray-900">
                          4th Year
                        </option>
                        <option value="5" className="text-gray-900">
                          5th Year+
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campus Location
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="e.g., Main Campus"
                        value={profileData.campus_location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            campus_location: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Information */}
                  <h3 className="text-base font-semibold text-gray-900 mb-4 mt-6">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="Enter parent's full name"
                        value={profileData.parent_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            parent_name: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="e.g., +1234567890"
                        value={profileData.parent_phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            parent_phone: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                        placeholder="Additional emergency contact number"
                        value={profileData.emergency_contact}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            emergency_contact: e.target.value,
                          })
                        }
                        disabled={isUpdatingProfile}
                      />
                    </div>
                  </div>
                </div>
              )}

              {profileMsg && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    profileMsg.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {profileMsg}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className={`flex items-center gap-2 font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${
                    isUpdatingProfile
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg"
                  } text-white`}
                  disabled={isUpdatingProfile}
                >
                  <User className="w-4 h-4" />
                  {isUpdatingProfile ? "Updating Profile..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Change Password Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg">
              <Lock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>
              <p className="text-sm text-gray-600">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="Enter your new password (min. 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            {passwordMsg && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  passwordMsg.includes("success")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {passwordMsg}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className={`flex items-center gap-2 font-medium py-3 px-6 rounded-lg shadow-md transition-all duration-200 ${
                  isChangingPassword
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-lg"
                } text-white`}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
