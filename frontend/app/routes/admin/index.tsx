import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { apiService, orderApi, productApi } from "../../lib/api";

export default function AdminDashboard() {
  // Recent orders state
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(true);
  const [recentOrdersError, setRecentOrdersError] = useState("");
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState("");

  const [newCustomersCount, setNewCustomersCount] = useState<number | null>(null);
  const [loadingNewCustomers, setLoadingNewCustomers] = useState(true);
  const [newCustomersError, setNewCustomersError] = useState("");

  // Sales and Orders state
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);

  // Sales trend state
  type DateRange = '7days' | '30days' | '60days' | '6months' | '12months';
  const [selectedRange, setSelectedRange] = useState<DateRange>('7days');
  const [salesTrendData, setSalesTrendData] = useState<{ date: string; revenue: number }[]>([]);
  const [loadingSalesTrend, setLoadingSalesTrend] = useState(true);
  const [salesTrendError, setSalesTrendError] = useState("");

  // Top-selling products state
  const [selectedProductRange, setSelectedProductRange] = useState<DateRange>('7days');
  const [topProducts, setTopProducts] = useState<{ productId: number; name: string; quantity: number }[]>([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [topProductsError, setTopProductsError] = useState("");

  useEffect(() => {
  loadCustomerCount();
  loadNewCustomersCount();
  loadOrdersAndSales();
  loadRecentOrders();
  loadSalesTrend();
  loadTopProducts();
  }, []);

  useEffect(() => {
    loadSalesTrend();
  }, [selectedRange]);

  useEffect(() => {
    loadTopProducts();
  }, [selectedProductRange]);

  const loadCustomerCount = async () => {
    try {
      setLoadingCustomers(true);
      setCustomerError("");
      const users = await apiService.getAllUsers();
      const customers = users.filter(user => user.role === "CUSTOMER");
      setCustomerCount(customers.length);
    } catch (error: any) {
      setCustomerError("Failed to load");
      setCustomerCount(null);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadNewCustomersCount = async () => {
    try {
      setLoadingNewCustomers(true);
      setNewCustomersError("");
      const users = await apiService.getAllUsers();
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newCustomers = users.filter(user => {
        if (user.role !== "CUSTOMER" || !user.createdAt) return false;
        const created = new Date(user.createdAt);
        return created >= sevenDaysAgo && created <= now;
      });
      setNewCustomersCount(newCustomers.length);
    } catch (error: any) {
      setNewCustomersError("Failed to load");
      setNewCustomersCount(null);
    } finally {
      setLoadingNewCustomers(false);
    }
  };

  // Load orders and sales for last 7 days
  // Load recent orders for dashboard
  const loadRecentOrders = async () => {
    try {
      setLoadingRecentOrders(true);
      setRecentOrdersError("");
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders.map(o => ({ ...o, customerName: u.username })));
        } catch {}
      }
      // Filter orders from last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recent = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= sevenDaysAgo && orderDate <= now;
      });
  // Sort by date descending, take latest 10
  recent.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setRecentOrders(recent.slice(0, 10));
    } catch (error: any) {
      setRecentOrdersError("Failed to load recent orders");
      setRecentOrders([]);
    } finally {
      setLoadingRecentOrders(false);
    }
  };
  const loadOrdersAndSales = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError("");
      // Get all users
      const users = await apiService.getAllUsers();
      // Get all orders for all users
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      // Filter orders from last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= sevenDaysAgo && orderDate <= now;
      });
  setTotalOrders(recentOrders.length);
  // Only include non-cancelled orders in revenue
  setTotalSales(recentOrders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.totalPrice || 0), 0));
    } catch (error: any) {
      setOrdersError("Failed to load");
      setTotalOrders(0);
      setTotalSales(0);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSalesTrend = async () => {
    try {
      setLoadingSalesTrend(true);
      setSalesTrendError("");
      
      // Get all users and their orders
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      
      // Calculate date range based on selection
      const now = new Date();
      let startDate: Date;
      let groupBy: 'day' | 'week' | 'month';
      
      switch (selectedRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = 'day';
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          groupBy = 'day';
          break;
        case '60days':
          startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          groupBy = 'day';
          break;
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          groupBy = 'week';
          break;
        case '12months':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          groupBy = 'month';
          break;
      }
      
      // Filter orders within the date range
      const filteredOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= now;
      });
      
      // Create a map with ALL periods in the range initialized to 0
      const revenueMap = new Map<string, number>();
      
      // Initialize all periods with 0
      if (groupBy === 'day') {
        const days = selectedRange === '7days' ? 7 : selectedRange === '30days' ? 30 : 60;
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const key = date.toISOString().split('T')[0];
          revenueMap.set(key, 0);
        }
      } else if (groupBy === 'week') {
        // For 6 months, create ~26 weeks
        for (let i = 0; i < 26; i++) {
          const date = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const key = weekStart.toISOString().split('T')[0];
          revenueMap.set(key, 0);
        }
      } else { // month
        // For 12 months, create 12 month keys
        for (let i = 0; i < 12; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueMap.set(key, 0);
        }
      }
      
      // Now add actual revenue data
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        let key: string;
        
        if (groupBy === 'day') {
          key = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (groupBy === 'week') {
          // Get start of week (Sunday)
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else { // month
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (revenueMap.has(key)) {
          const currentRevenue = revenueMap.get(key) || 0;
          revenueMap.set(key, currentRevenue + (order.totalPrice || 0));
        }
      });
      
      // Convert to array and sort by date
      const trendData = Array.from(revenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      setSalesTrendData(trendData);
    } catch (error: any) {
      setSalesTrendError("Failed to load sales trend");
      setSalesTrendData([]);
    } finally {
      setLoadingSalesTrend(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      setLoadingTopProducts(true);
      setTopProductsError("");
      
      // Get all users and their orders
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      
      // Calculate date range based on selection
      const now = new Date();
      let startDate: Date;
      
      switch (selectedProductRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '60days':
          startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          break;
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '12months':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
      
      // Filter orders within the date range
      const filteredOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= now;
      });
      
      // Collect all order items and count quantities by product
      const productQuantityMap = new Map<number, number>();
      
      for (const order of filteredOrders) {
        try {
          const orderDetails = await orderApi.getOrderById(order.orderId);
          if (orderDetails.items) {
            orderDetails.items.forEach((item: any) => {
              const currentQty = productQuantityMap.get(item.productId) || 0;
              productQuantityMap.set(item.productId, currentQty + (item.quantity || 0));
            });
          }
        } catch {}
      }
      
      // Convert to array and sort by quantity
      const productStats = Array.from(productQuantityMap.entries())
        .map(([productId, quantity]) => ({ productId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Get top 5
      
      // Fetch product names
      const productsWithNames = await Promise.all(
        productStats.map(async (p) => {
          try {
            const product = await productApi.getProductById(p.productId);
            return { ...p, name: product.name || `Product #${p.productId}` };
          } catch {
            return { ...p, name: `Product #${p.productId}` };
          }
        })
      );
      
      setTopProducts(productsWithNames);
    } catch (error: any) {
      setTopProductsError("Failed to load top products");
      setTopProducts([]);
    } finally {
      setLoadingTopProducts(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <button 
          onClick={loadCustomerCount}
          disabled={loadingCustomers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {loadingCustomers ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

  <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi 
          title="Total Sales (Rs.)" 
          value={loadingOrders ? "..." : ordersError ? "Error" : ` ${totalSales.toFixed(2)}`}
          sub={loadingOrders ? "Loading..." : ordersError ? "Failed to load" : "Last 7 days"}
          accent={ordersError ? "rose" : "amber"}
        />
        <Kpi 
          title="Total Orders" 
          value={loadingOrders ? "..." : ordersError ? "Error" : totalOrders.toString()}
          sub={loadingOrders ? "Loading..." : ordersError ? "Failed to load" : "Last 7 days"}
          accent={ordersError ? "rose" : "indigo"}
        />
        <Kpi 
          title="Total Customers" 
          value={
            loadingCustomers 
              ? "..."
              : customerError 
                ? "Error" 
                : customerCount?.toString() || "0"
          } 
          sub={
            loadingCustomers 
              ? "Loading..." 
              : customerError 
                ? "Failed to load" 
                : "Active users"
          } 
          accent={customerError ? "rose" : "emerald"}
        />
        <Kpi 
          title="New Customers" 
          value={
            loadingNewCustomers
              ? "..."
              : newCustomersError
                ? "Error"
                : newCustomersCount?.toString() || "0"
          }
          sub={
            loadingNewCustomers
              ? "Loading..."
              : newCustomersError
                ? "Failed to load"
                : "Last 7 days"
          }
          accent={newCustomersError ? "rose" : "teal"}
        />
        <Kpi title="Low Stock Alerts" value="8" sub="Items below threshold" accent="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Store Revenue Trend</CardTitle>
                <p className="text-sm text-slate-600">
                  Total Revenue for {
                    selectedRange === '7days' ? 'the last 7 days' :
                    selectedRange === '30days' ? 'the last 30 days' :
                    selectedRange === '60days' ? 'the last 60 days' :
                    selectedRange === '6months' ? 'the last 6 months' :
                    'the last 12 months'
                  }
                </p>
              </div>
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value as DateRange)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="60days">Last 60 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSalesTrend ? (
              <div className="h-56 flex items-center justify-center text-slate-500">
                Loading sales data...
              </div>
            ) : salesTrendError ? (
              <div className="h-56 flex items-center justify-center text-rose-500">
                {salesTrendError}
              </div>
            ) : salesTrendData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-500">
                No sales data available for this period
              </div>
            ) : (
              <PlaceholderChart type="line" data={salesTrendData} range={selectedRange} />
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Top 5 Best-Selling Products</CardTitle>
                <p className="text-sm text-slate-600">
                  Products Sold by Quantity for {
                    selectedProductRange === '7days' ? 'the last 7 days' :
                    selectedProductRange === '30days' ? 'the last 30 days' :
                    selectedProductRange === '60days' ? 'the last 60 days' :
                    selectedProductRange === '6months' ? 'the last 6 months' :
                    'the last 12 months'
                  }
                </p>
              </div>
              <select
                value={selectedProductRange}
                onChange={(e) => setSelectedProductRange(e.target.value as DateRange)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="60days">Last 60 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTopProducts ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Loading product data...
              </div>
            ) : topProductsError ? (
              <div className="h-64 flex items-center justify-center text-rose-500">
                {topProductsError}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No product data available for this period
              </div>
            ) : (
              <PlaceholderChart type="bar" productData={topProducts} />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="w-full">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Orders</CardTitle>
              <p className="text-sm text-slate-600">Latest customer orders and their status</p>
            </div>
            <Link 
              to="/admin/orders" 
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRecentOrders ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">Loading...</td></tr>
                  ) : recentOrdersError ? (
                    <tr><td colSpan={5} className="py-6 text-center text-rose-500">{recentOrdersError}</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">No recent orders found</td></tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.orderId} className="hover:bg-slate-50 transition-colors cursor-pointer">
                        <td className="py-3 px-4">
                          <span className="font-medium text-sm text-slate-900">#{order.orderId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-900">{order.customerName || `User ${order.userId}`}</span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-sm text-slate-900">Rs. {order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-500">{new Date(order.orderDate).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* View More Button */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Link 
                to="/admin/orders"
                className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-all duration-200 font-medium flex items-center justify-center gap-1"
              >
                <span>View All Orders</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({ title, value, sub, accent = "indigo" }: { title: string; value: string; sub: string; accent?: "indigo" | "emerald" | "teal" | "amber" | "rose" }) {
  const isLoading = value === "...";
  
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200", 
    Shipped: "bg-purple-100 text-purple-800 border-purple-200",
    Pending: "bg-orange-100 text-orange-800 border-orange-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
      statusClasses[status as keyof typeof statusClasses] || "bg-slate-100 text-slate-800 border-slate-200"
    }`}>
      {status}
    </span>
  );
}

function PlaceholderChart({ type, data, range, productData }: { 
  type: "line" | "bar" | "area";
  data?: { date: string; revenue: number }[];
  range?: string;
  productData?: { productId: number; name: string; quantity: number }[];
}) {
  if (type === "line") {
    // Use actual data if provided, otherwise use sample data
    const chartData = data && data.length > 0 
      ? data.map(d => d.revenue)
      : [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45];
    
    const chartLabels = data && data.length > 0
      ? data.map(d => d.date)
      : [];
    
    const maxValue = Math.max(...chartData, 1); // Ensure at least 1 to avoid division by zero
    const width = 400;
    const height = 200;
    const padding = 20;
    
    // Create SVG path for the line
    const points = chartData.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (chartData.length - 1);
      const y = height - padding - ((value / maxValue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');
    
    // Create area path for gradient fill
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    // Format date for display
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (range === '7days' || range === '30days' || range === '60days') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else if (range === '6months') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        return `${date.toLocaleString('default', { month: 'short' })}`;
      }
    };

    return (
      <div className="h-56 w-full relative">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          className="overflow-visible"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - 2 * padding)) / 4}
              x2={width - padding}
              y2={padding + (i * (height - 2 * padding)) / 4}
              stroke="#e2e8f0"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
          
          {/* Area under the curve */}
          <polygon
            points={areaPoints}
            fill="url(#salesGradient)"
            className="opacity-60"
          />
          
          {/* Main line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {chartData.map((value, index) => {
            const x = padding + (index * (width - 2 * padding)) / (chartData.length - 1);
            const y = height - padding - ((value / maxValue) * (height - 2 * padding));
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="white"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="hover:r-6 transition-all duration-200 cursor-pointer drop-shadow-sm"
                />
                {/* Tooltip on hover - show revenue value */}
                <title>
                  {chartLabels[index] ? formatDate(chartLabels[index]) : ''}: Rs. {value.toFixed(2)}
                </title>
              </g>
            );
          })}
        </svg>
        
        {/* Chart labels */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-slate-500 px-4">
          {chartLabels.length > 0 ? (
            <>
              <span>{formatDate(chartLabels[0])}</span>
              {chartLabels.length > 2 && <span>{formatDate(chartLabels[Math.floor(chartLabels.length / 2)])}</span>}
              <span>{formatDate(chartLabels[chartLabels.length - 1])}</span>
            </>
          ) : (
            <>
              <span>Start</span>
              <span>Mid</span>
              <span>End</span>
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "bar") {
    // Use actual product data if provided, otherwise use sample data
    const colors = ["#0f172a", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];
    const products = productData && productData.length > 0 
      ? productData.map((p, idx) => ({
          id: `P${p.productId}`,
          name: p.name,
          orders: p.quantity,
          color: colors[idx % colors.length]
        }))
      : [
          { id: "P001", name: "Denim Jacket", orders: 142, color: "#0f172a" },
          { id: "P002", name: "Cotton T-Shirt", orders: 128, color: "#475569" },
          { id: "P003", name: "Leather Boots", orders: 98, color: "#64748b" },
          { id: "P004", name: "Wool Sweater", orders: 87, color: "#94a3b8" },
          { id: "P005", name: "Summer Dress", orders: 76, color: "#cbd5e1" }
        ];
    
    const maxValue = Math.max(...products.map(p => p.orders), 1); // Ensure at least 1
    const width = 400;
    const height = 250;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 80;
    const barWidth = 40;
    const barSpacing = 15;

    return (
      <div className="h-64 w-full relative">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          className="overflow-visible"
        >
          {/* Horizontal grid lines for order quantities */}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = paddingTop + (i * (height - paddingTop - paddingBottom)) / 5;
            const value = Math.round(maxValue - (i * maxValue) / 5);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* Y-axis labels (order counts) */}
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* Vertical bars */}
          {products.map((product, index) => {
            const barHeight = (product.orders / maxValue) * (height - paddingTop - paddingBottom);
            const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing;
            const y = height - paddingBottom - barHeight;
            
            return (
              <g key={product.id}>
                {/* Bar shadow */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={barWidth}
                  height={barHeight}
                  fill="rgba(0,0,0,0.1)"
                  rx="4"
                />
                
                {/* Main bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={product.color}
                  rx="4"
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <title>{product.name}: {product.orders} units sold</title>
                </rect>
                
                {/* Value label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-slate-600 font-medium"
                >
                  {product.orders}
                </text>
                
                {/* Product ID at bottom */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingBottom + 15}
                  textAnchor="middle"
                  className="text-xs fill-slate-700 font-medium"
                >
                  {product.id}
                </text>
                
                {/* Product name - each word on its own line */}
                {(() => {
                  const words = product.name.split(' ');
                  return (
                    <g>
                      {words.map((word, i) => (
                        <text
                          key={i}
                          x={x + barWidth / 2}
                          y={height - paddingBottom + 25 + i * 12}
                          textAnchor="middle"
                          className="text-xs fill-slate-500"
                          style={{ fontSize: '10px' }}
                        >
                          {word.length > 15 ? word.substring(0, 15) + '...' : word}
                        </text>
                      ))}
                    </g>
                  );
                })()}
              </g>
            );
          })}
          
          {/* Y-axis title */}
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="text-xs fill-gray-600 font-medium"
          >
            Number of Orders
          </text>
          
          {/* X-axis title */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-medium"
          >
            Products
          </text>
        </svg>
      </div>
    );
  }
  
  return (
    <div className="h-56 w-full rounded-md border bg-slate-50 grid place-items-center text-xs text-slate-500">
      <span>{type.toUpperCase()} CHART</span>
    </div>
  );
}
