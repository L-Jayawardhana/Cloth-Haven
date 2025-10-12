import { useState, useEffect } from "react";
import { apiService } from "../../lib/api";
import type { User, UpdateUserRequest, PasswordChangeRequest } from "../../lib/api";

// Utility function to validate and parse user data
const parseUserData = (userData: string): User | null => {
  try {
    const parsed = JSON.parse(userData);
    if (!parsed) return null;
    
    // Handle different possible field names for user ID
    let userId = parsed.userId || parsed.userid || parsed.id;
    
    // Convert string to number if needed
    if (typeof userId === 'string') {
      userId = parseInt(userId, 10);
    }
    
    // Validate that we have a valid user ID
    if (!userId || isNaN(userId) || userId <= 0) {
      console.error('Invalid user ID:', userId);
      return null;
    }
    
    return {
      ...parsed,
      userId: userId
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phoneNo: "",
    address: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const validUser = parseUserData(userData);
      
      if (validUser) {
        setUser(validUser);
        setProfileData({
          username: validUser.username || "",
          email: validUser.email || "",
          phoneNo: validUser.phoneNo || "",
          address: validUser.address || ""
        });
      } else {
        console.error("Invalid user data found, redirecting to login");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else {
      // No user data found, redirect to login
      window.location.href = "/login";
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.userId || isNaN(user.userId) || user.userId <= 0) {
      setMessage("Invalid user session. Please login again.");
      return;
    }

    setProfileLoading(true);
    setMessage("");

    try {
      const updateData: UpdateUserRequest = {
        ...profileData,
        role: user.role
      };
      
      console.log("Updating user with ID:", user.userId, "Data:", updateData);
      const updatedUser = await apiService.updateUser(user.userId, updateData);
      
      // Update localStorage with proper user ID
      const currentUserData = JSON.parse(localStorage.getItem("user") || "{}");
      const newUserData = { ...currentUserData, ...updatedUser, userId: user.userId };
      localStorage.setItem("user", JSON.stringify(newUserData));
      
      setUser(newUserData);
      setMessage("Profile updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.userId || isNaN(user.userId) || user.userId <= 0) {
      setPasswordMessage("Invalid user session. Please login again.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setPasswordMessage("");

    try {
      const changeData: PasswordChangeRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      console.log("Changing password for user ID:", user.userId);
      await apiService.changePassword(user.userId, changeData);
      setPasswordMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordMessage(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Admin Dashboard</span>
          <span>•</span>
          <span>Settings</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">Update your account profile information</p>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phoneNo}
                  onChange={(e) => setProfileData({ ...profileData, phoneNo: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes("successfully") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </section>

        {/* Security Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage your password and security settings</p>
          </div>
          
          <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
            </div>
            
            {passwordMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                passwordMessage.includes("successfully") 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {passwordMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </section>
      </div>

      {/* Session Management */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Session Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Manage your admin session</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Current Session</h3>
              <p className="text-sm text-gray-600">You are currently logged in as an administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
