import { useEffect, useMemo, useState } from 'react';
import { apiService, orderApi, imageApi, productApi, type OrderResponse, type OrderStatus, type User } from '../../lib/api';

export default function AdminOrdersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [slipOrderId, setSlipOrderId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ [key: number]: any }>({});
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const allUsers = await apiService.getAllUsers();
        setUsers(allUsers);
        // Fetch orders for each user in sequence to avoid overloading backend
        const allOrders: OrderResponse[] = [];
        for (const u of allUsers) {
          try {
            const uOrders = await orderApi.getUserOrders(u.userId);
            allOrders.push(...uOrders);
          } catch (e) {
            // continue
          }
        }
        // Sort latest first
        allOrders.sort((a, b) => (new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
        // Attach thumbnails for admin list
        const withThumbs = await Promise.all(allOrders.map(async (o) => {
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
  }, []);

  const usersById = useMemo(() => Object.fromEntries(users.map(u => [u.userId, u])), [users]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!search) return true;
      const u = usersById[o.userId];
      const target = `${o.orderId} ${u?.username ?? ''} ${u?.email ?? ''}`.toLowerCase();
      return target.includes(search.toLowerCase());
    });
  }, [orders, statusFilter, search, usersById]);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await orderApi.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.orderId === orderId ? updated : o)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update status');
    }
  };

  const downloadPdf = async (orderId: number) => {
    try {
      const blob = await orderApi.downloadOrderPdf(orderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'Failed to download PDF');
    }
  };

  const toggleOrderDetails = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderDetails[orderId]) {
      try {
        const order = await orderApi.getOrderById(orderId);
        // Enrich each item with its first image and product name
        const items = await Promise.all((order.items || []).map(async it => {
          try {
            const [imgs, prod] = await Promise.all([
              imageApi.getImagesByProductId(it.productId),
              productApi.getProductById(it.productId)
            ]);
            return { ...it, _image: imgs?.[0]?.imageUrl, _productName: prod?.name } as any;
          } catch { return it as any; }
        }));
        setOrderDetails(prev => ({ ...prev, [orderId]: { ...order, items } }));
      } catch (e: any) {
        setError(e?.message || 'Failed to load order details');
      }
    }
  };

  const viewPaymentSlip = (orderId: number, url: string | null) => {
    setSlipOrderId(orderId);
    setSlipUrl(url);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const stats = useMemo(() => {
  const total = orders.length;
  const pending = orders.filter(o => o.status === 'PENDING').length;
  const processing = orders.filter(o => o.status === 'PROCESSING').length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;
  // Only include non-cancelled orders in revenue
  const revenue = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  return { total, pending, processing, delivered, revenue };
  }, [orders]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue (Rs.)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" 
              placeholder="Search by order ID, customer name or email..." 
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <button 
            onClick={() => { setSearch(''); setStatusFilter(''); }} 
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          // Skeleton Loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filtered.map(o => {
            const u = usersById[o.userId];
            const itemsCount = o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
            const isExpanded = expandedOrderId === o.orderId;
            const details = orderDetails[o.orderId];
            const isDropdownOpen = activeDropdown === o.orderId;
            
            return (
              <div key={o.orderId} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Product Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-gray-200">
                      <img 
                        src={(o as any)._thumb ?? 'https://placehold.co/80?text=No+Image'} 
                        alt="thumb" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Order #{o.orderId}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Customer</p>
                              <p className="font-medium text-gray-900">{u?.username ?? 'User ' + o.userId}</p>
                              <p className="text-xs text-gray-500">{u?.email}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500 mb-1">Items</p>
                              <p className="font-medium text-gray-900">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500 mb-1">Total Amount</p>
                              <p className="font-semibold text-indigo-600 text-base">Rs. {o.totalPrice?.toFixed?.(2) ?? o.totalPrice}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-500 mb-1">Order Date</p>
                              <p className="font-medium text-gray-900">{new Date(o.orderDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(o.orderDate).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Info */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Payment:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {o.paymentMethod?.replaceAll('_', ' ')}
                          </span>
                        </div>
                        
                        {o.paymentMethod === 'PAYMENT_SLIP' && (o as any).paymentSlipUrl && (
                          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                            <div 
                              className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-300 flex-shrink-0 cursor-pointer hover:border-indigo-500 transition-colors" 
                              onClick={() => viewPaymentSlip(o.orderId, (o as any).paymentSlipUrl)}
                            >
                              {(o as any).paymentSlipUrl?.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-full bg-red-50 flex items-center justify-center">
                                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <img src={(o as any).paymentSlipUrl} alt="slip" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <button
                              onClick={() => viewPaymentSlip(o.orderId, (o as any).paymentSlipUrl)}
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              View Payment Slip
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <button 
                          onClick={() => setActiveDropdown(isDropdownOpen ? null : o.orderId)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => { toggleOrderDetails(o.orderId); setActiveDropdown(null); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {isExpanded ? 'Hide' : 'View'} Items
                            </button>
                            <button
                              onClick={() => { downloadPdf(o.orderId); setActiveDropdown(null); }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download PDF
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <select 
                        value={o.status} 
                        onChange={e => updateStatus(o.orderId, e.target.value as OrderStatus)} 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Order Details */}
                {isExpanded && details && (
                  <div className="border-t border-gray-200 bg-gray-50 p-5">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {details.items?.map((it: any) => (
                        <div key={it.orderItemId} className="flex items-center gap-4 bg-white rounded-lg p-4 border border-gray-200">
                          <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            <img 
                              src={it._image ?? 'https://placehold.co/128?text=No+Image'} 
                              alt={String(it.productId)} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              {it._productName || `Product #${it.productId}`}
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">Qty: <span className="font-medium text-gray-900">{it.quantity}</span></span>
                              {it.color && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {it.color}
                                </span>
                              )}
                              {it.size && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  Size {it.size}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-indigo-600">
                              Rs. {it.price?.toFixed?.(2) ?? it.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Payment Slip Section */}
                    {details.paymentMethod === 'PAYMENT_SLIP' && details.paymentSlipUrl && (
                      <div className="mt-5 pt-5 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Payment Slip
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex gap-4">
                            {/* Thumbnail Preview */}
                            <div className="flex-shrink-0">
                              {details.paymentSlipUrl.toLowerCase().endsWith('.pdf') ? (
                                <div 
                                  className="w-32 h-32 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center text-red-600 cursor-pointer hover:bg-red-100 transition-colors" 
                                  onClick={() => viewPaymentSlip(details.orderId, details.paymentSlipUrl)}
                                >
                                  <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-medium">PDF Document</span>
                                </div>
                              ) : (
                                <img 
                                  src={details.paymentSlipUrl} 
                                  alt="Payment Slip" 
                                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors shadow-sm"
                                  onClick={() => viewPaymentSlip(details.orderId, details.paymentSlipUrl)}
                                />
                              )}
                            </div>
                            
                            {/* Info and Actions */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium text-sm">Payment slip uploaded</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  ✓ Will be included in PDF download
                                </p>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => viewPaymentSlip(details.orderId, details.paymentSlipUrl)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Full Size
                                </button>
                                <a
                                  href={details.paymentSlipUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Open in New Tab
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {(slipUrl || slipOrderId) && (
        <PaymentSlipModal 
          slipUrl={slipUrl} 
          orderId={slipOrderId} 
          onClose={() => { setSlipUrl(null); setSlipOrderId(null); }} 
        />
      )}
    </div>
  );
}

function PaymentSlipModal({ slipUrl, orderId, onClose }: { slipUrl: string | null; orderId: number | null; onClose: () => void }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    if (slipUrl) {
      // Use the URL directly
      setBlobUrl(slipUrl);
      setIsPdf(slipUrl.toLowerCase().endsWith('.pdf'));
    } else if (orderId) {
      // Load from database
      setLoading(true);
      setError(null);
      orderApi.getPaymentSlipFromDatabase(orderId)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setIsPdf(blob.type === 'application/pdf');
        })
        .catch(err => {
          setError(err?.message || 'Failed to load payment slip from database');
        })
        .finally(() => setLoading(false));
    }

    return () => {
      // Cleanup blob URL when component unmounts
      if (blobUrl && !slipUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [slipUrl, orderId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Slip</h3>
              <p className="text-sm text-gray-600">Order #{orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {blobUrl && (
              <a 
                href={blobUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
            )}
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[75vh] bg-white rounded-xl border-2 border-dashed border-gray-300">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Loading payment slip...</p>
              <p className="mt-2 text-sm text-gray-500">Please wait while we retrieve the document</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[75vh] bg-white rounded-xl border-2 border-red-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold text-lg mb-2">Failed to Load</p>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          ) : blobUrl ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {isPdf ? (
                <iframe 
                  src={blobUrl} 
                  className="w-full h-[75vh]" 
                  title="Payment Slip PDF"
                  style={{ border: 'none' }}
                />
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-50">
                  <img 
                    src={blobUrl} 
                    alt="Payment Slip" 
                    className="max-h-[75vh] w-auto rounded-lg shadow-lg border border-gray-200" 
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
