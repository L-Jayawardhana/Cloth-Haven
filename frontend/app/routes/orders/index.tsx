import { useEffect, useMemo, useState } from 'react';
import { orderApi, imageApi, type OrderResponse } from '../../lib/api';

export default function UserOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const normalized = { ...u, userId: u.userId ?? u.userid };
        setUser(normalized);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?.userId) return;
        const res = await orderApi.getUserOrders(user.userId);
        // Sort latest first
        res.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        // Attach a preview image (first item’s first image) for each order
        const withThumbs = await Promise.all(res.map(async (o) => {
          const firstItem = o.items?.[0];
          if (!firstItem) return o as any;
          try {
            const imgs = await imageApi.getImagesByProductId(firstItem.productId);
            return { ...o, _thumb: imgs?.[0]?.imageUrl } as any;
          } catch { return o as any; }
        }));
        setOrders(withThumbs as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.userId]);

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please sign in to view your orders</h2>
          <a href="/login" className="inline-flex mt-4 rounded-md bg-gray-900 px-4 py-2 text-white text-sm hover:bg-gray-800">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-gray-600">View your past orders and track status.</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border bg-white">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">You have no orders yet.</div>
        ) : (
          <ul className="divide-y">
            {orders.map(o => {
              const itemsCount = o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
              return (
                <li key={o.orderId} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <img src={(o as any)._thumb ?? 'https://placehold.co/96?text=No+Image'} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                    <div>
                    <div className="font-medium">Order #{o.orderId}</div>
                    <div className="text-xs text-gray-500">{new Date(o.orderDate).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 mt-1">Items: {itemsCount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                      {o.status.replaceAll('_',' ')}
                    </span>
                    <span className="text-sm font-medium">Rs. {o.totalPrice?.toFixed?.(2) ?? o.totalPrice}</span>
                    <a href={`/orders/${o.orderId}`} className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50">Details</a>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
