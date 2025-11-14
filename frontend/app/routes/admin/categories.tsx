import React, { useEffect, useState } from 'react';
import { categoryApi, subCategoryApi } from '~/lib/api';
import { Edit2, Trash2, Plus, ArrowLeft } from "lucide-react";

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
  const itemsPerPage = 11;

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
  const [deleteCategoryError, setDeleteCategoryError] = useState("");

  // SubCategory modals
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [subCategoryMode, setSubCategoryMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [deleteSubCategoryError, setDeleteSubCategoryError] = useState("");

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
      setDeleteCategoryError("Please enter admin password");
      return;
    }

    try {
      setDeleteCategoryLoading(true);
      setDeleteCategoryError(""); // Clear any previous errors
      const result = await categoryApi.adminDeleteCategory(categoryToDelete.categoryId, adminPassword);

      if (result.success) {
        setSuccessMsg(result.message);
        setShowDeleteCategoryModal(false);
        setCategoryToDelete(null);
        setAdminPassword("");
        setDeleteCategoryError("");
        await loadCategories();
      } else {
        setDeleteCategoryError(result.message || 'Admin password is incorrect or category cannot be deleted');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteCategoryError('Admin password is incorrect or category cannot be deleted');
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
      setDeleteSubCategoryError("Please enter admin password");
      return;
    }

    try {
      setSubCategoryLoading(true);
      setDeleteSubCategoryError(""); // Clear any previous errors
      const result = await subCategoryApi.adminDeleteSubCategory(currentSubCategory.subCategoryId, adminPassword);

      if (result.success) {
        setSuccessMsg('Subcategory deleted successfully!');
        closeSubCategoryModal();
        await loadSubCategories();
      } else {
        setDeleteSubCategoryError(result.message || 'Admin password is incorrect or subcategory cannot be deleted');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setDeleteSubCategoryError('Admin password is incorrect or subcategory cannot be deleted');
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
    setDeleteSubCategoryError("");
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button
            onClick={() => window.location.href = '/admin'}
            className="hover:text-gray-700 transition-colors"
          >
            Admin Dashboard
          </button>
          <span>/</span>
          <button
            onClick={() => window.location.href = '/admin/products'}
            className="hover:text-gray-700 transition-colors"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">Categories</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-600 mt-2">Organize and manage your product categories and subcategories</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => window.location.href = '/admin/products'}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </button>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subcategories</p>
                <p className="text-2xl font-bold text-gray-900">{subCategories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories with Subs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => getSubCategoriesForCategory(cat.categoryId).length > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empty Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter(cat => getSubCategoriesForCategory(cat.categoryId).length === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter Categories</h2>
            <div className="text-sm text-gray-500">
              {filteredCategories.length} of {categories.length} categories
            </div>
          </div>
          <div className="max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {(successMsg || errorMsg) && (
          <div className="mb-8">
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Categories Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your product categories and their subcategories</p>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : currentCategories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Category
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Subcategories
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCategories.map((category) => {
                      const categorySubCategories = getSubCategoriesForCategory(category.categoryId);
                      return (
                        <tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">#{category.categoryId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.categoryName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {categorySubCategories.length > 0 ? (
                              <button
                                onClick={() => handleViewSubCategories(category.categoryId)}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {categorySubCategories.length} {categorySubCategories.length === 1 ? 'subcategory' : 'subcategories'}
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                0 subcategories
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openSubCategoryModal('add', category)}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Sub
                              </button>
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
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
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of{' '}
                      {filteredCategories.length} categories
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
                  <p className="text-sm text-gray-600">Create a new product category</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={addCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
                  <p className="text-sm text-gray-600">Update category information</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={editCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-red-50 rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600">Delete Category</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setDeleteCategoryError("");
                  setAdminPassword("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Warning</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You are about to delete <span className="font-semibold">{categoryToDelete?.categoryName}</span>.
                        This will permanently remove the category and all its subcategories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleConfirmDeleteCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (deleteCategoryError) setDeleteCategoryError("");
                    }}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    required
                  />
                </div>
                
                {deleteCategoryError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{deleteCategoryError}</p>
                  </div>
                )}
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteCategoryModal(false);
                      setDeleteCategoryError("");
                      setAdminPassword("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={deleteCategoryLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    disabled={deleteCategoryLoading}
                  >
                    {deleteCategoryLoading ? 'Deleting...' : 'Delete Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Universal SubCategory Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className={`flex items-center justify-between border-b border-gray-200 px-6 py-4 rounded-t-2xl ${
              subCategoryMode === 'delete' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  subCategoryMode === 'delete' ? 'bg-red-600' : 'bg-gray-900'
                }`}>
                  {subCategoryMode === 'add' && <Plus className="w-5 h-5 text-white" />}
                  {subCategoryMode === 'edit' && <Edit2 className="w-5 h-5 text-white" />}
                  {subCategoryMode === 'delete' && <Trash2 className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    subCategoryMode === 'delete' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {subCategoryMode === 'add' && 'Add Subcategory'}
                    {subCategoryMode === 'edit' && 'Edit Subcategory'}
                    {subCategoryMode === 'delete' && 'Delete Subcategory'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subCategoryMode === 'add' && 'Create a new subcategory'}
                    {subCategoryMode === 'edit' && 'Update subcategory information'}
                    {subCategoryMode === 'delete' && 'This action cannot be undone'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSubCategoryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {subCategoryMode === 'delete' && currentSubCategory && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Warning</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You are about to delete <span className="font-semibold">{currentSubCategory?.subCategoryName}</span>.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubCategorySubmit} className="p-6">
              {subCategoryMode !== 'delete' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    placeholder="Enter subcategory name"
                    required
                  />
                </div>
              )}
              
              {subCategoryMode === 'delete' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (deleteSubCategoryError) setDeleteSubCategoryError("");
                    }}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    required
                  />
                </div>
              )}
              
              {subCategoryMode === 'delete' && deleteSubCategoryError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-600">{deleteSubCategoryError}</p>
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeSubCategoryModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={subCategoryLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${
                    subCategoryMode === 'delete'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
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