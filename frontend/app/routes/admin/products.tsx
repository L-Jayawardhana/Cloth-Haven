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
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-700">Products & Categories</h1>
        <div className="flex gap-2">
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Add Product</button>
          <button 
            onClick={() => window.location.href = '/admin/categories'}
            className="rounded-md border border-emerald-200 px-3 py-2 text-sm hover:bg-emerald-50"
          >
            Manage Categories
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input 
          className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <select 
          className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
          className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock Status</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>

      {/* Products counter */}
      <div className="text-sm text-gray-600 text-right">
        {filteredProducts.length > 0 
          ? `Found ${filteredProducts.length} of ${products.length} products`
          : `${filteredProducts.length} of ${products.length} products`
        }
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-center text-sm">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="px-4 py-3">Product ID</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock Quantity</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : currentProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm || categoryFilter || stockFilter ? 'No products found matching your filters.' : 'No products found.'}
                </td>
              </tr>
            ) : (
              currentProducts.map((product) => (
                <tr key={product.productId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{product.productId}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{getCategoryName(product.categoryId)}</td>
                  <td className="px-4 py-3">${product.productPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      (product.totalQuantity || 0) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.totalQuantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <div className="relative group">
                        <button 
                          className="p-1.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-700 hover:bg-emerald-200 hover:border-emerald-300 transition-colors duration-200"
                        >
                          <Edit2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-emerald-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Edit product
                        </div>
                      </div>
                      <div className="relative group">
                        <button 
                          className="p-1.5 rounded-md bg-green-100 border border-green-200 text-green-700 hover:bg-green-200 hover:border-green-300 transition-colors duration-200"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-green-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Delete product
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
      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-emerald-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
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

      <div className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Category Management</h2>
        <div className="flex gap-2">
          <input className="h-10 w-full rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="New category name" />
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Add</button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {['Tops','Bottoms','Accessories','Outerwear','Footwear'].map((c) => (
            <div key={c} className="flex items-center justify-between rounded-md border border-emerald-200 px-3 py-2 text-sm">
              <span>{c}</span>
              <div className="flex gap-2">
                <button className="rounded-md border border-emerald-200 px-2 py-1 text-xs hover:bg-emerald-50">Rename</button>
                <button className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
