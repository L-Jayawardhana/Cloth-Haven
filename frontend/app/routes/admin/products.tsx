import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { productApi, categoryApi, subCategoryApi, colorSizeApi, imageApi } from '~/lib/api';
import type { Product, Category, SubCategory } from '~/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  
  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productPrice: '',
    categoryId: '',
    subCategoryId: ''
  });
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'basic' | 'sizeColor' | 'images'>('basic');
  
  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Delete Product State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Size and Color State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeColorCombinations, setSizeColorCombinations] = useState<{[size: string]: string[]}>({});
  
  // Image State
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  
  // Available size and color options
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
  const availableColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray', 'Navy', 'Brown', 'Pink', 'Purple', 'Yellow', 'Orange'];
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11;

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSubCategories();
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

  const loadSubCategories = async () => {
    try {
      const data = await subCategoryApi.getAllSubCategories();
      setSubCategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubCategories([]);
    }
  };

  // Handle category change in form to filter subcategories
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId, subCategoryId: '' }));
    if (categoryId) {
      const filtered = subCategories.filter(sub => sub.categoryId.toString() === categoryId);
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  };

  // Handle size selection
  const handleSizeSelection = (size: string, isSelected: boolean) => {
    console.log('DEBUG: Size selection changed:', size, 'selected:', isSelected);
    if (isSelected) {
      setSelectedSizes(prev => {
        const newSizes = [...prev, size];
        console.log('DEBUG: New selectedSizes:', newSizes);
        return newSizes;
      });
      setSizeColorCombinations(prev => {
        const newCombinations = { ...prev, [size]: [] };
        console.log('DEBUG: New sizeColorCombinations after adding size:', newCombinations);
        return newCombinations;
      });
    } else {
      setSelectedSizes(prev => {
        const newSizes = prev.filter(s => s !== size);
        console.log('DEBUG: New selectedSizes after removal:', newSizes);
        return newSizes;
      });
      setSizeColorCombinations(prev => {
        const newCombinations = { ...prev };
        delete newCombinations[size];
        console.log('DEBUG: New sizeColorCombinations after removing size:', newCombinations);
        return newCombinations;
      });
    }
  };

  // Handle color selection for a specific size
  const handleColorSelection = (size: string, color: string, isSelected: boolean) => {
    console.log('DEBUG: Color selection changed for size:', size, 'color:', color, 'selected:', isSelected);
    setSizeColorCombinations(prev => {
      const newCombinations = {
        ...prev,
        [size]: isSelected 
          ? [...(prev[size] || []), color]
          : (prev[size] || []).filter(c => c !== color)
      };
      console.log('DEBUG: New sizeColorCombinations:', newCombinations);
      return newCombinations;
    });
  };

  // Handle image URL changes
  const handleImageUrlChange = (index: number, value: string) => {
    setImageUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  // Add new image URL field
  const addImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  // Remove image URL field
  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate image URL format
  const isValidImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    const imageUrlPattern = /^(https?:\/\/).*\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    return imageUrlPattern.test(url);
  };

  // Get valid image URLs
  const getValidImageUrls = (): string[] => {
    return imageUrls.filter(url => url.trim() !== '' && isValidImageUrl(url));
  };

  // Handle form submission (Save button)
  const handleSave = async () => {
    setFormError('');
    
    // Validation
    if (!formData.name.trim() || !formData.productPrice || !formData.categoryId) {
      setFormError('Please fill in all required fields in Basic Information');
      setActiveTab('basic');
      return;
    }

    // For new products, require size/color selection
    if (!editingProduct && selectedSizes.length === 0) {
      setFormError('Please select at least one size in Size & Color tab');
      setActiveTab('sizeColor');
      return;
    }

    // Check if all selected sizes have at least one color (only for new products or when sizes are selected)
    if (!editingProduct && selectedSizes.length > 0) {
      for (const size of selectedSizes) {
        if (!sizeColorCombinations[size] || sizeColorCombinations[size].length === 0) {
          setFormError(`Please select at least one color for size ${size} in Size & Color tab`);
          setActiveTab('sizeColor');
          return;
        }
      }
    }

    // Validate image URLs
    const validImageUrls = getValidImageUrls();
    const hasInvalidUrls = imageUrls.some(url => url.trim() !== '' && !isValidImageUrl(url));
    
    if (hasInvalidUrls) {
      setFormError('Please ensure all image URLs are valid and end with supported formats (jpg, jpeg, png, gif, bmp, webp)');
      setActiveTab('images');
      return;
    }

    const price = parseFloat(formData.productPrice);
    if (isNaN(price) || price <= 0) {
      setFormError('Please enter a valid price');
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        productPrice: price,
        categoryId: parseInt(formData.categoryId),
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : undefined
      };

      console.log(editingProduct ? 'Updating product with data:' : 'Creating product with data:', productData);
      
      // Create or update the product
      let processedProduct: Product;
      if (editingProduct) {
        processedProduct = await productApi.updateProduct(editingProduct.productId!, productData);
        console.log('Product updated successfully:', processedProduct);
      } else {
        processedProduct = await productApi.createProduct(productData);
        console.log('Product created successfully:', processedProduct);
      }
      
      const productId = processedProduct.productId;
      if (!productId) {
        throw new Error('Product ID not returned from server');
      }

      // Handle size/color variants for both create and update
      console.log('DEBUG: selectedSizes:', selectedSizes);
      console.log('DEBUG: sizeColorCombinations:', sizeColorCombinations);
      console.log('DEBUG: editingProduct:', editingProduct);
      
      // Process size/color variants
      if (selectedSizes.length > 0 || editingProduct) {
        try {
          if (editingProduct) {
            // For editing, we need to be smart about preserving existing quantities
            console.log('Smart update: comparing existing vs new variants for product:', productId);
            
            // Get current variants from database
            const existingVariants = await colorSizeApi.getByProductId(productId);
            console.log('Existing variants:', existingVariants);
            
            // Build new variants from form
            const newVariants: Array<{
              productId: number;
              color: string;
              size: string;
              quantity: number;
              availability: boolean;
            }> = [];
            
            for (const size of selectedSizes) {
              const colors = sizeColorCombinations[size] || [];
              for (const color of colors) {
                newVariants.push({
                  productId: productId,
                  color: color,
                  size: size,
                  quantity: 0, // Will be updated below if existing
                  availability: true
                });
              }
            }
            
            console.log('New variants from form:', newVariants);
            
            // Create sets for comparison
            const existingKeys = new Set(
              existingVariants.map(v => `${v.size}-${v.color}`)
            );
            const newKeys = new Set(
              newVariants.map(v => `${v.size}-${v.color}`)
            );
            
            // Find variants to delete (exist in DB but not in form)
            const toDelete = existingVariants.filter(v => 
              !newKeys.has(`${v.size}-${v.color}`)
            );
            
            // Find variants to add (in form but not in DB)
            const toAdd = newVariants.filter(v => 
              !existingKeys.has(`${v.size}-${v.color}`)
            );
            
            // Preserve quantities for existing variants that are kept
            newVariants.forEach(newVariant => {
              const existing = existingVariants.find(e => 
                e.size === newVariant.size && e.color === newVariant.color
              );
              if (existing) {
                newVariant.quantity = existing.quantity;
                newVariant.availability = existing.availability;
              }
            });
            
            console.log('Variants to delete:', toDelete);
            console.log('Variants to add:', toAdd);
            
            // Delete removed variants individually
            for (const variant of toDelete) {
              if (variant.id) {
                console.log(`Deleting variant: ${variant.size}-${variant.color} (ID: ${variant.id})`);
                await colorSizeApi.deleteVariant(variant.id);
              }
            }
            
            // Add new variants
            if (toAdd.length > 0) {
              console.log('Creating new variants:', toAdd);
              await colorSizeApi.createColorSizeEntriesBatch(toAdd);
            }
            
            console.log('Smart update completed - existing quantities preserved');
          } else {
            // For new products, create all variants normally
            if (selectedSizes.length > 0) {
              console.log('Creating color-size entries for new product:', productId);
              const colorSizeEntries: Array<{
                productId: number;
                color: string;
                size: string;
                quantity: number;
                availability: boolean;
              }> = [];
              
              for (const size of selectedSizes) {
                const colors = sizeColorCombinations[size] || [];
                for (const color of colors) {
                  colorSizeEntries.push({
                    productId: productId,
                    color: color,
                    size: size,
                    quantity: 0,
                    availability: true
                  });
                }
              }
              
              if (colorSizeEntries.length > 0) {
                console.log('Creating batch color-size entries:', colorSizeEntries);
                await colorSizeApi.createColorSizeEntriesBatch(colorSizeEntries);
                console.log('Successfully created all color-size entries');
              }
            }
          }
        } catch (colorSizeError: any) {
          console.error('Error managing color-size entries:', colorSizeError);
          setFormError(`Product ${editingProduct ? 'updated' : 'created'} but failed to add size/color variants. Please add them manually in inventory.`);
        }
      } else {
        console.log('No sizes selected - skipping color-size entry creation');
      }

      // Handle images for both create and update
      if (validImageUrls.length > 0 || editingProduct) {
        try {
          if (editingProduct) {
            // For editing, be smart about preserving vs updating images
            console.log('Smart update: comparing existing vs new images for product:', productId);
            
            // Get current images from database
            const existingImages = await imageApi.getImagesByProductId(productId);
            console.log('Existing images:', existingImages);
            
            // Create sets for comparison
            const existingUrls = new Set(existingImages.map(img => img.imageUrl));
            const newUrls = new Set(validImageUrls);
            
            // Find images to delete (exist in DB but not in form)
            const imagesToDelete = existingImages.filter(img => 
              !newUrls.has(img.imageUrl)
            );
            
            // Find images to add (in form but not in DB)
            const imagesToAdd = validImageUrls.filter(url => 
              !existingUrls.has(url)
            );
            
            console.log('Images to delete:', imagesToDelete);
            console.log('Images to add:', imagesToAdd);
            
            // Delete removed images individually
            for (const image of imagesToDelete) {
              if (image.imageId) {
                console.log(`Deleting image: ${image.imageUrl} (ID: ${image.imageId})`);
                await imageApi.deleteImage(image.imageId);
              }
            }
            
            // Add new images
            if (imagesToAdd.length > 0) {
              console.log('Creating new images:', imagesToAdd);
              const imageData = imagesToAdd.map(url => ({
                imageUrl: url,
                productId: productId
              }));
              await imageApi.createImagesBatch(imageData);
            }
            
            console.log('Smart image update completed');
          } else {
            // For new products, create all images normally
            if (validImageUrls.length > 0) {
              console.log('Creating images for new product:', productId, validImageUrls);
              const imageData = validImageUrls.map(url => ({
                imageUrl: url,
                productId: productId
              }));
              await imageApi.createImagesBatch(imageData);
              console.log('Successfully created all images');
            }
          }
        } catch (imageError: any) {
          console.error('Error creating images:', imageError);
          setFormError(`Product ${editingProduct ? 'updated' : 'created'} but failed to add some images. You can add them later.`);
        }
      }
      
      console.log(editingProduct ? 'Product updated successfully' : 'Product, variants, and images created successfully');
      
      // Reset form and close modal
      resetForm();
      setIsAddModalOpen(false);
      
      // Reload products
      loadProducts();
    } catch (error: any) {
      console.error(editingProduct ? 'Error updating product:' : 'Error creating product:', error);
      setFormError(error.message || (editingProduct ? 'Failed to update product' : 'Failed to create product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      productPrice: '',
      categoryId: '',
      subCategoryId: ''
    });
    setSelectedSizes([]);
    setSizeColorCombinations({});
    setFilteredSubCategories([]);
    setImageUrls(['']); // Reset to single empty image URL input
    setEditingProduct(null); // Clear editing state
    setFormError('');
    setActiveTab('basic');
  };

  // Clear form function (for clear button)
  const clearForm = () => {
    resetForm();
  };

  // Edit product function
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      productPrice: product.productPrice.toString(),
      categoryId: product.categoryId.toString(),
      subCategoryId: product.subCategoryId ? product.subCategoryId.toString() : ''
    });

    // Set filtered subcategories for the product's category
    const categorySubcats = subCategories.filter(sub => sub.categoryId === product.categoryId);
    setFilteredSubCategories(categorySubcats);

    // Fetch and populate size/color and image URLs
    Promise.all([
      colorSizeApi.getByProductId(product.productId),
      imageApi.getImagesByProductId(product.productId)
    ]).then(([colorSizeData, imageData]) => {
      // Populate sizes and colors
      const sizes = Array.from(new Set(colorSizeData.map(cs => cs.size)));
      setSelectedSizes(sizes);
      const sizeColorMap: Record<string, string[]> = {};
      sizes.forEach(size => {
        sizeColorMap[size] = colorSizeData.filter(cs => cs.size === size).map(cs => cs.color);
      });
      setSizeColorCombinations(sizeColorMap);

      // Populate image URLs
      const urls = imageData.map(img => img.imageUrl);
      setImageUrls(urls.length > 0 ? urls : ['']);
    });

    setActiveTab('basic');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Delete product function (soft delete with admin verification)
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setAdminPassword("");
    setShowDeleteModal(true);
    setFormError('');
  };

  const handleConfirmDeleteProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToDelete || !adminPassword.trim()) {
      setFormError("Please enter admin password");
      return;
    }

    try {
      setDeleteLoading(true);
      const result = await productApi.adminSoftDeleteProduct(productToDelete.productId, adminPassword);

      if (result.success) {
        console.log('Product soft deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        setAdminPassword("");
        setFormError('');
        loadProducts(); // Refresh the product list
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setFormError('Failed to delete product. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setAdminPassword("");
    setFormError('');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Product Management</h1>
          <p className="text-slate-600 mt-1">Manage product inventory and organize your catalog</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
          <button 
            onClick={() => window.location.href = '/admin/categories'}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Manage Categories
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <input 
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <select 
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock Status</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading products...</p>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">
              {searchTerm || categoryFilter || stockFilter ? 'No products found matching your filters.' : 'No products found.'}
            </p>
          </div>
        ) : (
          <>
            <div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Stock Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {currentProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                        {product.productId}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900">
                        ${product.productPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          (product.totalQuantity || 0) > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.totalQuantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center px-3 py-1 border border-slate-300 rounded-md text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50 transition-colors"
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
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} products
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-600">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/10" onClick={() => {
            setIsAddModalOpen(false);
            resetForm();
          }} />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {editingProduct ? 'Update product information' : 'Create a new product entry'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetForm();
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              
              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab('basic')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'basic'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Basic Information
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sizeColor')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'sizeColor'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Size & Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('images')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'images'
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Images
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Enter product description"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.categoryId} value={category.categoryId.toString()}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                      <select
                        value={formData.subCategoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, subCategoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        disabled={!formData.categoryId || filteredSubCategories.length === 0}
                      >
                        <option value="">Select a subcategory (optional)</option>
                        {filteredSubCategories.map(subCategory => (
                          <option key={subCategory.subCategoryId} value={subCategory.subCategoryId.toString()}>
                            {subCategory.subCategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.productPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, productPrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Size & Color Tab */}
                {activeTab === 'sizeColor' && (
                  <div className="space-y-6">
                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes *</label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-4 gap-3">
                          {availableSizes.map(size => (
                            <label key={size} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-white transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedSizes.includes(size)}
                                onChange={(e) => handleSizeSelection(size, e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{size}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Color Selection for each selected size */}
                    {selectedSizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Colors for Each Size *</label>
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {selectedSizes.map(size => (
                            <div key={size} className="border border-gray-200 rounded-lg p-4 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-800">Size {size}</h5>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {sizeColorCombinations[size]?.length || 0} colors selected
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {availableColors.map(color => (
                                  <label key={`${size}-${color}`} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={sizeColorCombinations[size]?.includes(color) || false}
                                      onChange={(e) => handleColorSelection(size, color, e.target.checked)}
                                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs text-gray-700">{color}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selection Summary */}
                    {selectedSizes.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-emerald-800 mb-2">Selection Summary</h5>
                        <div className="space-y-1">
                          <p className="text-sm text-emerald-700">
                            <span className="font-medium">{selectedSizes.length}</span> sizes selected
                          </p>
                          <p className="text-sm text-emerald-700">
                            <span className="font-medium">
                              {Object.values(sizeColorCombinations).reduce((total, colors) => total + colors.length, 0)}
                            </span> total variants will be created
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Images Tab */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Product Images</label>
                      <p className="text-sm text-gray-500 mb-4">
                        Add image URLs for your product. Images should be in JPG, JPEG, PNG, GIF, BMP, or WebP format.
                      </p>
                      
                      {/* Image URL inputs */}
                      <div className="space-y-3">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <div className="flex-1">
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                                  url.trim() !== '' && !isValidImageUrl(url)
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-emerald-500'
                                }`}
                                placeholder={`Image URL ${index + 1} (e.g., https://example.com/image.jpg)`}
                              />
                              {url.trim() !== '' && !isValidImageUrl(url) && (
                                <p className="text-xs text-red-600 mt-1">
                                  Please enter a valid image URL ending with .jpg, .jpeg, .png, .gif, .bmp, or .webp
                                </p>
                              )}
                            </div>
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageUrl(index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Remove this image URL"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* Add new image URL button */}
                        <button
                          type="button"
                          onClick={addImageUrl}
                          className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                        >
                          + Add Another Image URL
                        </button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {getValidImageUrls().length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Valid Images ({getValidImageUrls().length})
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            {getValidImageUrls().map((url, index) => (
                              <div key={index} className="bg-white p-2 rounded border">
                                <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-2">
                                  <img
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'block';
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600 break-all">
                                  {url.length > 40 ? `${url.substring(0, 40)}...` : url}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Images Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Image Summary</h5>
                      <div className="space-y-1">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">{getValidImageUrls().length}</span> valid images will be saved
                        </p>
                        {imageUrls.filter(url => url.trim() !== '' && !isValidImageUrl(url)).length > 0 && (
                          <p className="text-sm text-red-600">
                            <span className="font-medium">
                              {imageUrls.filter(url => url.trim() !== '' && !isValidImageUrl(url)).length}
                            </span> invalid URLs need to be fixed
                          </p>
                        )}
                      </div>
                    </div>
                      {/* Save/Update button only in Images tab */}
                      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (editingProduct ? 'Updating...' : 'Saving...') : (editingProduct ? 'Update Product' : 'Save Product')}
                        </button>
                      </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" onClick={handleCancelDelete} />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-red-600">
                Delete Product
              </h3>
              <p className="text-sm text-gray-600">
                This action requires admin verification
              </p>
            </div>
            
            <form onSubmit={handleConfirmDeleteProduct} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to delete "<strong>{productToDelete.name}</strong>"?
                </p>
                <p className="text-xs text-red-600">
                  This will hide the product from the frontend but keep it in the database for inventory logs and reports.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || !adminPassword.trim()}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
