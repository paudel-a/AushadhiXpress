import CartIcon from "./CartIcon";
import { useState } from "react";

function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <h1 className="text-lg font-bold text-slate-900">AushadhiXpress</h1>

      <nav className="flex items-center gap-4">
        {/* other nav links */}
        <CartIcon onClick={() => setCartOpen(true)} />
      </nav>

      {/* cartOpen would control a cart drawer/modal — not built yet */}
    </header>
  );
}

export default Navbar;
