import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">Please sign in</h1>
          <p className="mt-2 text-slate-500">
            You need to be logged in to place an order.
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

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-slate-500">
            Add some items before checking out.
          </p>
          <button
            onClick={() => navigate("/medicines")}
            className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Browse Medicines
          </button>
        </div>
      </main>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shippingAddress.trim())
      return setError("Shipping address is required.");
    if (!phone.trim()) return setError("Phone number is required.");

    setPlacing(true);
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            medicineId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: shippingAddress.trim(),
          phone: phone.trim(),
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to place order");
      }

      const order = await response.json();
      clearCart();
      navigate("/order-confirmation", { state: { order } });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order summary */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold text-slate-900">
                <span>Total</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <form
              onSubmit={handlePlaceOrder}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
            >
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Shipping Address
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  placeholder="Street, city, landmark..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 cursor-pointer hover:border-emerald-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">
                      Cash on Delivery
                    </span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 cursor-pointer hover:border-emerald-400">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">
                      Online Payment
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {placing
                  ? "Placing Order..."
                  : `Place Order — Rs. ${totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
