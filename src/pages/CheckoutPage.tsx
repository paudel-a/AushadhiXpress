import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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

    if (!shippingAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Please select your delivery location on the map.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

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
          latitude,
          longitude,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Prescription-related error
        if (response.status === 403) {
          throw new Error(
            data?.message ||
              "An approved prescription is required to order this medicine.",
          );
        }

        throw new Error(data?.message || "Failed to place order");
      }

      clearCart();

      navigate("/order-confirmation", {
        state: {
          order: data,
        },
      });
    } catch (err) {
      console.error("Place order error:", err);

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
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order summary */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">
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
          <div className="order-1 lg:order-2 lg:col-span-2">
            <form
              onSubmit={handlePlaceOrder}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Location picker */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Delivery Location
                </label>

                <LocationPicker
                  onLocationSelect={({ lat, lng, address }) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setShippingAddress(address);
                  }}
                />
              </div>

              {/* Editable address */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Address (edit if needed)
                </label>

                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={2}
                  placeholder="Confirm or adjust your address..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
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

              {/* Payment */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 hover:border-emerald-400">
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

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 hover:border-emerald-400">
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

              {/* Submit */}
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
