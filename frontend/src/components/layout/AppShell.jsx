import { Bell, BookOpen, HeartHandshake, LayoutDashboard, LogOut, Menu, MessageSquareHeart, Moon, Shield, Sun } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button, Card } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/community", label: "Community", icon: MessageSquareHeart },
  { to: "/support", label: "Support", icon: HeartHandshake },
  { to: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function AppShell({ children, darkMode, setDarkMode, notifications = [] }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr]">
        <Card className="sticky top-4 hidden h-[calc(100vh-2rem)] flex-col justify-between lg:flex">
          <div className="space-y-6">
            <div>
              <Link to="/dashboard" className="text-xl font-bold text-teal-700 dark:text-teal-300">
                Minds Matter
              </Link>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Safe support, guided resources, and daily wellbeing tools.
              </p>
            </div>

            <nav className="space-y-2" aria-label="Primary navigation">
              {navItems
                .filter((item) => !item.adminOnly || user?.role === "admin")
                .map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-teal-600 text-white"
                          : "text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
            </nav>
          </div>

          <div className="space-y-3">
            <Card className="rounded-2xl bg-teal-50 p-4 dark:bg-teal-500/10">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 capitalize">{user?.role}</p>
            </Card>
            <Button variant="secondary" className="w-full" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200 lg:hidden">
                <Menu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-teal-600">Calm space</p>
                <h1 className="text-xl font-bold">
                  {location.pathname === "/dashboard"
                    ? "Your wellbeing overview"
                    : location.pathname.replace("/", "").replace(/^\w/, (char) => char.toUpperCase())}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle dark mode"
                onClick={() => setDarkMode((current) => !current)}
                className="rounded-2xl border border-slate-200 p-3 dark:border-white/10"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="relative rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
                  {notifications.filter((item) => !item.read).length}
                </span>
              </div>
            </div>
          </Card>

          <div className="lg:hidden">
            <Card className="overflow-x-auto">
              <div className="flex gap-2">
                {navItems
                  .filter((item) => !item.adminOnly || user?.role === "admin")
                  .map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "rounded-2xl px-4 py-2 text-sm font-medium whitespace-nowrap",
                          isActive ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-white/5"
                        )
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
              </div>
            </Card>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
