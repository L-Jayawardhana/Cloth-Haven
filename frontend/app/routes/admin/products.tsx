import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from "lucide-react";
import { productApi, categoryApi } from '~/lib/api';
import type { Product, Category } from '~/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  };

  // Filter products based on search term, category, and stock
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || product.categoryId.toString() === categoryFilter;
    const matchesStock = stockFilter === "" || 
      (stockFilter === "inStock" && (product.totalQuantity || 0) > 0) ||
      (stockFilter === "outOfStock" && (product.totalQuantity || 0) === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    }, [searchTerm, categoryFilter, stockFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage product inventory and organize your catalog</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Add Product
            </button>
            <button 
              onClick={() => window.location.href = '/admin/categories'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Manage Categories
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <input 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.categoryId} value={category.categoryId.toString()}>
                {category.categoryName}
              </option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchTerm || categoryFilter || stockFilter ? 'No products found matching your filters.' : 'No products found.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentProducts.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.productId}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                          {getCategoryName(product.categoryId)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          ${product.productPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            (product.totalQuantity || 0) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.totalQuantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button 
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
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{' '}
                    {filteredProducts.length} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
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
    </div>
  );
}
