export default function AdminProductsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-700">Products & Categories</h1>
        <div className="flex gap-2">
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Add Product</button>
          <button className="rounded-md border border-emerald-200 px-3 py-2 text-sm hover:bg-emerald-50">Manage Categories</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Search products" />
        <select className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
          <option value="">All Categories</option>
          <option>Tops</option>
          <option>Bottoms</option>
          <option>Accessories</option>
        </select>
        <select className="h-10 rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
          <option value="">All Status</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-emerald-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">Classic Tee</td>
                <td className="px-4 py-3">Tops</td>
                <td className="px-4 py-3">$29.00</td>
                <td className="px-4 py-3">112</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs hover:bg-emerald-50">Edit</button>
                    <button className="rounded-md border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Category Management</h2>
        <div className="flex gap-2">
          <input className="h-10 w-full rounded-md border border-emerald-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="New category name" />
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Add</button>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {['Tops','Bottoms','Accessories','Outerwear','Footwear'].map((c) => (
            <div key={c} className="flex items-center justify-between rounded-md border border-emerald-200 px-3 py-2 text-sm">
              <span>{c}</span>
              <div className="flex gap-2">
                <button className="rounded-md border border-emerald-200 px-2 py-1 text-xs hover:bg-emerald-50">Rename</button>
                <button className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
