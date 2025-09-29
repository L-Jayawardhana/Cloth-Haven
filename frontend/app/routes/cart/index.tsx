import { useRef, useEffect, useState, useCallback } from 'react';
import { cartApi, type Cart, type CartItem } from '../../lib/api';

// Interface for Product information
interface Product {
  productId: number;
  name: string;
  productPrice: number;
  description?: string;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Empty cart component
const EmptyCart = ({ onAddSample, isLoading }: { onAddSample: () => void; isLoading: boolean }) => (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h12" />
      </svg>
    </div>
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
    <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
    <button
      onClick={onAddSample}
      disabled={isLoading}
      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg 
                 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Sample Item
        </>
      )}
    </button>
  </div>
);

export default function CartPage() {
  
  // State management - no React Query to avoid loops
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Component lifecycle tracking
  const mountedRef = useRef(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.userid || user.id;
      }
    } catch (error) {
      console.error('[Cart] Error getting user ID:', error);
    }
    return null;
  };

  // Single fetch function that only runs once
  const fetchCart = useCallback(async () => {
    // Prevent multiple calls
    if (fetchedRef.current || operationInProgress || !mountedRef.current) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setIsLoading(false);
      setError('Please log in to view your cart');
      return;
    }

    fetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cartApi.getCartByUserId(userId);
      
      if (mountedRef.current) {
        setCart(result);
      }
    } catch (err) {
      console.error('[Cart] Fetch error:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load cart');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [operationInProgress]);

  // Run fetch only once on mount
  useEffect(() => {
    fetchCart();
  }, []); // Empty dependency array - only run once

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    if (operationInProgress) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setError('Please log in to add items to cart');
      return;
    }

    setOperationInProgress(true);
    try {
      await cartApi.addItemToCart(userId, productId, quantity);
      
      // Manually refetch cart after successful add
      const updatedCart = await cartApi.getCartByUserId(userId);
      if (mountedRef.current) {
        setCart(updatedCart);
        setSuccessMessage('Item added to cart successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to add item');
      }
    } finally {
      if (mountedRef.current) {
        setOperationInProgress(false);
      }
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    if (operationInProgress) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setError('Please log in to remove items from cart');
      return;
    }

    setOperationInProgress(true);
    try {
      await cartApi.removeItemFromCart(userId, productId);
      
      // Manually refetch cart after successful removal
      const updatedCart = await cartApi.getCartByUserId(userId);
      if (mountedRef.current) {
        setCart(updatedCart);
        setSuccessMessage('Item removed from cart!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to remove item');
      }
    } finally {
      if (mountedRef.current) {
        setOperationInProgress(false);
      }
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    if (operationInProgress || quantity < 1) {
      return;
    }

    // Update UI immediately for better UX
    if (cart) {
      const optimisticCart = {
        ...cart,
        items: cart.items.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity }
            : item
        )
      };
      setCart(optimisticCart);
    }

    setOperationInProgress(true);
    try {
      await cartApi.updateCartItemQuantity(cartItemId, quantity);
      
      // Fetch fresh cart data after successful update (with bypass throttling for user actions)
      const userId = getCurrentUserId();
      if (!userId) {
        setError('User session expired');
        return;
      }
      
      // Use reduced throttling for cart refresh after quantity update
      setTimeout(async () => {
        try {
          const updatedCart = await cartApi.getCartByUserId(userId, true);
          if (mountedRef.current) {
            setCart(updatedCart);
            setSuccessMessage('Quantity updated!');
            setTimeout(() => setSuccessMessage(null), 2000);
          }
        } catch (fetchError) {
          // If fetch fails, keep the optimistic update (silent fail)
        }
      }, 800);
    } catch (error) {
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to update quantity');
      }
    } finally {
      if (mountedRef.current) {
        setOperationInProgress(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-8">
            <LoadingSpinner />
            <p className="text-center text-gray-600 mt-4">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchedRef.current = false;
                fetchCart();
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg 
                         hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const totalItems = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum: number, item: CartItem) => sum + (item.productPrice || 0) * item.quantity, 0);
  const subtotal = totalPrice;
  const shipping = cartItems.length > 0 ? 9.99 : 0;
  const tax = totalPrice * 0.08; // 8% tax
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart onAddSample={() => handleAddToCart(1, 1)} isLoading={operationInProgress} />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16 space-y-8 lg:space-y-0">
            {/* Cart Items */}
            <section className="lg:col-span-7">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item: CartItem, index: number) => (
                    <li key={item.cartItemId} className="cart-item p-6 flex hover:bg-gray-50 transition-colors duration-200">
                      {/* Product Image Placeholder */}
                      <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>

                      {/* Product Details */}
                      <div className="ml-4 sm:ml-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.productName || `Product ${item.productId}`}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">SKU: #{item.productId}</p>
                              <p className="mt-1 text-lg font-medium text-gray-900">
                                ${item.productPrice?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId)}
                              disabled={operationInProgress}
                              className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="mt-4 flex items-center flex-wrap gap-4">
                            <label htmlFor={`quantity-${index}`} className="sr-only">
                              Quantity for {item.productName}
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-md bg-white shadow-sm">
                              <button
                                onClick={() => handleUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                                disabled={operationInProgress || item.quantity <= 1}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Decrease quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-4 py-2 text-center text-gray-900 font-medium min-w-[3rem]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                disabled={operationInProgress}
                                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Increase quantity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <div className="ml-6 text-lg font-medium text-gray-900">
                              ${((item.productPrice || 0) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Order Summary */}
            <section className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="bg-white shadow-md rounded-lg sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <button
                      disabled={operationInProgress || cartItems.length === 0}
                      onClick={() => {
                        // Navigate to checkout page - placeholder for now
                        alert('Checkout functionality coming soon!');
                      }}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md 
                               shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                    >
                      {operationInProgress ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Proceed to Checkout
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Navigate to products page - placeholder for now
                        window.location.href = '/products';
                      }}
                      className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md 
                               shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                               transition-all duration-200 transform hover:scale-105">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Continue Shopping
                    </button>
                  </div>
                  
                  {/* Security badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure Checkout
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        100% Guarantee
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Processing Overlay */}
        {operationInProgress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-gray-900 font-medium">Updating cart...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}