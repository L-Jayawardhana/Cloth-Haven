
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { cartApi, productApi, imageApi } from "../../lib/api";
import type { Cart as CartType } from "../../lib/api";

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null);
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
  const resolvedUserId = user ? (user.userId ?? user.userid ?? user.id ?? null) : null;

  useEffect(() => {
    if (!user || !resolvedUserId) return;
    (async () => {
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
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

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

  const handleRemove = async (productId: number) => {
    if (!user) return;
    setLoading(true);
    try {
  await cartApi.removeItemFromCart(resolvedUserId, productId);
  const data = await cartApi.getCartByUserId(resolvedUserId);
  const enriched = await enrichItems(data.items || []);
  setCart({ ...data, items: enriched });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (cartItemId: number, quantity: number) => {
  if (!user || !resolvedUserId) return;
    setLoading(true);
    try {
  await cartApi.updateCartItemQuantity(cartItemId, quantity);
  const data = await cartApi.getCartByUserId(resolvedUserId);
  const enriched = await enrichItems(data.items || []);
  setCart({ ...data, items: enriched });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleClear = async () => {
  if (!user || !resolvedUserId) return;
    setLoading(true);
    try {
  await cartApi.clearCart(resolvedUserId);
      setCart(null);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        {loading && <p className="mt-4 text-gray-600">Loading...</p>}
        {!loading && error && <p className="mt-4 text-red-500">{error}</p>}
        {!loading && !error && cart && cart.items.length === 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Shop products</Link>
          </div>
        )}

        {!loading && !error && cart && cart.items.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <ul className="divide-y">
                {cart.items.map((item) => (
                  <li key={item.cartItemId} className="py-4 flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage ?? 'https://placehold.co/200x200?text=No+Image'}
                        alt={item.productName ?? `Product ${item.productId}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:underline">{item.productName ?? `Product #${item.productId}`}</Link>
                      <div className="text-sm text-gray-500 mt-1">{currency(item.price)}</div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center border rounded">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => handleUpdate(item.cartItemId, Math.max(1, (item.quantity ?? item.cartItemsQuantity ?? 1) - 1))}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                          >−</button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity ?? item.cartItemsQuantity}
                            onChange={(e) => handleUpdate(item.cartItemId, Number(e.target.value))}
                            className="w-16 text-center border-l border-r px-2 py-1"
                          />
                          <button
                            aria-label="Increase quantity"
                            onClick={() => handleUpdate(item.cartItemId, (item.quantity ?? item.cartItemsQuantity ?? 1) + 1)}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                          >+</button>
                        </div>
                        <button onClick={() => handleRemove(item.productId)} className="text-red-500 hover:underline">Remove</button>
                        <div className="ml-auto font-semibold">{currency((item.price ?? 0) * (item.quantity ?? item.cartItemsQuantity ?? 0))}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button onClick={handleClear} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Clear Cart</button>
              </div>
            </div>

            {/* Summary */}
            <aside className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{currency(calcSubtotal(cart.items))}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{currency(shippingCost(calcSubtotal(cart.items)))}</span>
                </div>
                <div className="flex justify-between text-base font-semibold mt-2">
                  <span>Total</span>
                  <span>{currency(calcSubtotal(cart.items) + shippingCost(calcSubtotal(cart.items)))}</span>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/checkout" className="w-full block text-center px-4 py-3 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600">Proceed to Checkout</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
