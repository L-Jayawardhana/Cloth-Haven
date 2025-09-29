
import { useEffect, useState } from "react";
import { cartApi } from "../../lib/api";
import type { Cart } from "../../lib/api";

interface Product {
  productId: number;
  name: string;
  description: string;
  productPrice: number;
  category: any;
  subCategory: any;
  imageUrl?: string;
}

export default function Cart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      cartApi.getCartByUserId(user.userid),
      fetch("http://localhost:8080/api/v1/products/get-products").then((res) => res.json()),
    ])
      .then(([cartData, products]: [Cart | null, Product[]]) => {
        if (cartData && Array.isArray(cartData.items)) {
          // Merge latest product price into cart items
          const productMap = new Map<number, Product>();
          products.forEach((p) => productMap.set(p.productId, p));
          cartData.items = cartData.items.map((item) => {
            const prod = productMap.get(item.productId);
            return prod
              ? { ...item, price: prod.productPrice, productName: prod.name, productImage: prod.imageUrl }
              : item;
          });
        }
        setCart(cartData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  const handleRemove = async (productId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await cartApi.removeItemFromCart(user.userid, productId);
      const data = await cartApi.getCartByUserId(user.userid);
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const getTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const handleUpdate = async (cartItemId: number, quantity: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await cartApi.updateCartItemQuantity(cartItemId, quantity);
      const data = await cartApi.getCartByUserId(user.userid);
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleClear = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await cartApi.clearCart(user.userid);
      setCart(cart ? { ...cart, items: [] } : null);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <p className="mt-4 text-gray-600">Please sign in to view your cart.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8">🛒 Your Shopping Cart</h1>
        {loading && <p className="mt-4 text-gray-600">Loading...</p>}
        {!loading && error && <p className="mt-4 text-red-500">{error}</p>}
        {!loading && !error && cart && cart.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/public/empty-cart.svg" alt="Empty cart" className="w-40 h-40 mb-4 opacity-70" onError={e => (e.currentTarget.style.display='none')} />
            <p className="text-lg text-gray-500">Your cart is empty.</p>
          </div>
        )}
        {!loading && !error && cart && cart.items.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-emerald-700">Items</h2>
              <ul className="divide-y divide-emerald-100">
                {cart.items.map((item) => (
                  <li key={item.cartItemId} className="flex items-center gap-4 py-4">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">{item.productName || `Product #${item.productId}`}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-gray-500 text-sm">Price:</span>
                        <span className="text-green-700 font-bold">
                          {item.price !== undefined ? item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '--'}
                        </span>
                        <span className="text-gray-500 text-sm">x {item.quantity}</span>
                        <span className="text-emerald-800 font-semibold ml-2">=
                          {item.price !== undefined ? (item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '--'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        You have <span className="font-semibold text-emerald-700">{item.quantity}</span> of this product in your cart.
                      </div>
                      <div className="text-emerald-700 text-xs font-semibold mt-1">
                        Total for this product: {item.price !== undefined ? (item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '--'}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdate(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200"
                        >-</button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdate(item.cartItemId, Math.max(1, Number(e.target.value)))}
                          className="w-12 text-center border border-emerald-200 rounded"
                        />
                        <button
                          onClick={() => handleUpdate(item.cartItemId, item.quantity + 1)}
                          className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200"
                        >+</button>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="ml-4 text-rose-600 hover:underline text-sm"
                        >Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            {/* Summary */}
            <div className="bg-emerald-50 rounded-xl shadow p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-emerald-700">Order Summary</h2>
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>Subtotal</span>
                  <span>{getTotal().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between mb-2 text-gray-500">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-emerald-800 mt-4">
                  <span>Total</span>
                  <span>{getTotal().toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.href = '/orders';
                }}
                className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-lg text-lg font-semibold hover:bg-emerald-700 shadow"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
