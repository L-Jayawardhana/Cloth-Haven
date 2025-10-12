import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api/v1";

type Product = {
  productId: number;
  name: string;
  totalQuantity?: number;
};

type InventoryLog = {
  logId?: number;
  productId?: number;
  productName?: string;
  changeType?: string;
  quantityChanged?: number;
  inventoryLogsDate?: string;
};

const CHANGE_TYPES = ["ORDER", "RESTOCK", "RETURN", "DAMAGE"];

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding a log
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [changeType, setChangeType] = useState<string>(CHANGE_TYPES[0]);
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    loadProducts();
    loadLogs();
  }, []);

  async function loadProducts() {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/products/get-products`);
      if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }

  async function loadLogs() {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/inventoryLogs/getAllLogs`);
      if (!res.ok) throw new Error(`Logs fetch failed: ${res.status}`);
      const data = await res.json();
      // Expecting array of logs; backend DTO may differ so be defensive
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || String(err));
    }
  }

  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const d = new Date(dt);
      return d.toLocaleString();
    } catch {
      return dt;
    }
  }

  async function handleAddLog(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedProductId) {
      setError("Select a product");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Backend expects LocalDateTime ; send 'YYYY-MM-DDTHH:mm:ss'
      const nowLocal = new Date().toISOString().slice(0, 19);
      const body = {
        productId: Number(selectedProductId),
        changeType,
        quantityChanged: Number(quantity),
        inventoryLogsDate: nowLocal,
      };
      const res = await fetch(`${API_BASE}/inventoryLogs/addLog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Add log failed: ${res.status}`);
      }
      // refresh logs
      await loadLogs();
      // reset form
      setSelectedProductId("");
      setChangeType(CHANGE_TYPES[0]);
      setQuantity(0);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-sky-700">Inventory</h1>
        <button
          onClick={() => loadProducts()}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 text-sky-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Product ID</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} className="border-t">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.productId}</td>
                <td className="px-4 py-3">{p.totalQuantity ?? "-"}</td>
                <td className="px-4 py-3">{(p.totalQuantity ?? 0) < 5 ? "Low" : "OK"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedProductId(p.productId);
                      }}
                      className="rounded-md border border-sky-200 px-3 py-1.5 text-xs hover:bg-sky-50"
                    >
                      Adjust
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Add Inventory Log</h2>
        <form className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end" onSubmit={handleAddLog}>
          <div>
            <label className="block text-xs text-gray-600">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 block w-full rounded border px-2 py-1 text-sm"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} (id: {p.productId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Change Type</label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
              className="mt-1 block w-full rounded border px-2 py-1 text-sm"
            >
              {CHANGE_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-full rounded border px-2 py-1 text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {loading ? "Saving..." : "Add Log"}
            </button>
          </div>
        </form>
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
              {logs.map((row) => (
                <tr key={row.logId ?? Math.random()} className="border-t">
                  <td className="px-4 py-3">{formatDate(row.inventoryLogsDate)}</td>
                  <td className="px-4 py-3">{row.productName ?? row.productId}</td>
                  <td className="px-4 py-3">{row.changeType}</td>
                  <td className="px-4 py-3">{row.quantityChanged}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
