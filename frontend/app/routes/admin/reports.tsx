import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState, useEffect } from "react";
import { apiService, orderApi, productApi, categoryApi } from "../../lib/api";
import jsPDF from 'jspdf';

export default function AdminReportsPage() {
  type DateRange = '7days' | '30days' | '60days' | '6months' | '12months';
  
  // Revenue section state
  const [revenueRange, setRevenueRange] = useState<DateRange>('7days');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [revenueError, setRevenueError] = useState("");
  
  // Sales trend state
  const [selectedRange, setSelectedRange] = useState<DateRange>('7days');
  const [salesTrendData, setSalesTrendData] = useState<{ date: string; revenue: number }[]>([]);
  const [loadingSalesTrend, setLoadingSalesTrend] = useState(true);
  const [salesTrendError, setSalesTrendError] = useState("");

  // Top categories state
  const [selectedCategoryRange, setSelectedCategoryRange] = useState<DateRange>('7days');
  const [topCategories, setTopCategories] = useState<{ categoryId: number; name: string; quantity: number }[]>([]);
  const [loadingTopCategories, setLoadingTopCategories] = useState(true);
  const [topCategoriesError, setTopCategoriesError] = useState("");

  // Top-selling products state
  const [selectedProductRange, setSelectedProductRange] = useState<DateRange>('7days');
  const [topProducts, setTopProducts] = useState<{ productId: number; name: string; quantity: number }[]>([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [topProductsError, setTopProductsError] = useState("");

  // Store all orders for export
  const [allOrdersData, setAllOrdersData] = useState<any[]>([]);

  useEffect(() => {
    loadCategoriesAndProducts();
    loadRevenueData();
    loadSalesTrend();
    loadTopCategories();
    loadTopProducts();
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [revenueRange, selectedCategory, selectedProduct]);

  useEffect(() => {
    loadSalesTrend();
  }, [selectedRange]);

  useEffect(() => {
    loadTopCategories();
  }, [selectedCategoryRange]);

  useEffect(() => {
    loadTopProducts();
  }, [selectedProductRange]);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allProducts.filter(p => p.categoryId === parseInt(selectedCategory));
      setFilteredProducts(filtered);
      setSelectedProduct(''); // Reset product selection when category changes
    } else {
      setFilteredProducts(allProducts);
    }
  }, [selectedCategory, allProducts]);

  const loadCategoriesAndProducts = async () => {
    try {
      const [categories, products] = await Promise.all([
        categoryApi.getAllCategories(),
        productApi.getAllProducts()
      ]);
      setAllCategories(categories || []);
      setAllProducts(products || []);
      setFilteredProducts(products || []);
    } catch (error: any) {
      console.error("Failed to load categories and products", error);
    }
  };

  const loadRevenueData = async () => {
    try {
      setLoadingRevenue(true);
      setRevenueError("");
      
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      
      const now = new Date();
      const startDate = getDateRange(revenueRange);
      
      // CRITICAL: Filter orders by date range and EXCLUDE CANCELLED orders
      let filteredOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        // Must exclude cancelled orders in ALL cases
        return orderDate >= startDate && orderDate <= now && o.status !== 'CANCELLED';
      });
      
      // If category or product is selected, filter further
      if (selectedCategory || selectedProduct) {
        const filteredByProduct = [];
        for (const order of filteredOrders) {
          // Double-check: Only process non-cancelled orders
          if (order.status === 'CANCELLED') {
            continue; // Skip cancelled orders
          }
          
          try {
            const orderDetails = await orderApi.getOrderById(order.orderId);
            // Triple-check: Verify order details status as well
            if (orderDetails.status === 'CANCELLED') {
              continue; // Skip if order details show cancelled
            }
            
            if (orderDetails.items) {
              let totalItemsInOrder = 0;
              let matchingItemsQuantity = 0;
              let hasMatchingItem = false;
              
              // First pass: count all items and matching items
              for (const item of orderDetails.items) {
                totalItemsInOrder += (item.quantity || 0);
                
                try {
                  const product = await productApi.getProductById(item.productId);
                  
                  // Check if item matches filter criteria
                  const categoryMatch = !selectedCategory || product.categoryId === parseInt(selectedCategory);
                  const productMatch = !selectedProduct || item.productId === parseInt(selectedProduct);
                  
                  if (categoryMatch && productMatch) {
                    hasMatchingItem = true;
                    matchingItemsQuantity += (item.quantity || 0);
                  }
                } catch {
                  // If we can't get product details, skip this item
                }
              }
              
              if (hasMatchingItem && totalItemsInOrder > 0) {
                // Calculate proportional revenue based on quantity of matching items
                // This ensures we use the actual order total (which may include discounts/taxes)
                const proportionalRevenue = (order.totalPrice || 0) * (matchingItemsQuantity / totalItemsInOrder);
                
                filteredByProduct.push({
                  ...order,
                  totalPrice: proportionalRevenue
                });
              }
            }
          } catch {}
        }
        filteredOrders = filteredByProduct;
      }
      
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setRevenueData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
      });
    } catch (error: any) {
      setRevenueError("Failed to load revenue data");
      setRevenueData({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
    } finally {
      setLoadingRevenue(false);
    }
  };

  const loadSalesTrend = async () => {
    try {
      setLoadingSalesTrend(true);
      setSalesTrendError("");
      
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders.map(o => ({ ...o, customerName: u.username, customerEmail: u.email })));
        } catch {}
      }
      
      // Store all orders for export
      setAllOrdersData(allOrders);
      
      const now = new Date();
      // Set to end of today to include full day
      now.setHours(23, 59, 59, 999);
      
      let startDate: Date;
      let groupBy: 'day' | 'week' | 'month';
      let numPeriods: number;
      
      switch (selectedRange) {
        case '7days':
          startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'day';
          numPeriods = 7;
          break;
        case '30days':
          startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'day';
          numPeriods = 30;
          break;
        case '60days':
          startDate = new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'day';
          numPeriods = 60;
          break;
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'week';
          numPeriods = 26;
          break;
        case '12months':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'month';
          numPeriods = 12;
          break;
      }
      
      // Filter orders within the date range (exclude cancelled orders from revenue)
      const filteredOrders = allOrders.filter(o => {
        if (o.status === 'CANCELLED') return false;
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= now;
      });
      
      const revenueMap = new Map<string, number>();
      
      if (groupBy === 'day') {
        for (let i = 0; i < numPeriods; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const key = date.toISOString().split('T')[0];
          revenueMap.set(key, 0);
        }
      } else if (groupBy === 'week') {
        for (let i = 0; i < numPeriods; i++) {
          const date = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const key = weekStart.toISOString().split('T')[0];
          revenueMap.set(key, 0);
        }
      } else {
        for (let i = 0; i < numPeriods; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueMap.set(key, 0);
        }
      }
      
      filteredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        let key: string;
        
        if (groupBy === 'day') {
          key = orderDate.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        }
        
        // Add revenue even if key doesn't exist in map (for edge cases)
        const currentRevenue = revenueMap.get(key) || 0;
        revenueMap.set(key, currentRevenue + (order.totalPrice || 0));
      });
      
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

  const loadTopCategories = async () => {
    try {
      setLoadingTopCategories(true);
      setTopCategoriesError("");
      
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      
      const now = new Date();
      let startDate: Date;
      
      switch (selectedCategoryRange) {
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
      
      const filteredOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= now;
      });
      
      const categoryQuantityMap = new Map<number, number>();
      
      for (const order of filteredOrders) {
        try {
          const orderDetails = await orderApi.getOrderById(order.orderId);
          if (orderDetails.items) {
            for (const item of orderDetails.items) {
              try {
                const product = await productApi.getProductById(item.productId);
                if (product.categoryId) {
                  const currentQty = categoryQuantityMap.get(product.categoryId) || 0;
                  categoryQuantityMap.set(product.categoryId, currentQty + (item.quantity || 0));
                }
              } catch {}
            }
          }
        } catch {}
      }
      
      const categoryStats = Array.from(categoryQuantityMap.entries())
        .map(([categoryId, quantity]) => ({ categoryId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
      const categoriesWithNames = await Promise.all(
        categoryStats.map(async (c) => {
          try {
            const categories = await categoryApi.getAllCategories();
            const category = categories.find((cat: any) => cat.categoryId === c.categoryId);
            return { ...c, name: category?.categoryName || `Category #${c.categoryId}` };
          } catch {
            return { ...c, name: `Category #${c.categoryId}` };
          }
        })
      );
      
      setTopCategories(categoriesWithNames);
    } catch (error: any) {
      setTopCategoriesError("Failed to load top categories");
      setTopCategories([]);
    } finally {
      setLoadingTopCategories(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      setLoadingTopProducts(true);
      setTopProductsError("");
      
      const users = await apiService.getAllUsers();
      let allOrders = [];
      for (const u of users) {
        try {
          const userOrders = await orderApi.getUserOrders(u.userId);
          allOrders.push(...userOrders);
        } catch {}
      }
      
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
      
      const filteredOrders = allOrders.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= now;
      });
      
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
      
      const productStats = Array.from(productQuantityMap.entries())
        .map(([productId, quantity]) => ({ productId, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      
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

  // Helper function to get date range
  const getDateRange = (range: DateRange): Date => {
    const now = new Date();
    switch (range) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '60days':
        return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      case '6months':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '12months':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  };

  // Helper function to format date range label
  const getDateRangeLabel = (range: DateRange): string => {
    switch (range) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '60days': return 'Last 60 Days';
      case '6months': return 'Last 6 Months';
      case '12months': return 'Last 12 Months';
    }
  };

  // Export to CSV function
  const downloadCSV = async () => {
    try {
      // Collect all data based on selected ranges
      const now = new Date();
      
      // Filter orders for sales trend
      const salesStartDate = getDateRange(selectedRange);
      const salesOrders = allOrdersData.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= salesStartDate && orderDate <= now;
      });

      // Get detailed order information
      const detailedOrders = [];
      for (const order of salesOrders) {
        try {
          const orderDetails = await orderApi.getOrderById(order.orderId);
          detailedOrders.push({
            ...order,
            items: orderDetails.items || []
          });
        } catch {
          detailedOrders.push({
            ...order,
            items: []
          });
        }
      }

      // Create CSV content
      let csvContent = "Sales Report - Generated on " + new Date().toLocaleString() + "\n\n";
      
      // Sales Summary
      csvContent += "SALES SUMMARY (" + getDateRangeLabel(selectedRange) + ")\n";
      csvContent += "Date,Revenue\n";
      salesTrendData.forEach(item => {
        csvContent += `${item.date},Rs. ${item.revenue.toFixed(2)}\n`;
      });
      csvContent += `\nTotal Revenue,Rs. ${salesTrendData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}\n`;
      csvContent += `Total Orders,${salesOrders.length}\n\n`;

      // Top Categories
      csvContent += "TOP CATEGORIES (" + getDateRangeLabel(selectedCategoryRange) + ")\n";
      csvContent += "Category ID,Category Name,Quantity Sold\n";
      topCategories.forEach(cat => {
        csvContent += `${cat.categoryId},${cat.name},${cat.quantity}\n`;
      });
      csvContent += "\n";

      // Top Products
      csvContent += "TOP SELLING PRODUCTS (" + getDateRangeLabel(selectedProductRange) + ")\n";
      csvContent += "Product ID,Product Name,Quantity Sold\n";
      topProducts.forEach(prod => {
        csvContent += `${prod.productId},${prod.name},${prod.quantity}\n`;
      });
      csvContent += "\n";

      // Detailed Orders
      csvContent += "DETAILED ORDERS (" + getDateRangeLabel(selectedRange) + ")\n";
      csvContent += "Order ID,Customer Name,Customer Email,Order Date,Status,Total Price,Items\n";
      detailedOrders.forEach(order => {
        const itemsList = order.items.map((item: any) => 
          `${item.productName || 'Product #' + item.productId} (Qty: ${item.quantity})`
        ).join('; ');
        csvContent += `${order.orderId},${order.customerName || 'N/A'},${order.customerEmail || 'N/A'},${new Date(order.orderDate).toLocaleString()},${order.status},Rs. ${order.totalPrice?.toFixed(2) || '0.00'},"${itemsList}"\n`;
      });

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV report');
    }
  };

  // Export to PDF function
  const downloadPDF = async () => {
    try {
      // Collect all data based on selected ranges
      const now = new Date();
      const salesStartDate = getDateRange(selectedRange);
      const salesOrders = allOrdersData.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= salesStartDate && orderDate <= now;
      });
      const detailedOrders = [];
      for (const order of salesOrders) {
        try {
          const orderDetails = await orderApi.getOrderById(order.orderId);
          detailedOrders.push({
            ...order,
            items: orderDetails.items || []
          });
        } catch {
          detailedOrders.push({
            ...order,
            items: []
          });
        }
      }
      // Create PDF content
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(18);
      doc.text('Sales Report', 10, y);
      y += 10;
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`Total Revenue: Rs. ${salesTrendData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}`, 10, y);
      y += 7;
      doc.text(`Total Orders: ${salesOrders.length}`, 10, y);
      y += 7;
      doc.text(`Period: ${getDateRangeLabel(selectedRange)}`, 10, y);
      y += 10;
      doc.setFontSize(14);
      doc.text('Sales Trend', 10, y);
      y += 7;
      doc.setFontSize(10);
      salesTrendData.forEach(item => {
        doc.text(`${item.date}: Rs. ${item.revenue.toFixed(2)}`, 10, y);
        y += 5;
      });
      y += 7;
      doc.setFontSize(14);
      doc.text('Top Categories', 10, y);
      y += 7;
      doc.setFontSize(10);
      topCategories.forEach(cat => {
        doc.text(`${cat.categoryId} - ${cat.name}: ${cat.quantity}`, 10, y);
        y += 5;
      });
      y += 7;
      doc.setFontSize(14);
      doc.text('Top Selling Products', 10, y);
      y += 7;
      doc.setFontSize(10);
      topProducts.forEach(prod => {
        doc.text(`${prod.productId} - ${prod.name}: ${prod.quantity}`, 10, y);
        y += 5;
      });
      y += 7;
      doc.setFontSize(14);
      doc.text('Detailed Orders', 10, y);
      y += 7;
      doc.setFontSize(8);
      detailedOrders.forEach(order => {
        doc.text(`Order #${order.orderId} | ${order.customerName || 'N/A'} | ${order.status} | Rs. ${order.totalPrice?.toFixed(2) || '0.00'}`, 10, y);
        y += 4;
        order.items.forEach((item: any) => {
          doc.text(`- ${item.productName || 'Product #' + item.productId} (Qty: ${item.quantity})`, 12, y);
          y += 3;
        });
        y += 2;
        if (y > 280) { doc.addPage(); y = 10; }
      });
      doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-600 mt-1">View sales analytics and performance reports</p>
        </div>
        <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-2 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 px-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
          </div>
      </div>

      {/* Revenue Section with Filters */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Revenue Overview</CardTitle>
          <p className="text-sm text-slate-600 mt-1">Filter revenue by date range, category, and product</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={revenueRange}
                onChange={(e) => setRevenueRange(e.target.value as DateRange)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="60days">Last 60 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                {allCategories.map((cat: any) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!selectedCategory && filteredProducts.length === allProducts.length}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedCategory ? 'All Products in Category' : 'All Products'}
                </option>
                {filteredProducts.map((prod: any) => (
                  <option key={prod.productId} value={prod.productId}>
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Revenue Stats */}
          {loadingRevenue ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : revenueError ? (
            <div className="text-center py-8 text-rose-500">{revenueError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      Rs. {revenueData.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {getDateRangeLabel(revenueRange)}
                      {selectedCategory && ` • ${allCategories.find(c => c.categoryId === parseInt(selectedCategory))?.categoryName}`}
                      {selectedProduct && ` • ${filteredProducts.find(p => p.productId === parseInt(selectedProduct))?.name}`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Orders</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {revenueData.totalOrders}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {getDateRangeLabel(revenueRange)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Order Value</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      Rs. {revenueData.averageOrderValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {getDateRangeLabel(revenueRange)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {(selectedCategory || selectedProduct) && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedProduct('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Sales Trend</CardTitle>
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
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
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
              <SalesTrendChart data={salesTrendData} range={selectedRange} />
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Top Categories</CardTitle>
                <p className="text-sm text-slate-600">
                  By quantity for {
                    selectedCategoryRange === '7days' ? 'last 7 days' :
                    selectedCategoryRange === '30days' ? 'last 30 days' :
                    selectedCategoryRange === '60days' ? 'last 60 days' :
                    selectedCategoryRange === '6months' ? 'last 6 months' :
                    'last 12 months'
                  }
                </p>
              </div>
            </div>
            <select
              value={selectedCategoryRange}
              onChange={(e) => setSelectedCategoryRange(e.target.value as DateRange)}
              className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="60days">Last 60 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </CardHeader>
          <CardContent>
            {loadingTopCategories ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                Loading categories...
              </div>
            ) : topCategoriesError ? (
              <div className="h-64 flex items-center justify-center text-rose-500">
                {topCategoriesError}
              </div>
            ) : topCategories.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No category data available
              </div>
            ) : (
              <TopCategoriesChart data={topCategories} />
            )}
          </CardContent>
        </Card>
      </div>

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
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
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
            <TopProductsChart data={topProducts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalesTrendChart({ data, range }: { data: { date: string; revenue: number }[]; range: string }) {
  const chartData = data.map(d => d.revenue);
  const chartLabels = data.map(d => d.date);
  
  const maxValue = Math.max(...chartData, 1);
  const width = 400;
  const height = 200;
  const padding = 20;
  
  // Handle case when there's only one data point
  const divisor = chartData.length > 1 ? chartData.length - 1 : 1;
  
  const points = chartData.map((value, index) => {
    const x = padding + (index * (width - 2 * padding)) / divisor;
    const y = height - padding - ((value / maxValue) * (height - 2 * padding));
    return `${x},${y}`;
  }).join(' ');
  
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

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
        
        <polygon
          points={areaPoints}
          fill="url(#salesGradient)"
          className="opacity-60"
        />
        
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
        
        {chartData.map((value, index) => {
          const x = padding + (index * (width - 2 * padding)) / divisor;
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
              <title>
                {formatDate(chartLabels[index])}: Rs. {value.toFixed(2)}
              </title>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-slate-500 px-4">
        <span>{formatDate(chartLabels[0])}</span>
        {chartLabels.length > 2 && <span>{formatDate(chartLabels[Math.floor(chartLabels.length / 2)])}</span>}
        <span>{formatDate(chartLabels[chartLabels.length - 1])}</span>
      </div>
    </div>
  );
}

function TopCategoriesChart({ data }: { data: { categoryId: number; name: string; quantity: number }[] }) {
  const colors = ["#0f172a", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];
  const categories = data.map((c, idx) => ({
    id: `C${c.categoryId}`,
    name: c.name,
    quantity: c.quantity,
    color: colors[idx % colors.length]
  }));
  
  const maxValue = Math.max(...categories.map(c => c.quantity), 1);
  const width = 300;
  const height = 250;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 80;
  const barWidth = 35;
  const barSpacing = 10;

  return (
    <div className="h-64 w-full relative">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        className="overflow-visible"
      >
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
        
        {categories.map((category, index) => {
          const barHeight = (category.quantity / maxValue) * (height - paddingTop - paddingBottom);
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing;
          const y = height - paddingBottom - barHeight;
          
          return (
            <g key={category.id}>
              <rect
                x={x + 2}
                y={y + 2}
                width={barWidth}
                height={barHeight}
                fill="rgba(0,0,0,0.1)"
                rx="4"
              />
              
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={category.color}
                rx="4"
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              >
                <title>{category.name}: {category.quantity} units sold</title>
              </rect>
              
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-slate-600 font-medium"
              >
                {category.quantity}
              </text>
              
              <text
                x={x + barWidth / 2}
                y={height - paddingBottom + 15}
                textAnchor="middle"
                className="text-xs fill-slate-700 font-medium"
              >
                {category.id}
              </text>
              
              {(() => {
                const words = category.name.split(' ');
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
                        {word.length > 12 ? word.substring(0, 12) + '...' : word}
                      </text>
                    ))}
                  </g>
                );
              })()}
            </g>
          );
        })}
        
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-xs fill-gray-600 font-medium"
        >
          Quantity Sold
        </text>
        
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-medium"
        >
          Categories
        </text>
      </svg>
    </div>
  );
}

function TopProductsChart({ data }: { data: { productId: number; name: string; quantity: number }[] }) {
  const colors = ["#0f172a", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];
  const products = data.map((p, idx) => ({
    id: `P${p.productId}`,
    name: p.name,
    orders: p.quantity,
    color: colors[idx % colors.length]
  }));
  
  const maxValue = Math.max(...products.map(p => p.orders), 1);
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
        
        {products.map((product, index) => {
          const barHeight = (product.orders / maxValue) * (height - paddingTop - paddingBottom);
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing;
          const y = height - paddingBottom - barHeight;
          
          return (
            <g key={product.id}>
              <rect
                x={x + 2}
                y={y + 2}
                width={barWidth}
                height={barHeight}
                fill="rgba(0,0,0,0.1)"
                rx="4"
              />
              
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={product.color}
                rx="4"
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              >
                <title>{product.name}: {product.orders} units sold</title>
              </rect>
              
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-slate-600 font-medium"
              >
                {product.orders}
              </text>
              
              <text
                x={x + barWidth / 2}
                y={height - paddingBottom + 15}
                textAnchor="middle"
                className="text-xs fill-slate-700 font-medium"
              >
                {product.id}
              </text>
              
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
        
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-xs fill-gray-600 font-medium"
        >
          Number of Orders
        </text>
        
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
