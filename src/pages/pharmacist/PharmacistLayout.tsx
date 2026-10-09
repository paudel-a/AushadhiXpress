import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PharmacistLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col bg-white p-5 shadow-sm md:min-h-screen md:w-64 md:border-r md:border-slate-200">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-700">AushadhiXpress</h1>
          <p className="mt-1 text-sm text-slate-500">Pharmacist Portal</p>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <NavLink
          to="/pharmacist/prescriptions"
          className={({ isActive }) =>
            `rounded-lg px-4 py-3 font-medium transition ${
              isActive
                ? "bg-green-50 text-green-700"
                : "text-slate-600 hover:bg-slate-50"
            }`
          }
        >
          Prescriptions
        </NavLink>

        <div className="mt-6 border-t border-slate-200 pt-5 md:mt-auto">
          <p className="mb-3 text-sm text-slate-600">Signed in as</p>
          <p className="mb-4 truncate font-semibold text-slate-900">
            {user?.name || "Pharmacist"}
          </p>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Prescription Management
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Review and manage customer prescriptions.
          </p>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
