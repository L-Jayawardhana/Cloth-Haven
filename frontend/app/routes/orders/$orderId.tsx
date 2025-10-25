import { useEffect, useState } from 'react';
import { orderApi, imageApi, type OrderResponse } from '../../lib/api';

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSlipModal, setShowSlipModal] = useState(false);

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
                  {(it.color || it.size) && (
                    <div className="text-xs text-gray-600 mt-1">
                      {it.color && <span>Color: {it.color}</span>}
                      {it.color && it.size && <span className="mx-1">•</span>}
                      {it.size && <span>Size: {it.size}</span>}
                    </div>
                  )}
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
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-2">Payment Slip:</div>
                  <div className="flex items-start gap-3">
                    {/* Thumbnail Preview */}
                    <div className="flex-shrink-0">
                      {order.paymentSlipUrl.toLowerCase().endsWith('.pdf') ? (
                        <div 
                          className="w-20 h-20 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-red-600 cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => setShowSlipModal(true)}
                        >
                          <svg className="w-8 h-8 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[10px] font-medium">PDF</span>
                        </div>
                      ) : (
                        <img 
                          src={order.paymentSlipUrl} 
                          alt="Payment Slip" 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setShowSlipModal(true)}
                        />
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Uploaded</span>
                      </div>
                      <button 
                        onClick={() => setShowSlipModal(true)}
                        className="text-xs rounded-md border border-blue-300 px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-medium text-left"
                      >
                        View Full Size
                      </button>
                      <a 
                        className="text-xs rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 text-center" 
                        href={order.paymentSlipUrl} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Slip Modal */}
      {showSlipModal && order.paymentSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowSlipModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Payment Slip</h3>
              <div className="flex items-center gap-3">
                <a href={order.paymentSlipUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                  Open in new tab
                </a>
                <button onClick={() => setShowSlipModal(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
            <div className="p-4">
              {order.paymentSlipUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={order.paymentSlipUrl} className="w-full h-[70vh]" title="Payment Slip PDF" />
              ) : (
                <img src={order.paymentSlipUrl} alt="Payment Slip" className="max-h-[75vh] w-auto mx-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
