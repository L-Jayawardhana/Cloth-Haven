import React, { useEffect, useState } from 'react';
import { subCategoryApi, categoryApi } from '~/lib/api';
import { Edit2, Trash2, Plus, ArrowLeft } from "lucide-react";

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

export default function AdminSubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | "">("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage =11;

  // Add SubCategory Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit SubCategory Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editSubCategoryName, setEditSubCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete SubCategory Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<SubCategory | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadSubCategories();
    loadCategories();
    
    // Check if there's a categoryId in the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('categoryId');
    if (categoryId) {
      setSelectedCategoryFilter(parseInt(categoryId));
    }
  }, []);

  const loadSubCategories = async () => {
    try {
      setLoading(true);
      const data = await subCategoryApi.getAllSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setErrorMsg('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setErrorMsg('Failed to load categories');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown Category';
  };

  // Filter subcategories based on search term and category filter
  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = subCategory.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(subCategory.categoryId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === "" || subCategory.categoryId === selectedCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSubCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubCategories = filteredSubCategories.slice(startIndex, endIndex);

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategoryName.trim() || !selectedCategoryId) return;

    try {
      setAddLoading(true);
      const response = await subCategoryApi.createSubCategory({
        subCategory: newSubCategoryName.trim(),
        categoryId: selectedCategoryId as number
      });

      if (response.success) {
        setSuccessMsg('Subcategory added successfully!');
        setNewSubCategoryName("");
        setSelectedCategoryId("");
        setShowAddModal(false);
        loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to add subcategory');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      setErrorMsg('Failed to add subcategory');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setEditSubCategoryName(subCategory.subCategoryName);
    setEditCategoryId(subCategory.categoryId);
    setShowEditModal(true);
  };

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory || !editSubCategoryName.trim() || !editCategoryId) return;

    try {
      setEditLoading(true);
      const response = await subCategoryApi.updateSubCategory(editingSubCategory.subCategoryId, {
        subCategory: editSubCategoryName.trim(),
        categoryId: editCategoryId as number
      });

      if (response.success) {
        setSuccessMsg('Subcategory updated successfully!');
        setShowEditModal(false);
        setEditingSubCategory(null);
        setEditSubCategoryName("");
        setEditCategoryId("");
        loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setErrorMsg('Failed to update subcategory');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    setSubCategoryToDelete(subCategory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategoryToDelete || !adminPassword.trim()) return;

    // Basic admin password check (you might want to implement proper authentication)
    if (adminPassword !== "admin123") {
      setErrorMsg("Invalid admin password");
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await subCategoryApi.deleteSubCategory(subCategoryToDelete.subCategoryId);

      if (response.success) {
        setSuccessMsg('Subcategory deleted successfully!');
        setShowDeleteModal(false);
        setSubCategoryToDelete(null);
        setAdminPassword("");
        loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setErrorMsg('Failed to delete subcategory');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewSubCategoryName("");
    setSelectedCategoryId("");
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSubCategory(null);
    setEditSubCategoryName("");
    setEditCategoryId("");
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSubCategoryToDelete(null);
    setAdminPassword("");
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 5000); // Increased to 5 seconds for better UX
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.location.href = '/admin/categories'}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subcategory Management</h1>
          <p className="text-gray-600">
            Manage product subcategories and organize your inventory
            {selectedCategoryFilter && categories.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                Filtered by: {categories.find(cat => cat.categoryId === selectedCategoryFilter)?.categoryName}
              </span>
            )}
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="max-w-xs">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subcategory
          </button>
        </div>

        {/* Subcategories Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subcategories...</p>
            </div>
          ) : currentSubCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No subcategories found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subcategory Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentSubCategories.map((subCategory) => (
                      <tr key={subCategory.subCategoryId} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 text-left">
                          {subCategory.subCategoryId}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                          {subCategory.subCategoryName}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 text-left">
                          {getCategoryName(subCategory.categoryId)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-left">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSubCategory(subCategory)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubCategory(subCategory)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
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
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredSubCategories.length)} of{' '}
                    {filteredSubCategories.length} subcategories
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add SubCategory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Subcategory</h2>
            <form onSubmit={handleAddSubCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter subcategory name"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
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
                  {addLoading ? 'Adding...' : 'Add Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SubCategory Modal */}
      {showEditModal && editingSubCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Subcategory</h2>
            <form onSubmit={handleUpdateSubCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={editSubCategoryName}
                  onChange={(e) => setEditSubCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter subcategory name"
                  autoComplete="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
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
                  {editLoading ? 'Updating...' : 'Update Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete SubCategory Modal */}
      {showDeleteModal && subCategoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Subcategory</h2>
            <p className="text-sm text-gray-600 mb-4">
              You are about to delete <span className="font-medium text-gray-900">{subCategoryToDelete.subCategoryName}</span>.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently remove the subcategory. Please confirm by entering your admin password.
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
                  {deleteLoading ? 'Deleting...' : 'Delete Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}