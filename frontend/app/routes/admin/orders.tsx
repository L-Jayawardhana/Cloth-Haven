import { useEffect, useMemo, useState } from 'react';
import { apiService, orderApi, imageApi, type OrderResponse, type OrderStatus, type User } from '../../lib/api';

export default function AdminOrdersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600 mt-1">Manage customer orders and track shipments</p>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <input value={search} onChange={e => setSearch(e.target.value)} className="h-10 rounded-md border border-indigo-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Search by user or order #" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-indigo-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div />
      </div>

      <div className="overflow-x-auto rounded-xl border border-indigo-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="px-4 py-3"> </th>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-6 text-center">No orders found</td></tr>
            ) : (
              filtered.map(o => {
                const u = usersById[o.userId];
                const itemsCount = o.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0;
                return (
                  <tr key={o.orderId} className="border-t">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
                        <img src={(o as any)._thumb ?? 'https://placehold.co/80?text=No+Image'} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{o.orderId}</td>
                    <td className="px-4 py-3">{u?.username ?? 'User ' + o.userId}<div className="text-xs text-slate-500">{u?.email}</div></td>
                    <td className="px-4 py-3">{itemsCount}</td>
                    <td className="px-4 py-3">Rs. {o.totalPrice?.toFixed?.(2) ?? o.totalPrice}</td>
                    <td className="px-4 py-3">{o.paymentMethod?.replaceAll('_',' ')}</td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={e => updateStatus(o.orderId, e.target.value as OrderStatus)} className="h-9 rounded-md border border-indigo-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">{new Date(o.orderDate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/orders/${o.orderId}`} className="rounded-md border border-amber-300 px-3 py-1.5 text-xs hover:bg-amber-50">View</a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
