import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { productApi, imageApi, colorSizeApi, cartApi, type Product, type ProductImage, type ColorsSizeQuantityAvailability } from '../../lib/api';

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [colorSizeData, setColorSizeData] = useState<ColorsSizeQuantityAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Helper function to get color code
  const getColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#dc2626',
      'blue': '#2563eb',
      'green': '#16a34a',
      'yellow': '#eab308',
      'purple': '#9333ea',
      'pink': '#ec4899',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'brown': '#92400e',
      'orange': '#ea580c',
      'navy': '#1e3a8a',
      'maroon': '#7f1d1d',
      'beige': '#f5f5dc',
      'khaki': '#f0e68c',
      'olive': '#6b7280'
    };
    
    return colorMap[colorName.toLowerCase()] || '#6b7280';
  };

  // Function to refresh product data
  const refreshProductData = async () => {
    if (!productId) return;
    
    try {
      const productIdNum = parseInt(productId);
      console.log(`Refreshing data for product ${productIdNum}...`);
      
      // Fetch fresh color, size, and availability data
      const colorSizeData = await colorSizeApi.getByProductId(productIdNum);
      console.log(`Refreshed color/size data for product ${productIdNum}:`, colorSizeData);
      
      if (Array.isArray(colorSizeData) && colorSizeData.length > 0) {
        setColorSizeData(colorSizeData);
        
        // Update selections if current ones are no longer valid
        const availableColors = [...new Set(colorSizeData.map(item => item.color).filter(Boolean))];
        const availableSizes = [...new Set(
          colorSizeData
            .filter(item => item.color === selectedColor)
            .map(item => item.size)
            .filter(Boolean)
        )];
        
        // Update color if current selection is no longer available
        if (!availableColors.includes(selectedColor) && availableColors.length > 0) {
          setSelectedColor(availableColors[0]);
        }
        
        // Update size if current selection is no longer available
        if (!availableSizes.includes(selectedSize) && availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
        }
      }
    } catch (error) {
      console.error('Error refreshing product data:', error);
    }
  };

  useEffect(() => {
    if (!productId) return;

    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productIdNum = parseInt(productId);
        
        // Fetch product details from backend API
        const productData = await productApi.getProductById(productIdNum);
        setProduct(productData);

        // Fetch product images from backend API
        try {
          const imagesData = await imageApi.getImagesByProductId(productIdNum);
          setProductImages(Array.isArray(imagesData) ? imagesData : []);
        } catch (imgError) {
          console.warn('No images found for product:', productIdNum);
          setProductImages([]);
        }

        // Fetch color, size, and availability data from backend API
        try {
          const colorSizeData = await colorSizeApi.getByProductId(productIdNum);
          
          if (Array.isArray(colorSizeData) && colorSizeData.length > 0) {
            setColorSizeData(colorSizeData);
            
            // Set default selections from backend data
            const firstColor = colorSizeData[0].color;
            const firstSize = colorSizeData.find(item => item.color === firstColor)?.size || '';
            setSelectedColor(firstColor);
            setSelectedSize(firstSize);
          } else {
            console.warn(`No color/size data available for product ${productIdNum}`);
            setColorSizeData([]);
          }
        } catch (csError) {
          console.error('Error fetching color/size data:', csError);
          setColorSizeData([]);
        }
        
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product details from backend');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  // Auto-refresh to get latest data from backend
  useEffect(() => {
    if (!productId) return;

    const interval = setInterval(async () => {
      try {
        const productIdNum = parseInt(productId);
        
        // Fetch fresh data from backend
        const freshColorSizeData = await colorSizeApi.getByProductId(productIdNum);
        
        if (Array.isArray(freshColorSizeData)) {
          // Check if data has changed
          const hasChanges = JSON.stringify(colorSizeData) !== JSON.stringify(freshColorSizeData);
          
          if (hasChanges) {
            console.log(`Data updated for product ${productIdNum}`);
            setColorSizeData(freshColorSizeData);
          }
        }
      } catch (error) {
        console.error(`Auto-refresh failed for product ${productId}:`, error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [productId, colorSizeData]);

  // Get unique colors for this product
  const availableColors = Array.from(
    new Set(colorSizeData.map(item => item.color).filter(Boolean))
  ).map(colorName => {
    return {
      name: colorName!,
      code: getColorCode(colorName!)
    };
  });

  // Get ALL available sizes for this product
  const allProductSizes = Array.from(
    new Set(
      colorSizeData
        .filter(item => item.productId === parseInt(productId || '0'))
        .map(item => item.size || '')
        .filter(size => size !== '')
    )
  );

  // Get available sizes for selected color
  const availableSizes = allProductSizes.map(sizeName => {
    const sizeEntries = colorSizeData.filter(
      item => 
        item.color === selectedColor && 
        item.size === sizeName && 
        item.productId === parseInt(productId || '0')
    );
    const isAvailable = sizeEntries.some(entry => entry.quantity > 0);
    
    return {
      name: sizeName,
      available: isAvailable
    };
  });

  // Get current selection info
  const currentSelection = colorSizeData.find(
    item => item.color === selectedColor && item.size === selectedSize
  );

  const maxQuantity = currentSelection?.quantity || 0;
  const isInStock = maxQuantity > 0;

  // Check if the entire product is out of stock
  const hasAnyStock = colorSizeData.some(item => 
    item.productId === parseInt(productId || '0') && item.quantity > 0
  );
  const isProductCompletelyOutOfStock = colorSizeData.length === 0 || !hasAnyStock;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!isInStock) return;
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    const resolvedUserId = user ? (user.userId ?? user.userid ?? user.id ?? null) : null;
    if (!resolvedUserId) {
      alert('Please sign in to add items to cart.');
      return;
    }
    try {
      await cartApi.addItemToCart({ userId: resolvedUserId, productId: product!.productId, quantity });
      alert(`Added ${quantity} x ${product!.name} (${selectedColor}, ${selectedSize}) to cart!`);
    } catch (err) {
      console.error('Add to cart failed', err);
      alert('Failed to add to cart');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  // Default image for products with no images
  const defaultImageUrl = "https://placehold.co/600x800?text=No+Image";
  const displayImages = productImages.length > 0 ? productImages : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-gray-900">Collections</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={displayImages[selectedImageIndex]?.imageUrl || defaultImageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultImageUrl;
                }}
              />
              {isProductCompletelyOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">Out of Stock</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images - only show if there are real product images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-gray-900' : 'border-transparent'
                    } hover:border-gray-400 transition-colors`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = defaultImageUrl;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-900">
                  LKR {product.productPrice.toFixed(2)}
                </span>
                {product.productPrice > 1500 && (
                  <div className="text-sm text-gray-600">
                    <span>or with 3 installments of </span>
                    <span className="font-semibold">LKR {(product.productPrice / 3).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {/* Out of Stock Banner */}
              {isProductCompletelyOutOfStock && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        This product is currently out of stock
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>We're sorry, but this item is not available in any size or color at the moment. Please check back later.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  AVAILABLE COLOR: {selectedColor.toUpperCase()}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-12 h-12 rounded-lg border-2 ${
                        selectedColor === color.name ? 'border-gray-900' : 'border-gray-300'
                      } hover:border-gray-400 transition-colors`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    >
                      {color.code === '#ffffff' && (
                        <div className="absolute inset-1 border border-gray-200 rounded-md"></div>
                      )}
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${color.code === '#ffffff' ? 'bg-gray-900' : 'bg-white'}`}></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900">
                    AVAILABLE SIZES ({availableSizes.length}): {selectedSize}
                  </label>
                  <button 
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-gray-600 underline hover:text-gray-900"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => {
                        setSelectedSize(size.name);
                        setQuantity(1);
                      }}
                      disabled={!size.available}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedSize === size.name
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : size.available
                          ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={size.available ? `Available size: ${size.name}` : `Out of stock: ${size.name}`}
                    >
                      {size.name} {!size.available && '❌'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current selection out of stock message */}
            {!isInStock && selectedSize && selectedColor && !isProductCompletelyOutOfStock && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>{selectedSize}</strong> size in <strong>{selectedColor}</strong> is currently out of stock. 
                  Please select a different size or color.
                </p>
              </div>
            )}

            {/* Quantity Selection */}
            {isInStock && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity (Available: {maxQuantity})
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isProductCompletelyOutOfStock || !isInStock || !selectedSize}
              className={`w-full py-4 px-6 rounded-md text-white font-semibold text-lg transition-colors flex items-center justify-center space-x-2 ${
                !isProductCompletelyOutOfStock && isInStock && selectedSize
                  ? 'bg-gray-900 hover:bg-gray-800'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0V9a1 1 0 011-1h6a1 1 0 011 1v4.1" />
              </svg>
              <span>
                {isProductCompletelyOutOfStock 
                  ? 'PRODUCT OUT OF STOCK' 
                  : !isInStock 
                  ? 'SELECTION OUT OF STOCK'
                  : !selectedSize 
                  ? 'SELECT SIZE' 
                  : 'ADD TO CART'
                }
              </span>
            </button>

            {/* Shipping Info */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-sm text-gray-600">Free shipping on orders over Rs.20,000</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <button className="text-sm text-gray-600 underline hover:text-gray-900">
                  Free Exchange & Returns
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{product?.name || 'Product'}</h2>
                <button
                  onClick={() => setShowSizeChart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Size & Fit:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Male Model is 5'10, wearing size L and Female Model is 5'6, wearing size S</li>
                  <li>Stay True to standard size. Pick your standard size. Meaning if you usually Wear Size medium pick the same here. and Like wise</li>
                  <li>Intended to be Relaxed Fit. Stick to your standard size. Go one size up if you want it to be Slightly more oversized.</li>
                  <li>Follow the Below Size Guide.</li>
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">SIZE CHART</h2>
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-sm">
                    SIZE IN INCHES
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold">SIZE</th>
                        <th className="text-left py-3 px-4 font-semibold">LENGTH</th>
                        <th className="text-left py-3 px-4 font-semibold">WIDTH</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">S</td>
                        <td className="py-3 px-4">27</td>
                        <td className="py-3 px-4">21</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">M</td>
                        <td className="py-3 px-4">28</td>
                        <td className="py-3 px-4">22 1/4</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">L</td>
                        <td className="py-3 px-4">29</td>
                        <td className="py-3 px-4">23 1/4</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">XL</td>
                        <td className="py-3 px-4">30</td>
                        <td className="py-3 px-4">24 1/2</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">XXL</td>
                        <td className="py-3 px-4">31</td>
                        <td className="py-3 px-4">25 3/4</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}