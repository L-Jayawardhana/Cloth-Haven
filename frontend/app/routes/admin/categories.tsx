import React, { useEffect, useState } from 'react';
import { categoryApi, subCategoryApi } from '~/lib/api';
import { Edit2, Trash2, Plus } from "lucide-react";

interface Category {
  categoryId: number;
  categoryName: string;
}

interface SubCategory {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
}

export default function AdminCategoriesPage() {
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Category modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);

  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  // SubCategory modals
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [subCategoryMode, setSubCategoryMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Data loading functions
  const loadData = async () => {
    await Promise.all([loadCategories(), loadSubCategories()]);
  };

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

  const loadSubCategories = async () => {
    try {
      const data = await subCategoryApi.getAllSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setErrorMsg('Failed to load subcategories');
    }
  };

  // Utility functions
  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const getSubCategoriesForCategory = (categoryId: number) => {
    return subCategories.filter(sub => sub.categoryId === categoryId);
  };

  const handleViewSubCategories = (categoryId: number) => {
    // Navigate to subcategories page with category filter
    window.location.href = `/admin/subcategories?categoryId=${categoryId}`;
  };

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setAddCategoryLoading(true);
      const response = await categoryApi.addCategory({ categoryName: newCategoryName.trim() });
      
      if (response.success) {
        setSuccessMsg('Category added successfully!');
        setNewCategoryName("");
        setShowAddCategoryModal(false);
        await loadCategories();
      } else {
        setErrorMsg(response.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMsg('Failed to add category');
    } finally {
      setAddCategoryLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.categoryName);
    setShowEditCategoryModal(true);
    clearMessages();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    try {
      setEditCategoryLoading(true);
      const response = await categoryApi.updateCategory(editingCategory.categoryId, {
        categoryName: editCategoryName.trim()
      });

      if (response.success) {
        setSuccessMsg('Category updated successfully!');
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        setEditCategoryName("");
        await loadCategories();
      } else {
        setErrorMsg(response.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMsg('Failed to update category');
    } finally {
      setEditCategoryLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
    clearMessages();
  };

  const handleConfirmDeleteCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToDelete || !adminPassword.trim()) {
      setErrorMsg("Please enter admin password");
      return;
    }

    try {
      setDeleteCategoryLoading(true);
      const result = await categoryApi.adminDeleteCategory(categoryToDelete.categoryId, adminPassword);

      if (result.success) {
        setSuccessMsg(result.message);
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
        setAdminPassword("");
        await loadCategories();
      } else {
        setErrorMsg(result.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMsg('Failed to delete category');
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  // SubCategory handlers
  const openSubCategoryModal = (mode: 'add' | 'edit' | 'delete', category?: Category, subCategory?: SubCategory) => {
    setSubCategoryMode(mode);
    setSelectedCategory(category || null);
    setCurrentSubCategory(subCategory || null);
    setSubCategoryName(subCategory?.subCategoryName || "");
    setAdminPassword("");
    setShowSubCategoryModal(true);
    clearMessages();
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (subCategoryMode === 'add') {
      await handleAddSubCategory();
    } else if (subCategoryMode === 'edit') {
      await handleEditSubCategory();
    } else if (subCategoryMode === 'delete') {
      await handleDeleteSubCategory();
    }
  };

  const handleAddSubCategory = async () => {
    if (!subCategoryName.trim() || !selectedCategory) return;

    try {
      setSubCategoryLoading(true);
      const response = await subCategoryApi.createSubCategory({
        subCategory: subCategoryName.trim(),
        categoryId: selectedCategory.categoryId
      });

      if (response.success) {
        setSuccessMsg('Subcategory added successfully!');
        closeSubCategoryModal();
        await loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to add subcategory');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      setErrorMsg('Failed to add subcategory');
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const handleEditSubCategory = async () => {
    if (!currentSubCategory || !subCategoryName.trim()) return;

    try {
      setSubCategoryLoading(true);
      const response = await subCategoryApi.updateSubCategory(currentSubCategory.subCategoryId, {
        subCategory: subCategoryName.trim(),
        categoryId: currentSubCategory.categoryId
      });

      if (response.success) {
        setSuccessMsg('Subcategory updated successfully!');
        closeSubCategoryModal();
        await loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to update subcategory');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      setErrorMsg('Failed to update subcategory');
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const handleDeleteSubCategory = async () => {
    if (!currentSubCategory || !adminPassword.trim()) {
      setErrorMsg("Please enter admin password");
      return;
    }

    if (adminPassword !== "admin123") {
      setErrorMsg("Invalid admin password");
      return;
    }

    try {
      setSubCategoryLoading(true);
      const response = await subCategoryApi.deleteSubCategory(currentSubCategory.subCategoryId);

      if (response.success) {
        setSuccessMsg('Subcategory deleted successfully!');
        closeSubCategoryModal();
        await loadSubCategories();
      } else {
        setErrorMsg(response.message || 'Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setErrorMsg('Failed to delete subcategory');
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const closeSubCategoryModal = () => {
    setShowSubCategoryModal(false);
    setSubCategoryMode('add');
    setSelectedCategory(null);
    setCurrentSubCategory(null);
    setSubCategoryName("");
    setAdminPassword("");
  };

  // Pagination logic
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
            <p className="text-gray-600">Manage product categories and subcategories</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Messages */}
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

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : currentCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No categories found</p>
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
                        Category Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subcategories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentCategories.map((category) => {
                      const categorySubCategories = getSubCategoriesForCategory(category.categoryId);
                      return (
                        <tr key={category.categoryId} className="hover:bg-gray-50 border-b border-gray-100">
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                            {category.categoryId}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 text-left">
                            {category.categoryName}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 text-left">
                            {categorySubCategories.length > 0 ? (
                              <button
                                onClick={() => handleViewSubCategories(category.categoryId)}
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {categorySubCategories.length} {categorySubCategories.length === 1 ? 'subcategory' : 'subcategories'}
                              </button>
                            ) : (
                              <span className="text-gray-400">0 subcategories</span>
                            )}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-left">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openSubCategoryModal('add', category)}
                                className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Sub
                              </button>
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of{' '}
                    {filteredCategories.length} categories
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

      {/* Add Category Modal */}
      {showAddCategoryModal && (
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
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={addCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  disabled={addCategoryLoading}
                >
                  {addCategoryLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
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
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={editCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  disabled={editCategoryLoading}
                >
                  {editCategoryLoading ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Delete Category</h2>
            <p className="text-sm text-gray-600 mb-4">
              You are about to delete <span className="font-medium text-gray-900">{categoryToDelete.categoryName}</span>.
              This will permanently remove the category and all its subcategories.
            </p>
            <form onSubmit={handleConfirmDeleteCategory} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={deleteCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  disabled={deleteCategoryLoading}
                >
                  {deleteCategoryLoading ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal SubCategory Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className={`text-lg font-semibold mb-4 ${
              subCategoryMode === 'delete' ? 'text-red-600' : ''
            }`}>
              {subCategoryMode === 'add' && 'Add Subcategory'}
              {subCategoryMode === 'edit' && 'Edit Subcategory'}
              {subCategoryMode === 'delete' && 'Delete Subcategory'}
            </h2>
            
            {subCategoryMode === 'delete' && currentSubCategory && (
              <p className="text-sm text-gray-600 mb-4">
                You are about to delete <span className="font-medium text-gray-900">{currentSubCategory.subCategoryName}</span>.
                This action cannot be undone.
              </p>
            )}
            
            <form onSubmit={handleSubCategorySubmit} className="space-y-4">
              {subCategoryMode !== 'delete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter subcategory name"
                    required
                  />
                </div>
              )}
              
              {subCategoryMode === 'delete' && (
                <div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeSubCategoryModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={subCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm rounded-md disabled:opacity-50 ${
                    subCategoryMode === 'delete'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  disabled={subCategoryLoading}
                >
                  {subCategoryLoading ? 'Processing...' : 
                    subCategoryMode === 'add' ? 'Add Subcategory' :
                    subCategoryMode === 'edit' ? 'Update Subcategory' :
                    'Delete Subcategory'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}