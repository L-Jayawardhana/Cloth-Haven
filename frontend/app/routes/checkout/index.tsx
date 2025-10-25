import { useEffect, useMemo, useState } from 'react';
import { cartApi, orderApi, imageApi, productApi, type Cart, type PaymentMethod, type CreateOrderPayload } from '../../lib/api';

export default function Checkout() {
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [checkoutType, setCheckoutType] = useState<'single' | 'full'>('full');

  // Shipping form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    country: 'Sri Lanka',
    postalCode: '',
    phoneNumber: '',
    homeAddress: '',
    emailAddress: '',
    paymentMethod: 'CASH_ON_DELIVERY' as PaymentMethod,
  });
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentInputType, setPaymentInputType] = useState<'file' | 'url'>('file');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        // Normalize id shape from backend (login returns `userid`)
        const normalized = { ...u, userId: u.userId ?? u.userid };
        setUser(normalized);
        // Pre-fill from profile info if available
        setForm(f => ({
          ...f,
          firstName: normalized.username?.split(' ')[0] || f.firstName,
          lastName: normalized.username?.split(' ').slice(1).join(' ') || f.lastName,
          phoneNumber: normalized.phoneNo || f.phoneNumber,
          homeAddress: normalized.address || f.homeAddress,
          emailAddress: normalized.email || f.emailAddress,
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user?.userId) return; // finally will still run
        
        // Check if this is a single item checkout
        const storedCheckoutType = sessionStorage.getItem('checkoutType');
        const storedCheckoutItems = sessionStorage.getItem('checkoutItems');
        
        if (storedCheckoutType === 'single' && storedCheckoutItems) {
          // Single item checkout from cart
          setCheckoutType('single');
          const items = JSON.parse(storedCheckoutItems);
          setCart({
            cartId: 0,
            userId: user.userId,
            items: items
          });
        } else {
          // Regular full cart checkout
          setCheckoutType('full');
          const data = await cartApi.getCartByUserId(user.userId);
          // Enrich items with image and price for better summary
          const items = await Promise.all((data.items || []).map(async (it) => {
            try {
              const [imgs, prod] = await Promise.all([
                imageApi.getImagesByProductId(it.productId),
                productApi.getProductById(it.productId)
              ]);
              return {
                ...it,
                productImage: imgs?.[0]?.imageUrl,
                price: prod?.productPrice,
              };
            } catch {
              return it;
            }
          }));
          setCart({ ...data, items });
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.userId]);

  const totals = useMemo(() => {
    // We may not have unit price in cart items; totals will be finalized by backend.
    const itemsCount = cart?.items?.reduce((sum, it) => sum + (it.quantity ?? it.cartItemsQuantity ?? 0), 0) || 0;
    return { itemsCount };
  }, [cart]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!user?.userId) return 'Please log in to continue.';
    if (!form.firstName?.trim()) return 'First name is required';
    if (!form.lastName?.trim()) return 'Last name is required';
    if (!form.country?.trim()) return 'Country is required';
    if (!form.postalCode?.trim()) return 'Postal code is required';
    if (!form.phoneNumber?.trim()) return 'Phone number is required';
    if (!form.homeAddress?.trim()) return 'Home address is required';
    if (!form.emailAddress?.trim()) return 'Email address is required';
    // If user chooses PAYMENT_SLIP, require a file upload OR URL
    if (form.paymentMethod === 'PAYMENT_SLIP') {
      if (paymentInputType === 'file' && !paymentFile) {
        return 'Please upload a payment slip (PDF/PNG/JPG) or switch to URL input.';
      }
      if (paymentInputType === 'url' && !paymentUrl?.trim()) {
        return 'Please enter a payment slip URL or switch to file upload.';
      }
      if (paymentInputType === 'url' && paymentUrl?.trim()) {
        // Basic URL validation
        try {
          new URL(paymentUrl);
        } catch {
          return 'Please enter a valid URL (e.g., https://example.com/slip.jpg)';
        }
      }
    }
    return null;
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    const err = validate();
    if (err) {
      setSubmitting(false);
      setError(err);
      return;
    }

    try {
      // For single item checkout, we need to handle differently
      if (checkoutType === 'single' && cart?.items && cart.items.length > 0) {
        const singleItem = cart.items[0];
        
        // First, we need to ensure the cart only has this item
        // Save current cart, clear it, add only this item, create order, then restore
        const originalCartData = await cartApi.getCartByUserId(user.userId);
        
        try {
          // Clear the cart
          await cartApi.clearCart(user.userId);
          
          // Add only the single item
          await cartApi.addItemToCart({
            userId: user.userId,
            productId: singleItem.productId,
            quantity: singleItem.quantity ?? singleItem.cartItemsQuantity ?? 1,
            color: singleItem.color,
            size: singleItem.size
          });
          
          // Now create the order (backend will use this single-item cart)
          const payload: CreateOrderPayload = {
            userId: user.userId,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
            phoneNumber: form.phoneNumber.trim(),
            homeAddress: form.homeAddress.trim(),
            emailAddress: form.emailAddress.trim(),
            paymentMethod: form.paymentMethod,
          };
          const order = await orderApi.createOrder(payload);
          
          // Upload payment slip if needed
          if (form.paymentMethod === 'PAYMENT_SLIP') {
            try {
              if (paymentInputType === 'file' && paymentFile) {
                await orderApi.uploadPaymentSlip(order.orderId, paymentFile);
              } else if (paymentInputType === 'url' && paymentUrl.trim()) {
                await orderApi.submitPaymentSlipUrl(order.orderId, paymentUrl.trim());
              }
            } catch (e: any) {
              console.error('Payment slip submission failed', e);
            }
          }
          
          // Restore other cart items (excluding the one we just ordered)
          for (const item of originalCartData.items || []) {
            if (item.cartItemId !== singleItem.cartItemId) {
              await cartApi.addItemToCart({
                userId: user.userId,
                productId: item.productId,
                quantity: item.quantity ?? item.cartItemsQuantity ?? 1,
                color: item.color,
                size: item.size
              });
            }
          }
          
          // Clear session storage
          sessionStorage.removeItem('checkoutItems');
          sessionStorage.removeItem('checkoutType');
          
          setSuccessMsg(`Order #${order.orderId} placed successfully!`);
          setTimeout(() => {
            window.location.href = `/profile`;
          }, 1000);
        } catch (orderErr) {
          // If order creation fails, restore the original cart
          await cartApi.clearCart(user.userId);
          for (const item of originalCartData.items || []) {
            await cartApi.addItemToCart({
              userId: user.userId,
              productId: item.productId,
              quantity: item.quantity ?? item.cartItemsQuantity ?? 1,
              color: item.color,
              size: item.size
            });
          }
          throw orderErr;
        }
      } else {
        // Full cart checkout
        const payload: CreateOrderPayload = {
          userId: user.userId,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          country: form.country.trim(),
          postalCode: form.postalCode.trim(),
          phoneNumber: form.phoneNumber.trim(),
          homeAddress: form.homeAddress.trim(),
          emailAddress: form.emailAddress.trim(),
          paymentMethod: form.paymentMethod,
        };
        const order = await orderApi.createOrder(payload);
        
        // If a payment slip file was provided, upload it against the created order
        if (form.paymentMethod === 'PAYMENT_SLIP') {
          try {
            if (paymentInputType === 'file' && paymentFile) {
              await orderApi.uploadPaymentSlip(order.orderId, paymentFile);
            } else if (paymentInputType === 'url' && paymentUrl.trim()) {
              await orderApi.submitPaymentSlipUrl(order.orderId, paymentUrl.trim());
            }
          } catch (e: any) {
            console.error('Payment slip submission failed', e);
            // keep going; order has been created
          }
        }
        
        setSuccessMsg(`Order #${order.orderId} placed successfully!`);
        // After successful order, consider redirecting or clearing UI
        // Backend clears the cart; we can clear local cart state too
        setCart({ ...(cart as Cart), items: [] });
        // Optional redirect
        setTimeout(() => {
          window.location.href = `/profile`; // Or a dedicated order confirmation page
        }, 1000);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please sign in to continue</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to checkout.</p>
          <a href="/login" className="inline-flex mt-4 rounded-md bg-gray-900 px-4 py-2 text-white text-sm hover:bg-gray-800">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold">
          Checkout {checkoutType === 'single' && <span className="text-indigo-600">(Single Item)</span>}
        </h1>
        <p className="mt-1 text-gray-600">
          {checkoutType === 'single' 
            ? 'Complete your order for the selected item.'
            : 'Complete your order by providing shipping and payment details.'
          }
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 rounded-xl border bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-700">First name</label>
                <input name="firstName" value={form.firstName} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Last name</label>
                <input name="lastName" value={form.lastName} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Country</label>
                <input name="country" value={form.country} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Postal code</label>
                <input name="postalCode" value={form.postalCode} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Phone number</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Email address</label>
                <input type="email" name="emailAddress" value={form.emailAddress} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700">Home address</label>
                <textarea name="homeAddress" value={form.homeAddress} onChange={onChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" rows={3} />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium">Payment method</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={`flex items-center gap-3 rounded-md border p-3 ${form.paymentMethod === 'CASH_ON_DELIVERY' ? 'border-gray-900' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={form.paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className={`flex items-center gap-3 rounded-md border p-3 ${form.paymentMethod === 'PAYMENT_SLIP' ? 'border-gray-900' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYMENT_SLIP"
                    checked={form.paymentMethod === 'PAYMENT_SLIP'}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                  />
                  <span>Payment Slip</span>
                </label>
              </div>

              {form.paymentMethod === 'PAYMENT_SLIP' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={paymentInputType === 'file'}
                        onChange={() => {
                          setPaymentInputType('file');
                          setPaymentUrl('');
                        }}
                      />
                      <span>Upload File</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={paymentInputType === 'url'}
                        onChange={() => {
                          setPaymentInputType('url');
                          setPaymentFile(null);
                        }}
                      />
                      <span>Enter URL</span>
                    </label>
                  </div>

                  {paymentInputType === 'file' ? (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Upload payment slip (PDF, PNG, JPG)</label>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                      {paymentFile && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>File selected: {paymentFile.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Payment slip URL</label>
                      <input
                        type="url"
                        value={paymentUrl}
                        onChange={(e) => setPaymentUrl(e.target.value)}
                        placeholder="https://example.com/payment-slip.jpg"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter the URL of your payment slip image (must start with http:// or https://)
                      </p>
                      {paymentUrl && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>URL entered</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={placeOrder}
                disabled={submitting || loading}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-white text-sm hover:bg-gray-800 disabled:opacity-60"
              >
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-medium">Order summary</h3>
            <div className="mt-3 text-sm text-gray-600">
              {loading ? (
                <p>Loading cart...</p>
              ) : !cart || cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <>
                  <p>Items: {totals.itemsCount}</p>
                  <div className="mt-3 max-h-64 overflow-auto divide-y">
                    {cart.items.map((it) => (
                      <div key={it.cartItemId} className="py-2 flex items-center justify-between gap-3">
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={(it as any).productImage ?? 'https://placehold.co/96?text=No+Image'} alt={String(it.productId)} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{(it as any).productName ?? `Product #${it.productId}`}</p>
                          <p className="text-xs text-gray-500">Qty: {it.quantity ?? it.cartItemsQuantity}</p>
                          {(it.color || it.size) && (
                            <p className="text-xs text-gray-600 mt-1">
                              {it.color && <span>{it.color}</span>}
                              {it.color && it.size && <span> • </span>}
                              {it.size && <span>{it.size}</span>}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {(it as any).price ? (
                            <>
                              <p className="font-semibold text-gray-900">
                                Rs. {(((it as any).price ?? 0) * (it.quantity ?? it.cartItemsQuantity ?? 1)).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Rs. {((it as any).price ?? 0).toFixed(2)} each
                              </p>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subtotal Display */}
                  {cart.items.some((it: any) => it.price) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Subtotal:</span>
                        <span className="text-lg font-bold text-indigo-600">
                          Rs. {cart.items.reduce((sum, it: any) => 
                            sum + ((it.price ?? 0) * (it.quantity ?? it.cartItemsQuantity ?? 1)), 0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-3 text-xs text-gray-500">
                    {checkoutType === 'single' 
                      ? 'Checking out selected item only. Other items remain in your cart.'
                      : 'Final total including shipping will be calculated on the server based on current prices.'
                    }
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
