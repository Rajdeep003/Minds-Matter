import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mm_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        localStorage.removeItem("mm_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const data = await authApi.login(payload);
        localStorage.setItem("mm_token", data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}`);
      },
      async signup(payload) {
        const data = await authApi.signup(payload);
        localStorage.setItem("mm_token", data.token);
        setUser(data.user);
        toast.success("Account created successfully");
      },
      logout() {
        localStorage.removeItem("mm_token");
        setUser(null);
        toast.success("Logged out");
      },
      refresh() {
        return authApi.me().then((currentUser) => setUser(currentUser));
      },
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
