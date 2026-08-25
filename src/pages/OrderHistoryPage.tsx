import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  medicine: {
    id: number;
    name: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  shippingAddress: string;
  phone: string;
  paymentMethod: "COD" | "ONLINE";
  createdAt: string;
  items: OrderItem[];
}

function getStatusStyle(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
  }
}

function OrderHistoryPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Please sign in</h1>
          <p className="mt-2 text-slate-500">
            Sign in to view your order history.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

        {loading && (
          <p className="text-center text-slate-500 py-10">Loading orders...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No orders yet
            </h2>
            <p className="mt-2 text-slate-500">
              Your placed orders will show up here.
            </p>
            <button
              onClick={() => navigate("/medicines")}
              className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Browse Medicines
            </button>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.medicine.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}{" "}
                  • {order.shippingAddress}
                </p>
                <p className="font-bold text-slate-900">
                  Rs. {order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default OrderHistoryPage;
