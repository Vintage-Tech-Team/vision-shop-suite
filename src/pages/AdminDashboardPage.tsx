
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await adminApi.dashboard()).data.data as {
      totalSales: number;
      dailySales: number;
      monthlySales: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
      bestSellers: { name: string; totalSold: number; revenue: number }[];
      topCategories: { name: string; revenue: number }[];
      recentOrders: { orderNumber: string; total: number; orderStatus: string; user: { name: string } }[];
    },
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ["admin-revenue-chart"],
    queryFn: async () => (await adminApi.revenueChart(30)).data.data,
  });

  const revenueChart = {
    labels: chartData.map((d) => d._id),
    datasets: [
      {
        label: "Revenue",
        data: chartData.map((d) => d.revenue),
        borderColor: "#E31E24",
        backgroundColor: "rgba(227, 30, 36, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const ordersChart = {
    labels: chartData.map((d) => d._id),
    datasets: [
      {
        label: "Orders",
        data: chartData.map((d) => d.orders),
        backgroundColor: "#111111",
      },
    ],
  };

  const statCards = [
    { label: "Total Sales", value: formatPrice(stats?.totalSales ?? 0) },
    { label: "Monthly Sales", value: formatPrice(stats?.monthlySales ?? 0) },
    { label: "Daily Sales", value: formatPrice(stats?.dailySales ?? 0) },
    { label: "Orders", value: stats?.totalOrders ?? 0 },
    { label: "Customers", value: stats?.totalCustomers ?? 0 },
    { label: "Products", value: stats?.totalProducts ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Stitch Makers Analytics</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="border border-border p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-medium tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="border border-border p-6">
          <h2 className="font-display text-xl">Revenue (30 days)</h2>
          <div className="mt-4 h-64">
            <Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="border border-border p-6">
          <h2 className="font-display text-xl">Orders (30 days)</h2>
          <div className="mt-4 h-64">
            <Bar data={ordersChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="border border-border p-6">
          <h2 className="font-display text-xl">Best Selling Products</h2>
          <ul className="mt-4 space-y-3">
            {stats?.bestSellers?.slice(0, 5).map((p) => (
              <li key={p.name} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.totalSold} sold · {formatPrice(p.revenue)}</span>
              </li>
            )) ?? <li className="text-muted-foreground">No data yet</li>}
          </ul>
        </div>
        <div className="border border-border p-6">
          <h2 className="font-display text-xl">Top Categories</h2>
          <ul className="mt-4 space-y-3">
            {stats?.topCategories?.map((c) => (
              <li key={c.name} className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span>{formatPrice(c.revenue)}</span>
              </li>
            )) ?? <li className="text-muted-foreground">No data yet</li>}
          </ul>
        </div>
      </div>

      <div className="mt-10 border border-border p-6">
        <h2 className="font-display text-xl">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="pb-3">Order</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((o) => (
                <tr key={o.orderNumber} className="border-b border-border">
                  <td className="py-3">{o.orderNumber}</td>
                  <td className="py-3">{o.user?.name}</td>
                  <td className="py-3 capitalize">{o.orderStatus.replace(/_/g, " ")}</td>
                  <td className="py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
