import { useEffect, useState } from "react";
import { inventoryApi, type InventoryStockUpdate, type ColorsSizeQuantityAvailability } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const API_BASE = "http://localhost:8080/api/v1";

type Product = {
  productId: number;
  name: string;
  totalQuantity?: number;
  color?: string;
  size?: string;
};

type InventoryLog = {
  logId?: number;
  productId?: number;
  product?: {
    productId: number;
    name: string;
    description?: string;
    productPrice?: number;
    category?: any;
    subCategory?: any;
    color?: string;
    size?: string;
  };
  productName?: string;
  changeType?: string;
  quantityChanged?: number;
  inventoryLogsDate?: string;
  [key: string]: any; // Allow any additional fields
};

const CHANGE_TYPES = ["ORDER", "RESTOCK", "CANCEL", "RETURN", "DAMAGE", "ADJUSTMENT"] as const;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
  const [logFilters, setLogFilters] = useState({
    productId: '',
    changeType: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11;

  // Form state for adding a log
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [changeType, setChangeType] = useState<string>(CHANGE_TYPES[0]);
  const [quantity, setQuantity] = useState<number>(0);

  // Stock Update Modal State
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null);
  const [productVariants, setProductVariants] = useState<ColorsSizeQuantityAvailability[]>([]);
  const [stockUpdate, setStockUpdate] = useState<InventoryStockUpdate>({
    productId: 0,
    color: "",
    size: "",
    changeType: "RESTOCK",
    quantityChange: 0,
    reason: ""
  });

  // Stock View State
  const [showStockView, setShowStockView] = useState(false);
  const [stockViewProduct, setStockViewProduct] = useState<Product | null>(null);
  const [stockViewVariants, setStockViewVariants] = useState<ColorsSizeQuantityAvailability[]>([]);
  
  // Low Stock State
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [lowStockItems, setLowStockItems] = useState<ColorsSizeQuantityAvailability[]>([]);
  const [showLowStock, setShowLowStock] = useState(false);


  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load logs after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      loadLogs();
    }
    // eslint-disable-next-line
  }, [products]);

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
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      
      console.log('Testing color/size - First log:', data[0]);
      console.log('Color field:', data[0]?.color);
      console.log('Size field:', data[0]?.size);
      
      // Sort logs by date descending
      data.sort((a: InventoryLog, b: InventoryLog) => new Date(b.inventoryLogsDate || '').getTime() - new Date(a.inventoryLogsDate || '').getTime());
      
      // Attach product name if missing
      const productMap = Object.fromEntries(products.map(p => [p.productId, p.name]));
      
      data.forEach((log: InventoryLog) => {
        if (!log.productName && log.productId) {
          log.productName = productMap[log.productId] || `Product ${log.productId}`;
        }
      });
      setLogs(data);
      setFilteredLogs(data);
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err?.message || String(err));
    }
  }
  // Filtering logic for logs
  function applyLogFilters() {
    let filtered = [...logs];
    if (logFilters.productId) {
      filtered = filtered.filter(l => {
        const logProductId = l.product?.productId || l.productId;
        return String(logProductId) === String(logFilters.productId);
      });
    }
    if (logFilters.changeType) {
      filtered = filtered.filter(l => l.changeType === logFilters.changeType);
    }
    if (logFilters.startDate) {
      filtered = filtered.filter(l => l.inventoryLogsDate && l.inventoryLogsDate >= logFilters.startDate);
    }
    if (logFilters.endDate) {
      filtered = filtered.filter(l => l.inventoryLogsDate && l.inventoryLogsDate <= logFilters.endDate + 'T23:59:59');
    }
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }

  useEffect(() => {
    applyLogFilters();
    // eslint-disable-next-line
  }, [logs, logFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  function goToPage(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  // Download as CSV
  function downloadCSV() {
    const headers = ['Date', 'Product', 'Color', 'Size', 'Change Type', 'Quantity'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(row => {
        const productName = (() => {
          if (row.product?.name) return row.product.name;
          const productId = row.product?.productId || row.productId;
          if (productId) {
            const product = products.find(p => 
              p.productId === productId || 
              p.productId === Number(productId) || 
              String(p.productId) === String(productId)
            );
            if (product) return product.name;
          }
          if (row.productName) return row.productName;
          if (productId) return `Product ID: ${productId}`;
          return 'Unknown Product';
        })();
        
        return [
          formatDate(row.inventoryLogsDate),
          `"${productName.replace(/"/g, '""')}"`, // Escape quotes
          row.product?.color ?? row.color ?? '-',
          row.product?.size ?? row.size ?? '-',
          row.changeType ?? '-',
          row.quantityChanged ?? 0
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // Download as PDF
  function downloadPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = filteredLogs.map(row => {
      const productName = (() => {
        if (row.product?.name) return row.product.name;
        const productId = row.product?.productId || row.productId;
        if (productId) {
          const product = products.find(p => 
            p.productId === productId || 
            p.productId === Number(productId) || 
            String(p.productId) === String(productId)
          );
          if (product) return product.name;
        }
        if (row.productName) return row.productName;
        if (productId) return `Product ID: ${productId}`;
        return 'Unknown Product';
      })();

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(row.inventoryLogsDate)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.product?.color ?? row.color ?? '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.product?.size ?? row.size ?? '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.changeType ?? '-'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.quantityChanged ?? 0}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Logs Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #0ea5e9; color: white; padding: 10px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .report-info { text-align: center; color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Inventory Logs Report</h1>
          <div class="report-info">
            Generated on ${new Date().toLocaleString()}
            <br>Total Records: ${filteredLogs.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Color</th>
                <th>Size</th>
                <th>Change Type</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  async function openStockUpdateModal(product: Product) {
    setStockUpdateProduct(product);
    setStockUpdate({ ...stockUpdate, productId: product.productId });
    setShowStockModal(true);
    
    // Load product variants
    try {
      const variants = await inventoryApi.getProductVariants(product.productId);
      setProductVariants(variants);
      
      // Set default color and size if variants exist
      if (variants.length > 0) {
        setStockUpdate(prev => ({
          ...prev,
          color: variants[0].color,
          size: variants[0].size
        }));
      }
    } catch (err: any) {
      setError(`Failed to load product variants: ${err.message}`);
    }
  }

  function closeStockUpdateModal() {
    setShowStockModal(false);
    setStockUpdateProduct(null);
    setProductVariants([]);
    setStockUpdate({
      productId: 0,
      color: "",
      size: "",
      changeType: "RESTOCK",
      quantityChange: 0,
      reason: ""
    });
  }

  async function handleStockUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!stockUpdate.color || !stockUpdate.size || stockUpdate.quantityChange === 0) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await inventoryApi.updateStock(stockUpdate);
      await loadProducts(); // Refresh the products list
      await loadLogs(); // Refresh the logs list
      closeStockUpdateModal();
    } catch (err: any) {
      setError(`Failed to update stock: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function openStockView(product: Product) {
    setStockViewProduct(product);
    setShowStockView(true);
    
    try {
      const variants = await inventoryApi.getProductVariants(product.productId);
      setStockViewVariants(variants);
    } catch (err: any) {
      setError(`Failed to load product variants: ${err.message}`);
    }
  }

  function closeStockView() {
    setShowStockView(false);
    setStockViewProduct(null);
    setStockViewVariants([]);
  }

  async function loadLowStockItems() {
    setLoading(true);
    setError(null);
    try {
      const allVariants: ColorsSizeQuantityAvailability[] = [];
      
      // Get variants for all products
      for (const product of products) {
        try {
          const variants = await inventoryApi.getProductVariants(product.productId);
          // Add product name to each variant for display
          const variantsWithProductName = variants.map(variant => ({
            ...variant,
            productName: product.name
          }));
          allVariants.push(...variantsWithProductName);
        } catch (err) {
          console.error(`Failed to load variants for product ${product.productId}:`, err);
        }
      }
      
      // Filter variants below threshold
      const lowStock = allVariants.filter(variant => variant.quantity <= lowStockThreshold);
      setLowStockItems(lowStock);
      setShowLowStock(true);
    } catch (err: any) {
      setError(`Failed to load low stock items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-600 mt-1">Monitor stock levels and manage inventory across all products</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
            <label className="text-sm font-medium text-slate-700">Low Stock Threshold:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
              min="1"
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <button
              onClick={loadLowStockItems}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              View Low Stock
            </button>
          </div>
          <button
            onClick={() => loadProducts()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Products Overview Card */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Product Inventory Overview</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Manage stock levels and view inventory status for all products</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Product ID</th>
                  <th className="px-6 py-4 font-semibold">Total Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productId} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-slate-600">{p.productId}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{p.totalQuantity ?? "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        (p.totalQuantity ?? 0) < lowStockThreshold 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(p.totalQuantity ?? 0) < lowStockThreshold ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openStockView(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Stock
                        </button>
                        <button
                          onClick={() => openStockUpdateModal(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Update Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">No products found</span>
                        <span>Add products to start managing inventory</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Inventory Log</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
        {/* Filter options */}
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Product</label>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={logFilters.productId}
              onChange={e => setLogFilters(f => ({ ...f, productId: e.target.value }))}
            >
              <option value="">All</option>
              {products.map(p => (
                <option key={p.productId} value={p.productId}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Change Type</label>
            <select
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={logFilters.changeType}
              onChange={e => setLogFilters(f => ({ ...f, changeType: e.target.value }))}
            >
              <option value="">All</option>
              {CHANGE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={logFilters.startDate}
              onChange={e => setLogFilters(f => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              value={logFilters.endDate}
              onChange={e => setLogFilters(f => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <button
            className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={() => setLogFilters({ productId: '', changeType: '', startDate: '', endDate: '' })}
            type="button"
          >
            Clear Filters
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sky-50 text-sky-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Change Type</th>
                <th className="px-4 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((row) => (
                <tr key={row.logId ?? Math.random()} className="border-t">
                  <td className="px-4 py-3">{formatDate(row.inventoryLogsDate)}</td>
                  <td className="px-4 py-3">{
                    // Get product name from the nested product object or find by ID
                    (() => {
                      if (row.product?.name) return row.product.name;
                      const productId = row.product?.productId || row.productId;
                      if (productId) {
                        const product = products.find(p => 
                          p.productId === productId || 
                          p.productId === Number(productId) || 
                          String(p.productId) === String(productId)
                        );
                        if (product) return product.name;
                      }
                      if (row.productName) return row.productName;
                      if (productId) return `Product ID: ${productId}`;
                      return 'Unknown Product';
                    })()
                  }</td>
                  <td className="px-4 py-3">{row.product?.color ?? row.color ?? '-'}</td>
                  <td className="px-4 py-3">{row.product?.size ?? row.size ?? '-'}</td>
                  <td className="px-4 py-3">{row.changeType}</td>
                  <td className="px-4 py-3">{row.quantityChanged}</td>
                </tr>
              ))}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-lg">
            <div className="text-sm text-slate-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of{' '}
              {filteredLogs.length} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Update Stock</h2>
              <button
                onClick={closeStockUpdateModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {stockUpdateProduct && (
              <p className="text-sm text-gray-600 mb-4">
                Product: <span className="font-medium">{stockUpdateProduct.name}</span> (ID: {stockUpdateProduct.productId})
              </p>
            )}

            <form onSubmit={handleStockUpdate} className="space-y-4">
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={stockUpdate.color}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, color: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Color</option>
                  {[...new Set(productVariants.map(v => v.color))].map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={stockUpdate.size}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, size: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Size</option>
                  {stockUpdate.color && productVariants
                    .filter(v => v.color === stockUpdate.color)
                    .map(variant => (
                      <option key={variant.id} value={variant.size}>
                        {variant.size} (Current: {variant.quantity})
                      </option>
                    ))}
                </select>
              </div>

              {/* Change Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Type</label>
                <select
                  value={stockUpdate.changeType}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, changeType: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {CHANGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Quantity Change */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Change
                  <span className="text-xs text-gray-500 ml-1">
                    (+ to add, - to subtract)
                  </span>
                </label>
                <input
                  type="number"
                  value={stockUpdate.quantityChange}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantityChange: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter quantity change..."
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={stockUpdate.reason || ""}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter reason for change..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeStockUpdateModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Updating..." : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock View Modal */}
      {showStockView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Current Stock Details</h2>
              <button
                onClick={closeStockView}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {stockViewProduct && (
              <p className="text-sm text-gray-600 mb-4">
                Product: <span className="font-medium">{stockViewProduct.name}</span> (ID: {stockViewProduct.productId})
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockViewVariants.map((variant) => (
                    <tr key={variant.id} className="border-t">
                      <td className="px-4 py-3">{variant.color}</td>
                      <td className="px-4 py-3">{variant.size}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${variant.quantity <= lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>
                          {variant.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          variant.quantity === 0 
                            ? 'bg-red-100 text-red-800' 
                            : variant.quantity <= lowStockThreshold 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {variant.quantity === 0 ? 'Out of Stock' : 
                           variant.quantity <= lowStockThreshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stockViewVariants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                        No variants found for this product
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={closeStockView}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Modal */}
      {showLowStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Low Stock Alert
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Items with stock levels at or below {lowStockThreshold} units
                </p>
              </div>
              <button
                onClick={() => setShowLowStock(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-orange-50 text-orange-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Product ID</th>
                      <th className="px-6 py-4 font-semibold">Color</th>
                      <th className="px-6 py-4 font-semibold">Size</th>
                      <th className="px-6 py-4 font-semibold">Current Stock</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={`${item.productId}-${item.id}`} className="border-t border-slate-100 hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{(item as any).productName || `Product ${item.productId}`}</td>
                        <td className="px-6 py-4 text-slate-600">{item.productId}</td>
                        <td className="px-6 py-4 text-slate-600">{item.color}</td>
                        <td className="px-6 py-4 text-slate-600">{item.size}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            item.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            item.quantity === 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {lowStockItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-green-600 font-semibold text-lg">✓ No low stock items found!</span>
                              <p className="text-slate-600 mt-1">All product variants have more than {lowStockThreshold} units in stock.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Found {lowStockItems.length}</span> low stock {lowStockItems.length === 1 ? 'item' : 'items'}
                </div>
                <button
                  onClick={() => setShowLowStock(false)}
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
