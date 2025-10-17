import { useState } from "react";
import { cartApi, productApi } from "../../lib/api";

export default function AdminCart() {
  const [userId, setUserId] = useState<number | null>(null);
  const [cart, setCart] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCartByUserId(userId);
      const enriched = await Promise.all(
        (data.items || []).map(async (it: any) => {
          try {
            const prod = await productApi.getProductById(it.productId);
            return { ...it, productName: prod.name, price: prod.productPrice, quantity: it.quantity ?? it.cartItemsQuantity };
          } catch {
            return { ...it, productName: `Product #${it.productId}`, price: undefined, quantity: it.quantity ?? it.cartItemsQuantity };
          }
        })
      );
      setCart({ ...data, items: enriched });
    } catch (err: any) {
      setError(err.message || String(err));
      setCart(null);
    }
    setLoading(false);
  };

  const handleRemove = async (productId: number) => {
    if (!userId) return;
    setLoading(true);
    try {
      await cartApi.removeItemFromCart(userId, productId);
      await fetchCart();
    } catch (err: any) {
      setError(err.message || String(err));
    }
    setLoading(false);
  };

  const handleUpdate = async (cartItemId: number, quantity: number) => {
    setLoading(true);
    try {
      await cartApi.updateCartItemQuantity(cartItemId, quantity);
      await fetchCart();
    } catch (err: any) {
      setError(err.message || String(err));
    }
    setLoading(false);
  };

  const handleClear = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await cartApi.clearCart(userId);
      setCart(null);
    } catch (err: any) {
      setError(err.message || String(err));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold">Admin Cart Management</h1>
      <div className="mt-4">
        <label className="mr-2">User ID:</label>
        <input
          type="number"
          onChange={(e) => setUserId(Number(e.target.value) || null)}
          className="border rounded px-2 py-1 mr-2"
        />
        <button onClick={fetchCart} className="px-3 py-1 bg-blue-600 text-white rounded">Fetch Cart</button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {cart && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold">Cart #{cart.cartId} for User #{cart.userId}</h2>
          {cart.items && cart.items.length === 0 && <p className="mt-2">Cart is empty</p>}
          {cart.items && cart.items.length > 0 && (
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-left">Quantity</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item: any) => (
                  <tr key={item.cartItemId} className="border-b">
                    <td className="py-2">Product #{item.productId} {item.productName ? `- ${item.productName}` : ''}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        onBlur={(e) => handleUpdate(item.cartItemId, Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      <button onClick={() => handleRemove(item.productId)} className="text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4">
            <button onClick={handleClear} className="px-3 py-1 bg-gray-900 text-white rounded">Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
