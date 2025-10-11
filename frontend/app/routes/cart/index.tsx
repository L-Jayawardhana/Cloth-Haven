
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { type Product, type ProductImage, imageApi } from "../../lib/api";
import { unifiedCartService, type Cart } from "../../lib/unifiedCart";

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [productImages, setProductImages] = useState<Record<number, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");
      console.log('Loading cart...');
      
      const cartData = await unifiedCartService.getCart();
      console.log('Cart data received:', cartData);
      
      setCart(cartData);
      
      if (cartData && cartData.items.length > 0) {
        setLoadingImages(true);
        
        // Load product details and images for each item in cart
        const productPromises = cartData.items.map(async (item) => {
          try {
            console.log(`Loading product ${item.productId}...`);
            const response = await fetch(`http://localhost:8080/api/v1/products/${item.productId}`);
            if (!response.ok) {
              console.error(`Product API error for ${item.productId}: ${response.status}`);
              return null;
            }
            const product = await response.json();
            console.log(`Product ${item.productId} loaded:`, product);
            return product;
          } catch (error) {
            console.error(`Error loading product ${item.productId}:`, error);
            return null;
          }
        });

        const imagePromises = cartData.items.map(async (item) => {
          try {
            console.log(`Loading images for product ${item.productId}...`);
            const images = await imageApi.getImagesByProductId(item.productId);
            console.log(`Images for product ${item.productId}:`, images);
            return { productId: item.productId, images };
          } catch (error) {
            console.error(`Error loading images for product ${item.productId}:`, error);
            return { productId: item.productId, images: [] };
          }
        });
        
        const [productResults, imageResults] = await Promise.all([
          Promise.all(productPromises),
          Promise.all(imagePromises)
        ]);
        
        const productMap: Record<number, Product> = {};
        const imageMap: Record<number, ProductImage[]> = {};
        
        productResults.forEach((product, index) => {
          if (product) {
            productMap[cartData.items[index].productId] = product;
          }
        });

        imageResults.forEach(({ productId, images }) => {
          imageMap[productId] = images;
        });
        
        setProducts(productMap);
        setProductImages(imageMap);
        setLoadingImages(false);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setLoadingImages(false);
    }
  };

  const handleRemove = async (item: any) => {
    if (loading) return;
    
    try {
      // Check if user is authenticated to determine which identifier to use
      const user = (() => {
        try {
          const raw = localStorage.getItem("user");
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      if (user && user.token) {
        // For authenticated users, use cartItemId for removal
        await unifiedCartService.removeItemByCartItemId(item.cartItemId);
      } else {
        // For unauthenticated users, need to match by productId, size, and color
        await unifiedCartService.removeItemLocal(item.productId, item.size, item.color);
      }
      
      await loadCart(); // Reload cart after removal
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateQuantity = async (item: any, newQuantity: number) => {
    if (loading || newQuantity < 1) return;
    
    try {
      // Check if user is authenticated to determine which identifier to use
      const user = (() => {
        try {
          const raw = localStorage.getItem("user");
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      if (user && user.token) {
        // For authenticated users, use cartItemId
        await unifiedCartService.updateQuantity(item.cartItemId, newQuantity);
      } else {
        // For unauthenticated users, use productId with size and color
        await unifiedCartService.updateQuantityLocal(item.productId, newQuantity, item.size, item.color);
      }
      
      await loadCart(); // Reload cart after update
    } catch (err: any) {
      setError(err.message);
    }
  };

  const calculateSubtotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.productId];
      return total + (product?.productPrice || 0) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.15; // 15% discount
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleCheckout = () => {
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions before proceeding.");
      return;
    }
    // Navigate to checkout or handle checkout logic
    console.log("Proceeding to checkout...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-block px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your cart</h1>
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0V9a1 1 0 011-1h6a1 1 0 011 1v4.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link 
              to="/products" 
              className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-6">PRODUCT</div>
                  <div className="col-span-3 text-center">QUANTITY</div>
                  <div className="col-span-3 text-right">TOTAL</div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-200">
                {cart.items.map((item, index) => {
                  const product = products[item.productId];
                  const images = productImages[item.productId] || [];
                  const primaryImage = images.length > 0 ? images[0].imageUrl : null;
                  const itemTotal = (product?.productPrice || 0) * item.quantity;
                  const originalPrice = itemTotal / 0.85; // Reverse calculate original price

                  return (
                    <div key={`${item.cartItemId || item.productId}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`} className="p-6">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-6">
                          <div className="flex items-start space-x-4">
                            {/* Product Image */}
                            <Link 
                              to={`/products/${item.productId}`}
                              className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-75 transition-opacity relative group"
                            >
                              {loadingImages ? (
                                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : primaryImage ? (
                                <>
                                  <img
                                    src={primaryImage}
                                    alt={product?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = `https://placehold.co/200x240/000000/ffffff?text=${encodeURIComponent(product?.name || 'Product')}`;
                                    }}
                                  />
                                  {images.length > 1 && (
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                      +{images.length - 1}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <div className="text-center">
                                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-gray-500">No Image</span>
                                  </div>
                                </div>
                              )}
                            </Link>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/products/${item.productId}`}
                                className="block hover:text-gray-700"
                              >
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:underline">
                                  {product?.name || `Product #${item.productId}`}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-600 mb-2">
                                {(item.color || item.size) ? (
                                  `${item.color ? `COLOR: ${item.color.toUpperCase()}` : ''}${item.color && item.size ? ' • ' : ''}${item.size ? `SIZE: ${item.size.toUpperCase()}` : ''}`
                                ) : (
                                  <span className="text-gray-400">Standard Item</span>
                                )}
                              </p>
                              {/* Sale Badge */}
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                  Sale 15% OFF
                                </span>
                                <span className="text-sm text-gray-500">
                                  (-Rs {(originalPrice - itemTotal).toFixed(2)})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="col-span-3">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleRemove(item)}
                              className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="col-span-3 text-right">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-500 line-through">
                              Rs {originalPrice.toFixed(2)}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              Rs {itemTotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link 
                to="/products" 
                className="inline-flex items-center text-black hover:text-gray-700 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Add Notes */}
              <div className="mb-6">
                <button className="flex items-center justify-between w-full text-left">
                  <span className="font-medium text-gray-900">Add notes</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for your order..."
                  className="mt-3 w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
                  rows={3}
                />
              </div>

              {/* Terms Agreement */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I agree with the{" "}
                    <Link to="/terms" className="text-black hover:underline font-medium">
                      terms and conditions
                    </Link>
                  </span>
                </label>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!agreeToTerms}
                className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
              >
                CHECKOUT • RS {calculateTotal().toFixed(2)}
              </button>

              {/* Google Pay */}
              <button className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors mb-6">
                <span>G</span>
                <span>Pay</span>
              </button>

              {/* Shipping Info */}
              <div className="text-sm text-gray-600 text-center">
                Taxes and{" "}
                <Link to="/shipping" className="text-black hover:underline">
                  shipping
                </Link>{" "}
                calculated at checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
