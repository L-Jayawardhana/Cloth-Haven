export default function AdminOrdersPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-indigo-900">Orders</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input className="h-10 rounded-md border border-indigo-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Search by user or order #" />
        <select className="h-10 rounded-md border border-indigo-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Status</option>
          <option>Pending</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
        <input className="h-10 rounded-md border border-indigo-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" type="date" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-indigo-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50 text-indigo-900">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">ORD-10{i}</td>
                <td className="px-4 py-3">Alex Johnson</td>
                <td className="px-4 py-3">2</td>
                <td className="px-4 py-3">$120.00</td>
                <td className="px-4 py-3">
                  <select className="h-9 rounded-md border border-indigo-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-amber-300 px-3 py-1.5 text-xs hover:bg-amber-50">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
