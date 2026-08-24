import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartIcon() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/cart")}
      className="relative rounded-md p-2 hover:bg-slate-100"
    >
      <ShoppingCart size={22} className="text-slate-700" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}

export default CartIcon;
