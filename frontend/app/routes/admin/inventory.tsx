export default function AdminInventoryPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-sky-700">Inventory</h1>
        <button className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700">Update Stock</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 text-sky-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">Classic Tee</td>
                <td className="px-4 py-3">TEE-CL-{i}</td>
                <td className="px-4 py-3">{120 - i * 3}</td>
                <td className="px-4 py-3">{i % 3 === 0 ? "Low" : "OK"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-sky-200 px-3 py-1.5 text-xs hover:bg-sky-50">Adjust</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Inventory Log</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Change Type</th>
                <th className="px-4 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: "ORDER", qty: -2 },
                { type: "RESTOCK", qty: 50 },
                { type: "RETURN", qty: 1 },
                { type: "DAMAGE", qty: -3 },
              ].map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">2025-01-0{i + 1}</td>
                  <td className="px-4 py-3">Classic Tee</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
