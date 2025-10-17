import * as React from "react";
import { Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { apiService } from "../../lib/api";
import type { User } from "../../lib/api";

export default function AdminUsersPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [successMsg, setSuccessMsg] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [editFormData, setEditFormData] = React.useState<Partial<User>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
  const [adminPassword, setAdminPassword] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  const itemsPerPage = 11;
  
  // Load users on component mount
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const userData = await apiService.getAllUsers();
      setUsers(userData);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      setLoadError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  function clearForm() {
    setUsername("")
    setEmail("")
    setPhone("")
    setAddress("")
    setPassword("")
    setConfirmPassword("")
    setErrorMsg("")
  }

  function isValidEmail(value: string) {
    // Basic email format validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
  }

  function isValidPhone(value: string) {
    // Digits, spaces, dashes, parentheses, plus. 7-15 digits overall
    const digits = value.replace(/\D/g, "")
    return digits.length >= 7 && digits.length <= 15
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (!username || !email || !phone || !address || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields")
      return
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address")
      return
    }
    if (!isValidPhone(phone)) {
      setErrorMsg("Please enter a valid phone number")
      return
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

    // Create new staff user via API
    createStaffUser()
  }

  const createStaffUser = async () => {
    try {
      setLoading(true)
      const newStaffData = {
        username,
        email,
        phoneNo: phone,
        address: address,
        pw: password,
        role: "STAFF"
      }
      
      await apiService.register(newStaffData)
      
      // Success - refresh user list and close dialog
      setIsAddOpen(false)
      clearForm()
      setSuccessMsg("Staff member added successfully")
      setTimeout(() => setSuccessMsg(""), 3000)
      
      // Refresh the users list
      await loadUsers()
      
    } catch (error: any) {
      console.error("Failed to create staff user:", error)
      setErrorMsg(error.message || "Failed to create staff member")
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    if (user.role === "CUSTOMER") {
      setErrorMsg("You cannot edit customer information")
      setTimeout(() => setErrorMsg(""), 3000)
      return
    }
    
    setSelectedUser(user)
    setEditFormData({
      username: user.username,
      email: user.email,
      phoneNo: user.phoneNo,
      address: user.address
    })
    setIsEditDialogOpen(true)
  }

  const handleCloseDialogs = () => {
    setIsViewDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    setEditFormData({})
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return
    
    console.log('Selected user for edit:', selectedUser);
    console.log('User ID:', selectedUser.userId);
    
    if (!selectedUser.userId) {
      setErrorMsg('User ID is missing - cannot update user');
      return;
    }
    
    try {
      setLoading(true)
      const updateData = {
        username: editFormData.username || selectedUser.username,
        email: editFormData.email || selectedUser.email,
        phoneNo: editFormData.phoneNo || selectedUser.phoneNo,
        address: editFormData.address || selectedUser.address,
        role: selectedUser.role
      }
      
      console.log('Update data:', updateData);
      
      await apiService.updateUser(selectedUser.userId, updateData)
      
      setSuccessMsg("User updated successfully")
      setTimeout(() => setSuccessMsg(""), 3000)
      handleCloseDialogs()
      await loadUsers() // Refresh the list
      
    } catch (error: any) {
      console.error("Failed to update user:", error)
      setErrorMsg(error.message || "Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete || !adminPassword.trim()) {
      setErrorMsg("Please enter admin password")
      return
    }
    
    try {
      setIsDeleting(true)
      // Use the new admin delete endpoint with admin password
      await apiService.adminDeleteUser(userToDelete.userId, adminPassword)
      
      setSuccessMsg(`${userToDelete.role.toLowerCase()} deleted successfully`)
      setTimeout(() => setSuccessMsg(""), 3000)
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      setAdminPassword("")
      
      // Refresh the users list
      await loadUsers()
      
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      setErrorMsg(error.message || "Failed to delete user")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
    setAdminPassword("")
  }
  return (
    <>
      <div className="space-y-8">
        {/* Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Users & Staff</h1>
            <p className="text-slate-600 mt-1">Manage user accounts and staff members</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadUsers} 
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button 
              onClick={() => setIsAddOpen(true)} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add Staff
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-2">
          <input 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

      {isAddOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsAddOpen(false)} />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Add Staff Member</h2>
              <p className="text-sm text-gray-600">Create a new staff account</p>
            </div>
            <div className="p-6">
              {errorMsg ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
              ) : null}
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. alex_johnson" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. alex@clothhaven.com" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. +1 555 123 4567" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none" 
                    placeholder="e.g. 123 Main St, City, State" 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" 
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsAddOpen(false);
                      clearForm();
                    }} 
                    disabled={loading} 
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

        {loadError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <div>
                <div className="font-medium">Failed to load users</div>
                <div className="mt-1">{loadError}</div>
                <button 
                  onClick={loadUsers}
                  className="mt-2 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded border"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600">
                {searchTerm || roleFilter ? 'No users match your filters' : 'No users found'}
              </p>
            </div>
          ) : (
            <>
              <div>
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-slate-50 border-b border-slate-100">
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 text-left">
                          {user.userId}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 text-left">
                          {user.username}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 text-left">
                          {user.email}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 text-left">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 text-left">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-left">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="p-2 border border-slate-200 rounded-md text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 border border-slate-200 rounded-md text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 border border-red-200 rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    {/* View User Details Dialog */}
      {isViewDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseDialogs} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              <p className="text-sm text-gray-600">Viewing {selectedUser.role.toLowerCase()} information</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.phoneNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-md text-xs font-medium ${
                    selectedUser.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : selectedUser.role === 'STAFF'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-between bg-gray-50 rounded-b-xl">
              {selectedUser.role !== "CUSTOMER" ? (
                <button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditUser(selectedUser);
                  }}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Details
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-md border">
                  Customer details cannot be edited
                </div>
              )}
              <button 
                onClick={handleCloseDialogs}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {isEditDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseDialogs} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-semibold text-gray-900">Edit User Details</h2>
              <p className="text-sm text-gray-600">Editing {selectedUser.role.toLowerCase()} information</p>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text"
                    value={editFormData.username || ''}
                    onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={editFormData.phoneNo || ''}
                    onChange={(e) => setEditFormData({...editFormData, phoneNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea 
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Enter address"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button"
                    onClick={handleCloseDialogs}
                    disabled={loading}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {isDeleteDialogOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete {userToDelete.role.toLowerCase()}?</h4>
            <p className="text-sm text-gray-600 mb-1">
              You are about to delete <span className="font-medium text-gray-900">{userToDelete.username}</span> ({userToDelete.email}).
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove all their data. Please confirm by entering your admin password.
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseDeleteDialog}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || !adminPassword.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleClasses = {
    ADMIN: "bg-red-100 text-red-800 border-red-200",
    STAFF: "bg-blue-100 text-blue-800 border-blue-200",
    CUSTOMER: "bg-emerald-100 text-emerald-800 border-emerald-200"
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
      roleClasses[role as keyof typeof roleClasses] || "bg-slate-100 text-slate-800 border-slate-200"
    }`}>
      {role}
    </span>
  );
}
