import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api/v1/colors-size-quantity-availability";

type Entry = {
  id?: number;
  productId: number;
  color: string;
  size: string;
  availability: boolean;
  quantity: number;
};

export default function AdminColorSizePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterProductId, setFilterProductId] = useState<string>("");

  // form
  const [productId, setProductId] = useState<number | "">("");
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [availability, setAvailability] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(0);

  // batch JSON
  const [batchJson, setBatchJson] = useState<string>("[]");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadByProduct() {
    if (!filterProductId) return loadAll();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/product/${filterProductId}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        productId: Number(productId),
        color,
        size,
        availability,
        quantity,
      } as Entry;
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Create failed: ${res.status}`);
      }
      await loadAll();
      // reset
      setProductId("");
      setColor("");
      setSize("");
      setAvailability(true);
      setQuantity(0);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: number, payload: Partial<Entry>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Update failed: ${res.status}`);
      }
      await loadAll();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this entry?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await loadAll();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const arr = JSON.parse(batchJson);
      if (!Array.isArray(arr)) throw new Error("Batch JSON must be an array of items");
      const res = await fetch(`${API_BASE}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arr),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Batch create failed: ${res.status}`);
      }
      await loadAll();
  setBatchJson("[]");
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-sky-700">Colors / Size / Availability</h1>
        <div className="flex gap-2">
          <input
            placeholder="Filter by productId"
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <button onClick={loadByProduct} className="rounded bg-sky-600 px-3 py-1 text-white text-sm">Filter</button>
          <button onClick={loadAll} className="rounded border px-3 py-1 text-sm">Clear</button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="rounded border bg-white p-4 shadow-sm">
        <h2 className="font-medium mb-2">Create entry</h2>
        <form className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end" onSubmit={handleCreate}>
          <div>
            <label className="block text-xs text-gray-600">Product ID</label>
            <input className="mt-1 rounded border px-2 py-1 text-sm" value={productId} onChange={(e) => setProductId(e.target.value === "" ? "" : Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Color</label>
            <input className="mt-1 rounded border px-2 py-1 text-sm" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Size</label>
            <input className="mt-1 rounded border px-2 py-1 text-sm" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Availability</label>
            <select className="mt-1 rounded border px-2 py-1 text-sm" value={String(availability)} onChange={(e) => setAvailability(e.target.value === 'true')}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Quantity</label>
            <input type="number" className="mt-1 rounded border px-2 py-1 text-sm" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>
          <div>
            <button type="submit" className="rounded bg-green-600 px-3 py-1 text-white text-sm">Create</button>
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-4 shadow-sm">
        <h2 className="font-medium mb-2">Batch create (paste JSON array)</h2>
        <form onSubmit={handleBatchCreate} className="grid gap-2">
          <textarea rows={6} className="w-full rounded border p-2 text-sm" value={batchJson} onChange={(e) => setBatchJson(e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-green-600 px-3 py-1 text-white text-sm">Create Batch</button>
            <button type="button" onClick={() => setBatchJson("[") } className="rounded border px-3 py-1 text-sm">Reset</button>
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-4 shadow-sm overflow-x-auto">
        <h2 className="font-medium mb-2">Entries {loading ? '(loading...)' : ''}</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 text-sky-700">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">ProductId</th>
              <th className="px-3 py-2">Color</th>
              <th className="px-3 py-2">Size</th>
              <th className="px-3 py-2">Available</th>
              <th className="px-3 py-2">Quantity</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2">{e.id}</td>
                <td className="px-3 py-2">{e.productId}</td>
                <td className="px-3 py-2">{e.color}</td>
                <td className="px-3 py-2">{e.size}</td>
                <td className="px-3 py-2">{String(e.availability)}</td>
                <td className="px-3 py-2">{e.quantity}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const newQty = prompt('New quantity', String(e.quantity));
                      if (newQty !== null) handleUpdate(e.id!, { quantity: Number(newQty) });
                    }} className="rounded border px-2 py-1 text-xs">Set Qty</button>
                    <button onClick={() => handleUpdate(e.id!, { availability: !e.availability })} className="rounded border px-2 py-1 text-xs">Toggle</button>
                    <button onClick={() => handleDelete(e.id!)} className="rounded border px-2 py-1 text-xs text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">No entries</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
