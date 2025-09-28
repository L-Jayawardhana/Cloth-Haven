
import { useEffect, useState } from "react";
import { cartApi } from "../../lib/api";
import type { Cart } from "../../lib/api";

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
    cartApi
      .getCartByUserId(user.userid)
      .then((data) => {
        setCart(data);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        {loading && <p className="mt-4 text-gray-600">Loading...</p>}
        {!loading && error && <p className="mt-4 text-red-500">{error}</p>}
        {!loading && !error && cart && cart.items.length === 0 && (
          <p className="mt-4 text-gray-600">Your cart is empty.</p>
        )}
        {!loading && !error && cart && cart.items.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-left">Quantity</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.cartItemId} className="border-b">
                    <td className="py-2">
                      {/* Optionally show product name/image if available */}
                      <span className="font-medium">Product #{item.productId}</span>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdate(item.cartItemId, Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-red-500 hover:underline mr-2"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleClear}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
