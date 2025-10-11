import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  productApi, 
  imageApi, 
  categoryApi, 
  subCategoryApi,
  type Product, 
  type ProductImage, 
  type Category, 
  type SubCategory 
} from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<{ [key: number]: ProductImage[] }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | 'all'>('all');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('featured');
  
  // Collapsible section states
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);
  
  // Available options extracted from products
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  // Handle adding product to cart
  const handleAddToCart = async (productId: number) => {
    try {
      // TODO: Implement actual cart API call
      console.log('Adding product to cart:', productId);
      
      // For now, just show a success message
      const product = products.find(p => p.productId === productId);
      if (product) {
        alert(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  // Filter handlers
  const handleCategoryChange = (value: string) => {
    const categoryId = value === 'all' ? 'all' : parseInt(value);
    setSelectedCategory(categoryId);
    setSelectedSubCategory('all'); // Reset subcategory when category changes
  };

  const handleSubCategoryChange = (value: string) => {
    const subCategoryId = value === 'all' ? 'all' : parseInt(value);
    setSelectedSubCategory(subCategoryId);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleAvailability = (availability: string) => {
    setSelectedAvailability(prev =>
      prev.includes(availability)
        ? prev.filter(a => a !== availability)
        : [...prev, availability]
    );
  };

  const toggleFeatured = (feature: string) => {
    setSelectedFeatured(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Manual refresh function for debugging
  const refreshCategories = async () => {
    try {
      console.log('🔄 Manually refreshing categories...');
      const categoriesData = await categoryApi.getAllCategories();
      console.log('🏷️ Manual refresh - Categories data:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setPriceRange(10000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedAvailability([]);
    setSelectedFeatured([]);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Starting to fetch initial data...');
        
        // Fetch all data in parallel
        const [productsData, categoriesData] = await Promise.all([
          productApi.getAllProducts(),
          categoryApi.getAllCategories().catch((err) => {
            console.warn('⚠️ Categories API failed:', err);
            return [];
          })
        ]);
        
        console.log('📦 Products data received:', productsData);
        console.log('🏷️ Categories data received:', categoriesData);
        
        // Handle products data
        if (Array.isArray(productsData)) {
          setProducts(productsData);
          setFilteredProducts(productsData);
          
          // Fetch images for each product
          console.log('🖼️ Fetching images for products from image table...');
          const imagePromises = productsData.map(async (product) => {
            try {
              console.log(`📸 Fetching images for product ID: ${product.productId}`);
              const images = await imageApi.getImagesByProductId(product.productId);
              console.log(`✅ Images found for product ${product.productId}:`, images);
              return { productId: product.productId, images: Array.isArray(images) ? images : [] };
            } catch (err) {
              console.warn(`⚠️ No images found for product ${product.productId}:`, err);
              return { productId: product.productId, images: [] };
            }
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap: { [key: number]: ProductImage[] } = {};
          imageResults.forEach(({ productId, images }) => {
            imageMap[productId] = images;
          });
          setProductImages(imageMap);
          console.log('🎨 Final image map:', imageMap);
        } else {
          console.warn('⚠️ Unexpected products response format:', productsData);
          setProducts([]);
          setFilteredProducts([]);
        }

        // Handle categories data
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
          console.log('✅ Categories loaded successfully:', categoriesData);
        } else {
          console.warn('⚠️ No categories found or invalid format:', categoriesData);
          setCategories([]);
        }

      } catch (err: any) {
        console.error('❌ Error fetching initial data:', err);
        setError(`Backend connection failed: ${err.message || 'Unknown error'}`);
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
        console.log('🏁 Initial data fetch completed');
      }
    };

    fetchInitialData();
  }, []);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(product => product.subCategoryId === selectedSubCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => product.productPrice <= priceRange);

    // Filter by sizes (if any selected)
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        selectedSizes.some(size => product.availableSizes?.includes(size))
      );
    }

    // Filter by colors (if any selected)
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        selectedColors.some(color => product.availableColors?.includes(color))
      );
    }

    // Filter by availability
    if (selectedAvailability.length > 0) {
      filtered = filtered.filter(product => {
        if (selectedAvailability.includes('In Stock') && (product.totalQuantity || 0) > 0) return true;
        if (selectedAvailability.includes('Out of Stock') && (product.totalQuantity || 0) === 0) return true;
        return false;
      });
    }

    // Filter by featured status (mock implementation)
    if (selectedFeatured.length > 0) {
      filtered = filtered.filter(product => {
        // This is a mock implementation - you can add actual featured logic based on your backend
        if (selectedFeatured.includes('Featured') && product.productId % 3 === 0) return true;
        if (selectedFeatured.includes('New Arrival') && product.productId % 5 === 0) return true;
        if (selectedFeatured.includes('Best Seller') && product.productId % 7 === 0) return true;
        return false;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.productPrice - b.productPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.productPrice - a.productPrice);
        break;
      case 'newest':
        filtered.sort((a, b) => b.productId - a.productId); // Assuming higher ID = newer
        break;
      case 'best-selling':
        filtered.sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0));
        break;
      case 'featured':
      default:
        // Featured sort - products with ID divisible by 3 come first
        filtered.sort((a, b) => {
          const aFeatured = a.productId % 3 === 0 ? 1 : 0;
          const bFeatured = b.productId % 3 === 0 ? 1 : 0;
          return bFeatured - aFeatured;
        });
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubCategory, priceRange, selectedSizes, selectedColors, selectedAvailability, selectedFeatured, sortBy]);

  // Extract available sizes and colors from products
  useEffect(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();

    products.forEach(product => {
      if (product.availableSizes) {
        product.availableSizes.forEach(size => sizes.add(size));
      }
      if (product.availableColors) {
        product.availableColors.forEach(color => colors.add(color));
      }
    });

    setAvailableSizes(Array.from(sizes));
    setAvailableColors(Array.from(colors));
  }, [products]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedCategory !== 'all') {
        try {
          console.log(`🔍 Fetching subcategories for category ${selectedCategory}...`);
          const subCats = await subCategoryApi.getSubCategoriesByCategory(selectedCategory as number);
          console.log(`📂 Subcategories found:`, subCats);
          setSubCategories(subCats);
        } catch (error) {
          console.warn('⚠️ Failed to fetch subcategories:', error);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Load Products</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-gray-500">Make sure your backend is running on:</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            {/* Main Filters Card */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Filters
                  </h2>
                  <button 
                    onClick={clearAllFilters}
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                    {categories.length === 0 && (
                      <span className="ml-2 text-xs text-red-500">(Loading from database...)</span>
                    )}
                  </label>
                  <select 
                    value={selectedCategory.toString()}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    disabled={categories.length === 0}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.categoryId} value={category.categoryId.toString()}>
                        {category.categoryName}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <option disabled>No categories found - Check backend connection</option>
                    )}
                  </select>
                </div>

                {/* SubCategory Filter - Show when category is selected */}
                {selectedCategory !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sub Category
                      {subCategories.length === 0 && (
                        <span className="ml-2 text-xs text-orange-500">(Loading subcategories...)</span>
                      )}
                    </label>
                    <select 
                      value={selectedSubCategory.toString()}
                      onChange={(e) => handleSubCategoryChange(e.target.value)}
                      className="w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 transition-colors"
                      disabled={subCategories.length === 0}
                    >
                      <option value="all">All Sub Categories</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory.subCategoryId} value={subCategory.subCategoryId.toString()}>
                          {subCategory.subCategoryName}
                        </option>
                      ))}
                      {subCategories.length === 0 && (
                        <option disabled>Loading subcategories from database...</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            
            {/* Collapsible Filter Sections */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Availability Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Availability</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isAvailabilityOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isAvailabilityOpen && (
                  <div className="px-6 pb-4 space-y-2">
                    {['In Stock', 'Out of Stock'].map(availability => (
                      <label key={availability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAvailability.includes(availability)}
                          onChange={() => toggleAvailability(availability)}
                          className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-gray-700">{availability}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Price</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isPriceOpen && (
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        Max Price: LKR {priceRange.toLocaleString()}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>LKR 0</span>
                        <span>LKR 10,000+</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsSizeOpen(!isSizeOpen)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Size</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isSizeOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isSizeOpen && (
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {availableSizes.length > 0 ? (
                        availableSizes.map(size => (
                          <button 
                            key={size} 
                            onClick={() => handleSizeToggle(size)}
                            className={`px-3 py-2 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                              selectedSizes.includes(size)
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        ['XS','S','M','L','XL','XXL'].map(size => (
                          <button 
                            key={size} 
                            onClick={() => handleSizeToggle(size)}
                            className={`px-3 py-2 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                              selectedSizes.includes(size)
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      )}
                    </div>
                    {selectedSizes.length > 0 && (
                      <div className="mt-3 text-xs text-gray-600">
                        Selected: {selectedSizes.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setIsColorOpen(!isColorOpen)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Color</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isColorOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isColorOpen && (
                  <div className="px-6 pb-4">
                    <div className="space-y-2">
                      {availableColors.length > 0 ? (
                        availableColors.map(color => (
                          <label key={color} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedColors.includes(color)}
                              onChange={() => toggleColor(color)}
                              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{color}</span>
                          </label>
                        ))
                      ) : (
                        ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Brown', 'Navy'].map(color => (
                          <label key={color} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedColors.includes(color)}
                              onChange={() => toggleColor(color)}
                              className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                            />
                            <span className="ml-2 text-sm text-gray-700">{color}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedColors.length > 0 && (
                      <div className="mt-3 text-xs text-gray-600">
                        Selected: {selectedColors.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Featured Filter */}
              <div>
                <button
                  onClick={() => setIsFeaturedOpen(!isFeaturedOpen)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Featured</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isFeaturedOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isFeaturedOpen && (
                  <div className="px-6 pb-4">
                    <div className="space-y-2">
                      {['Featured', 'New Arrival', 'Best Seller'].map(feature => (
                        <label key={feature} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFeatured.includes(feature)}
                            onChange={() => toggleFeatured(feature)}
                            className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                    {selectedFeatured.length > 0 && (
                      <div className="mt-3 text-xs text-gray-600">
                        Selected: {selectedFeatured.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* Products Header & Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredProducts.length} of {products.length} {products.length === 1 ? 'product' : 'products'}
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 text-blue-600">
                      in {categories.find(c => c.categoryId === selectedCategory)?.categoryName || 'selected category'}
                    </span>
                  )}
                  {selectedSubCategory !== 'all' && (
                    <span className="ml-2 text-green-600">
                      › {subCategories.find(sc => sc.subCategoryId === selectedSubCategory)?.subCategoryName || 'selected subcategory'}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 shadow-sm text-sm focus:border-gray-500 focus:ring-gray-500 px-3 py-2"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="best-selling">Best Selling</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const images = productImages[product.productId] || [];
                
                return (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    images={images}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>

            {filteredProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}