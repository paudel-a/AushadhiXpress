import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>

          <p className="mt-2 text-sm text-slate-600">
            Login to your AushadhiXpress account
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <a
              href="http://localhost:5000/api/auth/google"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.19Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.51A9.75 9.75 0 0 0 12 21.9Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.51 14c-.19-.58-.29-1.2-.29-1.84s.1-1.26.29-1.84V7.81H3.27A9.75 9.75 0 0 0 2.25 12c0 1.51.36 2.94 1.02 4.19L6.51 14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.12c1.43 0 2.72.49 3.74 1.46l2.8-2.8C16.84 3.22 14.63 2.1 12 2.1a9.75 9.75 0 0 0-8.73 5.71L6.51 10c.78-2.32 2.94-3.88 5.49-3.88Z"
                />
              </svg>
              Continue with Google
            </a>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-green-700 hover:text-green-800"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
