import { useEffect, useState } from 'react';
import { orderApi, imageApi, type OrderResponse } from '../../lib/api';

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length - 1];
    const orderId = Number(id);
    if (!orderId) {
      setError('Invalid order id');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const o = await orderApi.getOrderById(orderId);
        // Enrich each item with its first image
        const items = await Promise.all((o.items || []).map(async it => {
          try {
            const imgs = await imageApi.getImagesByProductId(it.productId);
            return { ...it, _image: imgs?.[0]?.imageUrl } as any;
          } catch { return it as any; }
        }));
        setOrder({ ...o, items } as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
          <p className="text-gray-600">Placed on {new Date(order.orderDate).toLocaleString()}</p>
        </div>
        <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs">{order.status.replaceAll('_',' ')}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 md:col-span-2">
          <h2 className="font-medium">Items</h2>
          <div className="mt-3 divide-y">
            {order.items?.map((it: any) => (
              <div key={it.orderItemId} className="py-3 flex items-center justify-between gap-3">
                <div className="w-14 h-14 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={it._image ?? 'https://placehold.co/112?text=No+Image'} alt={String(it.productId)} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Product #{it.productId}</div>
                  <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                </div>
                <div>Rs. {it.price?.toFixed?.(2) ?? it.price}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right font-semibold">Total: Rs. {order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-medium">Shipping</h2>
            <div className="mt-2 text-sm text-gray-700">
              <div>{order.firstName} {order.lastName}</div>
              <div>{order.homeAddress}</div>
              <div>{order.country} {order.postalCode}</div>
              <div className="text-gray-500">{order.phoneNumber}</div>
              <div className="text-gray-500">{order.emailAddress}</div>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h2 className="font-medium">Payment</h2>
            <div className="mt-2 text-sm text-gray-700">
              <div>Method: {order.paymentMethod?.replaceAll('_',' ')}</div>
              {order.paymentSlipUrl && (
                <div className="mt-1 text-xs">
                  Slip: <a className="text-blue-600 underline" href={order.paymentSlipUrl} target="_blank" rel="noreferrer">View</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
