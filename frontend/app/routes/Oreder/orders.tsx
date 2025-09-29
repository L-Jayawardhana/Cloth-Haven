import { useEffect, useState } from "react";

interface OrderResponseDTO {
  orderId: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
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
    fetch(`http://localhost:8080/api/v1/orders/user/${user.userid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-4 text-gray-600">Please sign in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8">My Orders</h1>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-500">You have no orders yet.</p>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div>
                    <div className="font-semibold text-lg text-gray-800">Order #{order.orderId}</div>
                    <div className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Product</th>
                        <th className="py-2 text-left">Quantity</th>
                        <th className="py-2 text-left">Price</th>
                        <th className="py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.productId} className="border-b">
                          <td className="py-2">{item.productName}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">{item.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                          <td className="py-2">{(item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <span className="font-bold text-lg text-emerald-800">
                    Order Total: {order.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
