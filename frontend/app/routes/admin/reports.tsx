import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-600 mt-1">View sales analytics and performance reports</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors">Export PDF</button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors">Export Excel</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <PlaceholderChart type="line" />
          </CardContent>
        </Card>
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <PlaceholderChart type="bar" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-100">
        <CardHeader>
          <CardTitle>Top-Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaceholderChart type="bar" />
        </CardContent>
      </Card>
    </div>
  );
}

function PlaceholderChart({ type }: { type: "line" | "bar" | "area" }) {
  return (
    <div className="h-56 w-full rounded-md border bg-gray-50 grid place-items-center text-xs text-gray-500">
      <span>{type.toUpperCase()} CHART</span>
    </div>
  );
}
