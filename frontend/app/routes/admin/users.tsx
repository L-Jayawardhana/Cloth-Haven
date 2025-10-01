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

  const itemsPerPage = 8;
  
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
    console.log('User ID:', selectedUser.userid);
    
    if (!selectedUser.userid) {
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
      
      await apiService.updateUser(selectedUser.userid, updateData)
      
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
      await apiService.adminDeleteUser(userToDelete.userid, adminPassword)
      
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
    <div className="grid gap-6">
      {successMsg ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMsg}
        </div>
      ) : null}
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-700">Users & Staff</h1>
        <div className="flex gap-2">
          <button 
            onClick={loadUsers} 
            disabled={loading}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={() => setIsAddOpen(true)} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Add Staff</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input 
          className="h-10 rounded-md border border-indigo-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-300" 
          placeholder="Search users" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="h-10 rounded-md border border-indigo-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-300"
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
          <div className="relative z-10 w-full max-w-md rounded-xl border border-indigo-100 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-medium text-amber-700">Add Staff</h2>
            <p className="mt-1 text-xs text-gray-500">Create a new staff account</p>
            {errorMsg ? (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMsg}</div>
            ) : null}
            <form className="mt-4 grid gap-3" onSubmit={handleSave}>
              <label className="grid gap-1 text-sm">
                <span>Username</span>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. alex_johnson" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. alex@clothhaven.com" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Phone</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. +1 555 123 4567" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Address</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="h-10 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 123 Main St, City, State" />
              </label>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span>Password</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 w-full rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Confirm Password</span>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 w-full rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </label>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={clearForm} disabled={loading} className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">Clear</button>
                <button type="submit" disabled={loading} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {loadError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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

      <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-amber-50 text-amber-800">
            <tr>
              <th className="px-4 py-3 text-center">Username</th>
              <th className="px-4 py-3 text-center">Email</th>
              <th className="px-4 py-3 text-center">Role</th>
              <th className="px-4 py-3 text-center">Created at</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || roleFilter ? 'No users match your filters' : 'No users found'}
                </td>
              </tr>
            ) : (
              currentUsers.map((user, i) => (
                <tr key={user.userid} className="border-t hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3 text-center">{user.username}</td>
                  <td className="px-4 py-3 text-center">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex justify-center items-center w-16 px-3 py-1 rounded-md text-xs font-medium bg-amber-100/60 text-amber-800 border border-amber-200/40">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <div className="relative group">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 transition-colors duration-200"
                        >
                          <Eye size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          View details
                        </div>
                      </div>
                      <div className="relative group">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 rounded-md bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200 hover:border-amber-300 transition-colors duration-200"
                        >
                          <Edit2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-amber-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {user.role === "CUSTOMER" ? "Cannot edit customer" : "Edit user"}
                        </div>
                      </div>
                      <div className="relative group">
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-md bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 hover:border-red-300 transition-colors duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Delete user
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View User Details Dialog */}
      {isViewDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseDialogs} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-amber-100 bg-white shadow-xl">
            <div className="border-b border-amber-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-amber-700">User Details</h2>
              <p className="text-sm text-gray-500">Viewing {selectedUser.role.toLowerCase()} information</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4">
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
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : selectedUser.role === 'STAFF'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{selectedUser.createdAt || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-amber-100 px-6 py-4 flex justify-between">
              {selectedUser.role !== "CUSTOMER" ? (
                <button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditUser(selectedUser);
                  }}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 transition-colors"
                >
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
          <div className="relative z-10 w-full max-w-md rounded-xl border border-amber-100 bg-white shadow-xl">
            <div className="border-b border-amber-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-amber-700">Edit User Details</h2>
              <p className="text-sm text-gray-500">Editing {selectedUser.role.toLowerCase()} information</p>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text"
                    value={editFormData.username || ''}
                    onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel"
                    value={editFormData.phoneNo || ''}
                    onChange={(e) => setEditFormData({...editFormData, phoneNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Enter address"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
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
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-amber-700">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-amber-200 bg-white text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isCurrentPage = page === currentPage;
              const isNearCurrent = Math.abs(page - currentPage) <= 2;
              const isFirstOrLast = page === 1 || page === totalPages;
              
              if (!isNearCurrent && !isFirstOrLast) {
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={`ellipsis-${page}`} className="px-2 text-amber-400">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`h-8 w-8 rounded-md border text-sm font-medium transition-colors ${
                    isCurrentPage
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white text-amber-600 border-amber-200 hover:bg-amber-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-amber-200 bg-white text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

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
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
