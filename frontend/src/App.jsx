import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { LoadingView } from "./components/ui";
import { useAuth } from "./context/AuthContext";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { CommunityPage } from "./pages/CommunityPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { SupportPage } from "./pages/SupportPage";
import { notificationsApi } from "./services/api";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingView />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function ProtectedApp() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mm_dark_mode") === "true");
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("mm_dark_mode", String(darkMode));
  }, [darkMode]);

  return (
    <AppShell
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      notifications={notificationsQuery.data || []}
    >
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProtectedApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
