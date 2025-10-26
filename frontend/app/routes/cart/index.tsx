
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { cartApi, productApi, imageApi } from "../../lib/api";
import { useCartStore } from "../../store/cartStore";
import type { Cart as CartType } from "../../lib/api";

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { fetchCartCount, setCount } = useCartStore();
  
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const resolvedUserId = user ? (user.userId ?? user.userid ?? user.id ?? null) : null;

  useEffect(() => {
    if (!user || !resolvedUserId) {
      setLoading(false);
      setInitialLoad(false);
      return;
    }
    
    // Don't refetch if we already have data
    if (!initialLoad) return;
    
    let errorTimer: NodeJS.Timeout;
    
    (async () => {
      setLoading(true);
      setError("");
      setShowError(false);
      
      try {
        const data = await cartApi.getCartByUserId(resolvedUserId);
        // Try to enrich items with product names and prices
        const enriched = await Promise.all(
          (data.items || []).map(async (it) => {
            try {
              const prod = await productApi.getProductById(it.productId);
              const imgs = await imageApi.getImagesByProductId(it.productId);
              return {
                ...it,
                productName: prod.name,
                price: prod.productPrice,
                productImage: imgs?.[0]?.imageUrl,
                quantity: it.quantity ?? it.cartItemsQuantity,
              };
            } catch {
              return {
                ...it,
                productName: `Product #${it.productId}`,
                price: undefined,
                productImage: undefined,
                quantity: it.quantity ?? it.cartItemsQuantity,
              };
            }
          })
        );
        setCart({ ...data, items: enriched });
        setError(""); // Clear any previous errors on success
        setShowError(false);
      } catch (err: any) {
        // Only show error if it's not a 404 (empty cart) or similar
        const errorMessage = err.message || String(err);
        if (!errorMessage.toLowerCase().includes('404') && 
            !errorMessage.toLowerCase().includes('not found')) {
          setError(errorMessage);
          // Delay showing error by 1 second to avoid flash
          errorTimer = setTimeout(() => {
            setShowError(true);
          }, 1000);
        } else {
          // Empty cart scenario - not an error
          setCart({ cartId: 0, userId: resolvedUserId, items: [] });
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    })();
    
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [user, resolvedUserId]);

  // Update cart count in store whenever cart changes
  useEffect(() => {
    if (cart && cart.items) {
      const totalItems = cart.items.reduce((sum, it) => 
        sum + (it.quantity ?? it.cartItemsQuantity ?? 0), 0
      );
      setCount(totalItems);
    }
  }, [cart, setCount]);

  // helper to enrich items (used after mutations)
  const enrichItems = async (items: any[]) => {
    const enriched = await Promise.all(
      (items || []).map(async (it) => {
        try {
          const prod = await productApi.getProductById(it.productId);
          const imgs = await imageApi.getImagesByProductId(it.productId);
          return {
            ...it,
            productName: prod.name,
            price: prod.productPrice,
            productImage: imgs?.[0]?.imageUrl,
            quantity: it.quantity ?? it.cartItemsQuantity,
          };
        } catch {
          return {
            ...it,
            productName: `Product #${it.productId}`,
            price: undefined,
            productImage: undefined,
            quantity: it.quantity ?? it.cartItemsQuantity,
          };
        }
      })
    );
    return enriched;
  };

  const currency = (n?: number) => (n == null ? '-' : `Rs. ${n.toFixed(2)}`);

  const calcSubtotal = (items: any[] | undefined) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((s, it) => s + ((it.price ?? 0) * (it.quantity ?? it.cartItemsQuantity ?? 0)), 0);
  };

  const shippingCost = (subtotal: number) => {
    // free shipping over 20000 as used elsewhere; otherwise flat Rs. 250
    if (subtotal >= 20000) return 0;
    return 250;
  };

  const handleRemove = async (cartItemId: number) => {
    if (!user) return;
    
    // Optimistic update - remove item from UI immediately
    const previousCart = cart;
    if (cart) {
      const updatedItems = cart.items.filter(item => item.cartItemId !== cartItemId);
      setCart({ ...cart, items: updatedItems });
      
      // Update cart count immediately
      const totalItems = updatedItems.reduce((sum, it) => 
        sum + (it.quantity ?? it.cartItemsQuantity ?? 0), 0
      );
      setCount(totalItems);
    }
    
    try {
      await cartApi.removeItemFromCart(cartItemId);
      // Fetch fresh data to confirm
      const data = await cartApi.getCartByUserId(resolvedUserId);
      const enriched = await enrichItems(data.items || []);
      setCart({ ...data, items: enriched });
      // Update cart count
      fetchCartCount(resolvedUserId);
      if (resolvedUserId) fetchCartCount(resolvedUserId);
    } catch (err: any) {
      // Rollback on error
      setCart(previousCart);
      setError(err.message);
      setShowError(true);
    }
  };

  const handleUpdate = async (cartItemId: number, quantity: number) => {
    if (!user || !resolvedUserId || quantity < 1) return;
    
    // Optimistic update - update quantity in UI immediately
    const previousCart = cart;
    if (cart) {
      const updatedItems = cart.items.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity, cartItemsQuantity: quantity }
          : item
      );
      setCart({ ...cart, items: updatedItems });
      
      // Update cart count immediately
      const totalItems = updatedItems.reduce((sum, it) => 
        sum + (it.quantity ?? it.cartItemsQuantity ?? 0), 0
      );
      setCount(totalItems);
    }
    
    try {
      await cartApi.updateCartItemQuantity(cartItemId, quantity);
      // Fetch fresh data to confirm
      const data = await cartApi.getCartByUserId(resolvedUserId);
      const enriched = await enrichItems(data.items || []);
      setCart({ ...data, items: enriched });
      // Update cart count
      fetchCartCount(resolvedUserId);
    } catch (err: any) {
      // Rollback on error
      setCart(previousCart);
      setError(err.message);
      setShowError(true);
    }
  };

  const handleClear = async () => {
    if (!user || !resolvedUserId) return;
    
    // Optimistic update
    const previousCart = cart;
    setCart({ cartId: cart?.cartId || 0, userId: resolvedUserId, items: [] });
    setCount(0);
    
    try {
      await cartApi.clearCart(resolvedUserId);
    } catch (err: any) {
      // Rollback on error
      setCart(previousCart);
      setError(err.message);
      setShowError(true);
    }
  };

  const handleCheckoutSingle = (item: any) => {
    // Store the selected item in session storage for checkout
    const checkoutItem = {
      cartItemId: item.cartItemId,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity ?? item.cartItemsQuantity,
      color: item.color,
      size: item.size,
      productImage: item.productImage,
      total: (item.price ?? 0) * (item.quantity ?? item.cartItemsQuantity ?? 0)
    };
    
    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    sessionStorage.setItem('checkoutType', 'single');
    window.location.href = '/checkout';
  };

  const handleCheckoutFull = () => {
    // Clear any previous single item checkout data
    sessionStorage.removeItem('checkoutItems');
    sessionStorage.removeItem('checkoutType');
    window.location.href = '/checkout';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your shopping cart and continue shopping.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Sign In
            </Link>
            <Link to="/products" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shopping Cart
            </h1>
            <p className="text-gray-600 mt-1">
              {cart && cart.items.length > 0 
                ? `${cart.items.length} item${cart.items.length !== 1 ? 's' : ''} in your cart`
                : 'Your cart is empty'
              }
            </p>
          </div>
          <Link 
            to="/products" 
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {showError && error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-8 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        )}

        {!loading && cart && cart.items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && cart && cart.items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button 
                    onClick={handleClear} 
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear Cart
                  </button>
                </div>
                
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                      {/* Product Image */}
                      <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                        <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-500 transition-colors">
                          <img
                            src={item.productImage ?? 'https://placehold.co/200x200?text=No+Image'}
                            alt={item.productName ?? `Product ${item.productId}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/products/${item.productId}`} 
                          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors block mb-1"
                        >
                          {item.productName ?? `Product #${item.productId}`}
                        </Link>
                        
                        <div className="text-base font-medium text-indigo-600 mb-2">
                          {currency(item.price)}
                        </div>
                        
                        {(item.color || item.size) && (
                          <div className="flex items-center gap-2 mb-3">
                            {item.color && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                Size {item.size}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => handleUpdate(item.cartItemId, Math.max(1, (item.quantity ?? item.cartItemsQuantity ?? 1) - 1))}
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity ?? item.cartItemsQuantity}
                              onChange={(e) => handleUpdate(item.cartItemId, Math.max(1, Number(e.target.value)))}
                              className="w-16 text-center border-l border-r border-gray-300 px-2 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              aria-label="Increase quantity"
                              onClick={() => handleUpdate(item.cartItemId, (item.quantity ?? item.cartItemsQuantity ?? 1) + 1)}
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleRemove(item.cartItemId)} 
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                        
                        {/* Individual Checkout Button */}
                        <button
                          onClick={() => handleCheckoutSingle(item)}
                          className="mt-3 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Checkout This Item
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {currency((item.price ?? 0) * (item.quantity ?? item.cartItemsQuantity ?? 0))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.quantity ?? item.cartItemsQuantity} × {currency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <aside className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span className="font-medium text-gray-900">{currency(calcSubtotal(cart.items))}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost(calcSubtotal(cart.items)) === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      currency(shippingCost(calcSubtotal(cart.items)))
                    )}
                  </span>
                </div>
                
                {calcSubtotal(cart.items) < 20000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-blue-700">
                        <p className="font-medium">Free shipping available!</p>
                        <p className="mt-1">Add {currency(20000 - calcSubtotal(cart.items))} more to get FREE shipping</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {currency(calcSubtotal(cart.items) + shippingCost(calcSubtotal(cart.items)))}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckoutFull}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <Link 
                  to="/products" 
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Easy returns within 30 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Fast & reliable shipping</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
