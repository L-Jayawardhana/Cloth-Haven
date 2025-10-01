import React, { useEffect, useState } from 'react';
import { categoryApi } from '~/lib/api';
import { Edit2, Trash2 } from "lucide-react";

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Category Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit Category Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete Category Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setErrorMsg('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Add Category Functions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!newCategoryName.trim()) {
      setErrorMsg("Category name is required");
      return;
    }

    try {
      setAddLoading(true);
      const result = await categoryApi.addCategory({
        categoryName: newCategoryName.trim()
      });

      if (result.success) {
        setSuccessMsg(result.message);
        setNewCategoryName("");
        setShowAddModal(false);
        await loadCategories(); // Reload categories
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMsg('Failed to add category');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewCategoryName("");
    clearMessages();
  };

  // Edit Category Functions
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.categoryName);
    setShowEditModal(true);
    clearMessages();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!editingCategory || !editCategoryName.trim()) {
      setErrorMsg("Category name is required");
      return;
    }

    try {
      setEditLoading(true);
      const result = await categoryApi.updateCategory(editingCategory.categoryId, {
        categoryName: editCategoryName.trim()
      });

      if (result.success) {
        setSuccessMsg(result.message);
        setShowEditModal(false);
        setEditingCategory(null);
        setEditCategoryName("");
        await loadCategories(); // Reload categories
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMsg('Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setEditCategoryName("");
    clearMessages();
  };

  // Delete Category Functions
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    clearMessages();
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!categoryToDelete || !adminPassword.trim()) {
      setErrorMsg("Please enter admin password");
      return;
    }

    try {
      setDeleteLoading(true);
      // Use the new admin delete endpoint with password validation
      const result = await categoryApi.adminDeleteCategory(categoryToDelete.categoryId, adminPassword);

      if (result.success) {
        setSuccessMsg(result.message);
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setAdminPassword("");
        await loadCategories(); // Reload categories
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMsg('Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
    setAdminPassword("");
    clearMessages();
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-emerald-700">Category Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage product categories and their information</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/admin/products'}
            className="rounded-md border border-emerald-200 px-3 py-2 text-sm hover:bg-emerald-50"
          >
            ← Back to Products
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="text-sm text-red-800">{errorMsg}</div>
            <button 
              onClick={clearMessages}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <div className="text-sm text-green-800">{successMsg}</div>
            <button 
              onClick={clearMessages}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        <input 
          className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <div></div> {/* Empty div to maintain grid layout */}
        <div className="text-sm text-gray-600 flex items-center justify-end">
          {filteredCategories.length > 0 
            ? `Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, filteredCategories.length)} of ${filteredCategories.length} categories`
            : `${filteredCategories.length} of ${categories.length} categories`
          }
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-center text-sm">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Category Name</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Loading categories...
                </td>
              </tr>
            ) : currentCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
                </td>
              </tr>
            ) : (
              currentCategories.map((category) => (
                <tr key={category.categoryId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{category.categoryId}</td>
                  <td className="px-4 py-3">{category.categoryName}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <div className="relative group">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="p-1.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-300 transition-colors duration-200"
                        >
                          <Edit2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-emerald-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Edit category
                        </div>
                      </div>
                      <div className="relative group">
                        <button 
                          onClick={() => handleDeleteCategory(category)}
                          className="p-1.5 rounded-md bg-green-100 border border-green-200 text-green-700 hover:bg-green-200 hover:border-green-300 transition-colors duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-green-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Delete category
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

      {/* Pagination */}
      {!loading && filteredCategories.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-emerald-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isCurrentPage = page === currentPage;
                const isNearCurrent = Math.abs(page - currentPage) <= 2;
                const isFirstOrLast = page === 1 || page === totalPages;
                
                if (!isNearCurrent && !isFirstOrLast) {
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return <span key={`ellipsis-${page}`} className="px-2 text-emerald-400">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-8 w-8 rounded-md border text-sm font-medium transition-colors ${
                      isCurrentPage
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
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
              className="p-2 rounded-md border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter category name"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter category name"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Category</h2>
            <p className="text-sm text-gray-600 mb-4">
              You are about to delete <span className="font-medium text-gray-900">{categoryToDelete.categoryName}</span>.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove the category. Please confirm by entering your admin password.
            </p>
            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}