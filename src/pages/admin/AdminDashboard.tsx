import { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Users,
  Pill,
  FileText,
  RefreshCw,
} from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface RecentOrder {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardData {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalMedicines: number;
  pendingPrescriptions: number;
  recentOrders: RecentOrder[];
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch dashboard");
      }

      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
            {error || "Unable to load dashboard."}

            <button
              onClick={fetchDashboard}
              className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stats = [
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: Package,
      iconStyle: "bg-slate-100 text-slate-600",
    },
    {
      title: "Pending Orders",
      value: data.pendingOrders,
      icon: Clock,
      iconStyle: "bg-amber-100 text-amber-600",
    },
    {
      title: "Confirmed Orders",
      value: data.confirmedOrders,
      icon: CheckCircle,
      iconStyle: "bg-blue-100 text-blue-600",
    },
    {
      title: "Delivered Orders",
      value: data.deliveredOrders,
      icon: Truck,
      iconStyle: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Cancelled Orders",
      value: data.cancelledOrders,
      icon: XCircle,
      iconStyle: "bg-red-100 text-red-600",
    },
    {
      title: "Customers",
      value: data.totalCustomers,
      icon: Users,
      iconStyle: "bg-purple-100 text-purple-600",
    },
    {
      title: "Medicines",
      value: data.totalMedicines,
      icon: Pill,
      iconStyle: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Pending Prescriptions",
      value: data.pendingPrescriptions,
      icon: FileText,
      iconStyle: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your pharmacy operations.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Orders</h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest customer orders
              </p>
            </div>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No orders yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Order #{order.id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {order.user.name} · {order.user.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>

                    <span className="font-semibold text-slate-900">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
