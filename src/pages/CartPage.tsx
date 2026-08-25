import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <ShoppingBag size={48} className="mx-auto text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-slate-500">
            Browse medicines and add items to get started.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-100" />
              )}

              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">{item.name}</h2>
                <p className="text-sm text-emerald-600 font-bold">
                  Rs. {item.price}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="w-20 text-right font-semibold text-slate-900">
                Rs. {(Number(item.price) * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
                className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>Rs. {totalPrice.toFixed(2)}</span>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={clearCart}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Clear Cart
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CartPage;
