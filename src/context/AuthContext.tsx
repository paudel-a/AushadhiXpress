import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "PHARMACIST" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
