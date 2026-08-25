import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">No order found</h1>
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <CheckCircle size={56} className="mx-auto text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Order Placed!
        </h1>
        <p className="mt-2 text-slate-500">
          Order #{order.id} has been placed successfully.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">
                {item.medicine.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-900">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
            <span>Total</span>
            <span>Rs. {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/medicines")}
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Continue Shopping
        </button>
      </div>
    </main>
  );
}

export default OrderConfirmationPage;
