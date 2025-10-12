import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { apiService } from "../../lib/api";

export default function AdminDashboard() {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState("");

  // Load customer count on component mount
  useEffect(() => {
    loadCustomerCount();
  }, []);

  const loadCustomerCount = async () => {
    try {
      setLoadingCustomers(true);
      setCustomerError("");
      const users = await apiService.getAllUsers();
      // Count users with CUSTOMER role
      const customers = users.filter(user => user.role === "CUSTOMER");
      setCustomerCount(customers.length);
    } catch (error: any) {
      console.error("Failed to load customer count:", error);
      setCustomerError("Failed to load");
      setCustomerCount(null);
    } finally {
      setLoadingCustomers(false);
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

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Total Sales" value="$12,480" sub="Today / This Month" accent="amber" />
        <Kpi title="Total Orders" value="324" sub="Today / This Month" accent="indigo" />
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
        <Kpi title="New Customers" value="47" sub="This week" accent="teal" />
        <Kpi title="Low Stock Alerts" value="8" sub="Items below threshold" accent="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Sales Trend</CardTitle>
            <p className="text-sm text-slate-600">Revenue over the last 12 months</p>
          </CardHeader>
          <CardContent>
            <PlaceholderChart type="line" />
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Top-Selling Products</CardTitle>
            <p className="text-sm text-slate-600">Best performing items this month</p>
          </CardHeader>
          <CardContent>
            <PlaceholderChart type="bar" />
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
                  {[
                    { id: "ORD-1001", customer: "John Smith", amount: 89.99, status: "Completed", date: "2 min ago" },
                    { id: "ORD-1002", customer: "Sarah Wilson", amount: 156.50, status: "Processing", date: "8 min ago" },
                    { id: "ORD-1003", customer: "Mike Johnson", amount: 234.00, status: "Shipped", date: "15 min ago" },
                    { id: "ORD-1004", customer: "Lisa Brown", amount: 67.25, status: "Completed", date: "32 min ago" },
                    { id: "ORD-1005", customer: "David Lee", amount: 178.90, status: "Processing", date: "1 hour ago" },
                    { id: "ORD-1006", customer: "Anna Davis", amount: 95.75, status: "Pending", date: "2 hours ago" }
                  ].map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="py-3 px-4">
                        <span className="font-medium text-sm text-slate-900">#{order.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-900">{order.customer}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-sm text-slate-900">${order.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-slate-500">{order.date}</span>
                      </td>
                    </tr>
                  ))}
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
  
  const accentColors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200", 
    teal: "bg-teal-50 text-teal-600 border-teal-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200"
  };
  
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
          <div className={`p-3 rounded-lg border ${accentColors[accent]}`}>
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-6 h-6 bg-current rounded-full opacity-20"></div>
            )}
          </div>
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

function PlaceholderChart({ type }: { type: "line" | "bar" | "area" }) {
  if (type === "line") {
    // Sample data points for the line chart
    const data = [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45];
    const maxValue = Math.max(...data);
    const width = 400;
    const height = 200;
    const padding = 20;
    
    // Create SVG path for the line
    const points = data.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - ((value / maxValue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');
    
    // Create area path for gradient fill
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

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
          {data.map((value, index) => {
            const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - ((value / maxValue) * (height - 2 * padding));
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#0f172a"
                strokeWidth="2"
                className="hover:r-6 transition-all duration-200 cursor-pointer drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Chart labels */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-slate-500 px-4">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </div>
    );
  }

  if (type === "bar") {
    // Sample data for top-selling products with product IDs
    const products = [
      { id: "P001", name: "Denim Jacket", orders: 142, color: "#0f172a" },
      { id: "P002", name: "Cotton T-Shirt", orders: 128, color: "#475569" },
      { id: "P003", name: "Leather Boots", orders: 98, color: "#64748b" },
      { id: "P004", name: "Wool Sweater", orders: 87, color: "#94a3b8" },
      { id: "P005", name: "Summer Dress", orders: 76, color: "#cbd5e1" }
    ];
    
    const maxValue = Math.max(...products.map(p => p.orders));
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
                />
                
                {/* Value label on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-slate-600 font-medium"
                >
                  {product.orders}
                </text>
                
                {/* Product ID and name at bottom */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingBottom + 15}
                  textAnchor="middle"
                  className="text-xs fill-slate-700 font-medium"
                >
                  {product.id}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - paddingBottom + 30}
                  textAnchor="middle"
                  className="text-xs fill-slate-500"
                >
                  {product.name.split(' ')[0]}
                </text>
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
