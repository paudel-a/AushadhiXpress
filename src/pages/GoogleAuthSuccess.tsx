import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (!token || !userParam) {
      navigate("/login?error=google");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error) {
      console.error("Google authentication error:", error);
      navigate("/login?error=google");
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">Signing you in...</p>
    </div>
  );
}

export default GoogleAuthSuccess;
