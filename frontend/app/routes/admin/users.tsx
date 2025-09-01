import * as React from "react";
import { Edit2, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export default function AdminUsersPage() {
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [successMsg, setSuccessMsg] = React.useState("")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)

  const itemsPerPage = 8;
  
  // Mock data - in real app this would come from API
  const allUsers = Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    username: `user_${i + 1}`,
    email: `user${i + 1}@clothhaven.com`,
    role: ["User", "Staff", "Admin"][i % 3],
    createdAt: `2025-01-${String(Math.floor(i/3) + 1).padStart(2, '0')}`
  }));

  const totalPages = Math.ceil(allUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = allUsers.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  function clearForm() {
    setUsername("")
    setEmail("")
    setPhone("")
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

    if (!username || !email || !phone || !password || !confirmPassword) {
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

    // Simulate API save success
    setIsAddOpen(false)
    clearForm()
    setSuccessMsg("Staff added successfully")
    setTimeout(() => setSuccessMsg(""), 3000)
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
          <button onClick={() => setIsAddOpen(true)} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Add Staff</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className="h-10 rounded-md border border-indigo-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-300" placeholder="Search users" />
        <select className="h-10 rounded-md border border-indigo-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 hover:border-amber-300">
          <option value="">All Roles</option>
          <option>User</option>
          <option>Staff</option>
          <option>Admin</option>
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
                <button type="button" onClick={clearForm} className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Clear</button>
                <button type="submit" className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
            {currentUsers.map((user, i) => (
              <tr key={user.id} className="border-t hover:bg-amber-50/30 transition-colors">
                <td className="px-4 py-3 text-center">{user.username}</td>
                <td className="px-4 py-3 text-center">{user.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex justify-center items-center w-16 px-3 py-1 rounded-md text-xs font-medium bg-amber-100/60 text-amber-800 border border-amber-200/40">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{user.createdAt}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1">
                    <div className="relative group">
                      <button className="p-1.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <Eye size={14} />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        View details
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-1.5 rounded-md bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200 hover:border-amber-300 transition-colors duration-200">
                        <Edit2 size={14} />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-amber-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Edit user
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-1.5 rounded-md bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 hover:border-red-300 transition-colors duration-200">
                        <Trash2 size={14} />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-red-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        Delete user
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-amber-700">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allUsers.length)} of {allUsers.length} users
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
                  return <span key={page} className="px-2 text-amber-400">...</span>;
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
    </div>
  );
}
