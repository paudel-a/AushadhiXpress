import { useEffect, useState } from "react";
import {
  RefreshCw,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
} from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface Medicine {
  id: number;
  name: string;
  price: number | string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  medicine: Medicine;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  paymentMethod: "COD" | "ONLINE";
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  user: Customer;
  items: OrderItem[];
}

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/orders/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);

      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? data.order : order,
        ),
      );
    } catch (err) {
      console.error("Update order status error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to update order status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Order Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer orders and update their status.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Package size={40} className="mx-auto text-slate-400" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No orders found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-emerald-600" />

                      <h2 className="font-semibold text-slate-900">
                        Order #{order.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="relative">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div className="p-5">
                  {/* Customer */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Customer
                      </h3>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          {order.user.name}
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail size={16} />
                          {order.user.email}
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          {order.phone}
                        </div>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Delivery
                      </h3>

                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="mt-0.5 shrink-0" />

                        <span>{order.shippingAddress}</span>
                      </div>

                      {order.latitude !== null && order.longitude !== null && (
                        <p className="mt-2 text-xs text-slate-400">
                          Location: {order.latitude.toFixed(5)},{" "}
                          {order.longitude.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Ordered Medicines
                    </h3>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {item.medicine.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Rs. {Number(item.price).toFixed(2)} ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-slate-900">
                            Rs.{" "}
                            {(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                      Payment:{" "}
                      <span className="font-medium text-slate-700">
                        {order.paymentMethod === "COD"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </span>
                    </div>

                    <div className="text-lg font-bold text-slate-900">
                      Total: Rs. {Number(order.totalAmount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminOrdersPage;
