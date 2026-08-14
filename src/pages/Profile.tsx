import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Account</h1>

            <p className="mt-2 text-slate-600">
              Manage your AushadhiXpress account.
            </p>
          </div>

          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Mr. {user.name}
            </h2>

            <p className="mt-2 text-slate-600">{user.email}</p>

            <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {user.role}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              to="/my-orders"
              className="rounded-xl border border-slate-200 p-5 transition hover:border-green-600 hover:bg-green-50"
            >
              <h3 className="font-semibold text-slate-900">My Orders</h3>

              <p className="mt-1 text-sm text-slate-600">
                View your medicine orders.
              </p>
            </Link>

            <Link
              to="/prescriptions"
              className="rounded-xl border border-slate-200 p-5 transition hover:border-green-600 hover:bg-green-50"
            >
              <h3 className="font-semibold text-slate-900">Prescriptions</h3>

              <p className="mt-1 text-sm text-slate-600">
                Manage your prescriptions.
              </p>
            </Link>
          </div>

          <button
            onClick={logout}
            className="mt-8 rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
