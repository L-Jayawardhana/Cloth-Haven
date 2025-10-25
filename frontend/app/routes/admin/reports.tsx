import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, DollarSign, ShoppingCart, Package, Users,
  Download, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { orderApi, productApi, type Order } from "~/lib/api";

interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  products: number;
}

interface CategorySales {
  name: string;
  sales: number;
  orders: number;
  [key: string]: string | number;
}

interface ProductSales {
  productName: string;
  sales: number;
  quantity: number;
  productId?: number;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAllOrders();
      setOrders(response);
    } catch (error) {
      console.error("Failed to fetch orders data:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
    return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
  });

  // Process orders data for analytics
  const processOrdersData = () => {
    // Group orders by date
    const dailySalesMap = new Map<string, DailySales>();
    const productSalesMap = new Map<number, ProductSales>();
    const categorySalesMap = new Map<string, CategorySales>();

    filteredOrders.forEach(order => {
      const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
      
      // Daily sales
      if (!dailySalesMap.has(dateKey)) {
        dailySalesMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          orders: 0,
          products: 0
        });
      }
      const dailySales = dailySalesMap.get(dateKey)!;
      dailySales.revenue += order.totalPrice;
      dailySales.orders += 1;
      dailySales.products += order.items.reduce((sum, item) => sum + item.quantity, 0);

      // Product sales
      order.items.forEach(item => {
        if (!productSalesMap.has(item.productId)) {
          productSalesMap.set(item.productId, {
            productName: item.productName || `Product ${item.productId}`,
            sales: 0,
            quantity: 0,
            productId: item.productId
          });
        }
        const productSales = productSalesMap.get(item.productId)!;
        productSales.sales += item.price * item.quantity;
        productSales.quantity += item.quantity;
      });
    });

    // Sample category data (you can enhance this by fetching actual product categories)
    const totalRevenue = Array.from(dailySalesMap.values()).reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = Array.from(dailySalesMap.values()).reduce((sum, day) => sum + day.orders, 0);
    
    categorySalesMap.set("Men's Wear", { 
      name: "Men's Wear", 
      sales: totalRevenue * 0.35, 
      orders: Math.floor(totalOrders * 0.35) 
    });
    categorySalesMap.set("Women's Wear", { 
      name: "Women's Wear", 
      sales: totalRevenue * 0.40, 
      orders: Math.floor(totalOrders * 0.40) 
    });
    categorySalesMap.set("Accessories", { 
      name: "Accessories", 
      sales: totalRevenue * 0.15, 
      orders: Math.floor(totalOrders * 0.15) 
    });
    categorySalesMap.set("Footwear", { 
      name: "Footwear", 
      sales: totalRevenue * 0.10, 
      orders: Math.floor(totalOrders * 0.10) 
    });

    return {
      dailySales: Array.from(dailySalesMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      topProducts: Array.from(productSalesMap.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5),
      categoryData: Array.from(categorySalesMap.values())
    };
  };

  const { dailySales, topProducts, categoryData } = processOrdersData();

  // Calculate summary metrics
  const calculateMetrics = () => {
    const totalRevenue = dailySales.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0);
    const totalProducts = dailySales.reduce((sum, day) => sum + day.products, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get unique customer count (simplified - count unique user IDs)
    const uniqueCustomers = new Set(filteredOrders.map(o => o.userId)).size;
    
    // Calculate growth percentages (comparing first half to second half)
    const midPoint = Math.floor(dailySales.length / 2);
    const firstHalf = dailySales.slice(0, midPoint);
    const secondHalf = dailySales.slice(midPoint);
    
    const firstHalfRevenue = firstHalf.reduce((sum, r) => sum + r.revenue, 0);
    const secondHalfRevenue = secondHalf.reduce((sum, r) => sum + r.revenue, 0);
    const revenueGrowth = firstHalfRevenue > 0 
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      uniqueCustomers,
      avgOrderValue,
      revenueGrowth
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const salesTrendData = dailySales.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: Math.round(day.revenue),
    orders: day.orders
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const exportToPDF = () => {
    alert("Export to PDF functionality will be implemented");
  };

  const exportToExcel = () => {
    // Create CSV content
    let csvContent = "Date,Revenue,Orders,Products Sold\n";
    dailySales.forEach(day => {
      csvContent += `${day.date},${day.revenue.toFixed(2)},${day.orders},${day.products}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading sales reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-600 mt-1">View sales analytics and performance reports</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 mr-4">
            <div className="flex flex-col">
              <label className="text-xs text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button 
            onClick={exportToPDF}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={exportToExcel}
            className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-indigo-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center mt-2 text-sm ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="ml-1">{Math.abs(metrics.revenueGrowth).toFixed(1)}%</span>
                </div>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalOrders.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-2">Avg: ${metrics.avgOrderValue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Products Sold</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalProducts.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-2">{dailySales.length} days</p>
              </div>
              <div className="rounded-full bg-pink-100 p-3">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Customers</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.uniqueCustomers.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-2">This period</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Sales Trend</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Daily sales performance over time</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
                name="Sales ($)"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category and Products Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Categories */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Top Categories</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Sales by category</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${category.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-500">{category.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Top-Selling Products</CardTitle>
            <p className="text-sm text-slate-600 mt-1">Best performers this period</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="productName" 
                  type="category" 
                  width={120}
                  stroke="#64748b"
                  style={{ fontSize: '11px' }}
                />
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-indigo-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{product.productName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">${product.sales.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{product.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Daily Sales Summary</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Detailed breakdown by date</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Products Sold</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.slice().reverse().slice(0, 10).map((day, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ${day.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">{day.orders}</td>
                    <td className="py-3 px-4 text-right text-slate-700">{day.products}</td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      ${(day.revenue / day.orders).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
