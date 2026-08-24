import { useAuth } from "../../context/AuthContext";
import CartIcon from "../CartIcon";
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-10 py-5">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold text-green-700">AushadhiXpress</h1>
      </div>

      {/* Navigation */}
      <ul className="flex items-center gap-8 font-medium text-gray-700">
        <li>
          <a href="/" className="transition hover:text-green-600">
            Home
          </a>
        </li>

        <li>
          <a href="/medicines" className="transition hover:text-green-600">
            Medicines
          </a>
        </li>

        <li>
          <a href="/categories" className="transition hover:text-green-600">
            Categories
          </a>
        </li>

        <li>
          <a href="/" className="transition hover:text-green-600">
            About
          </a>
        </li>
      </ul>
      <div className="flex items-right gap-4">
        <CartIcon />
      </div>
      {/* Authentication */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <a
            href="/profile"
            className="font-medium text-gray-700 transition hover:text-green-700"
          >
            Hi, Mr. {user?.name.split(" ").slice(-1)[0]}
          </a>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      ) : (
        <a
          href="/login"
          className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white transition hover:bg-green-700"
        >
          Sign In
        </a>
      )}
    </nav>
  );
}

export default Navbar;
