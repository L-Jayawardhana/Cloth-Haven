import { useEffect, useMemo, useState } from 'react';
import { orderApi, imageApi, productApi, type OrderResponse } from '../../lib/api';

export default function UserOrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slipUrl, setSlipUrl] = useState<string | null>(null);

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
        // Attach a preview image (first item's first image) for each order
        const withThumbs = await Promise.all(res.map(async (o) => {
          const firstItem = o.items?.[0];
          if (!firstItem) return o as any;
          try {
            const [imgs, prod] = await Promise.all([
              imageApi.getImagesByProductId(firstItem.productId),
              productApi.getProductById(firstItem.productId)
            ]);
            return { ...o, _thumb: imgs?.[0]?.imageUrl, _productName: prod?.name } as any;
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
              const firstItem = o.items?.[0];
              return (
                <li key={o.orderId} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <img src={(o as any)._thumb ?? 'https://placehold.co/96?text=No+Image'} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">Order #{o.orderId}</div>
                      {(o as any)._productName && (
                        <div className="text-sm text-gray-700 font-medium mt-0.5">
                          {(o as any)._productName}{itemsCount > 1 && ` +${itemsCount - 1} more`}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">{new Date(o.orderDate).toLocaleString()}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Items: {itemsCount}
                      </div>
                      {firstItem && (firstItem.color || firstItem.size) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {firstItem.color && <span>{firstItem.color}</span>}
                          {firstItem.color && firstItem.size && <span> • </span>}
                          {firstItem.size && <span>{firstItem.size}</span>}
                        </div>
                      )}
                      {/* Payment Slip Indicator */}
                      {o.paymentMethod === 'PAYMENT_SLIP' && o.paymentSlipUrl && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded overflow-hidden border border-blue-200 flex-shrink-0 cursor-pointer hover:opacity-80" onClick={() => setSlipUrl(o.paymentSlipUrl || null)}>
                            {o.paymentSlipUrl?.toLowerCase().endsWith('.pdf') ? (
                              <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <img src={o.paymentSlipUrl} alt="slip" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <button 
                            onClick={() => setSlipUrl(o.paymentSlipUrl || null)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Payment slip uploaded
                          </button>
                        </div>
                      )}
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

      {/* Payment Slip Modal */}
      {slipUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSlipUrl(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Payment Slip</h3>
              <div className="flex items-center gap-3">
                <a href={slipUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                  Open in new tab
                </a>
                <button onClick={() => setSlipUrl(null)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
            <div className="p-4">
              {slipUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={slipUrl} className="w-full h-[70vh]" title="Payment Slip PDF" />
              ) : (
                <img src={slipUrl} alt="Payment Slip" className="max-h-[75vh] w-auto mx-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
