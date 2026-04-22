import { useState } from "react";
import { Navigate } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Input } from "../components/ui";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export function AuthPage() {
  const { isAuthenticated, login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top,#dff8f2,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-teal-700 backdrop-blur">
            <HeartHandshake className="h-4 w-4" />
            Minds Matter
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-[#009689] md:text-6xl">
              A calm digital support space for mental wellbeing.
            </h1>
            <p className="max-w-xl text-lg text-[#009689]">
              Access therapist-vetted resources, supportive community conversations, mood insights, and volunteer
              help requests from one secure platform.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Daily mood tracking", "Capture your emotional patterns with lightweight check-ins."],
              ["Guided support", "Book volunteers and continue conversations at your own pace."],
              ["Safe community", "Post publicly or anonymously and report harmful content."],
            ].map(([title, description]) => (
              <Card key={title} className="bg-white/80 backdrop-blur">
                <p className="font-semibold text-[#009689]">{title}</p>
                <p className="mt-2 text-sm text-white">{description}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-md p-6 md:p-8">
          <div className="mb-6 flex rounded-2xl bg-[#009689] p-1 dark:bg-white/5">
            {["login", "signup"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === item ? "bg-white text-[#009689] shadow-sm dark:bg-slate-900" : "text-[#009689]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "signup" ? (
              <>
                <Input
                  aria-label="Name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
                <select
                  aria-label="Role"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="user">Normal User</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </>
            ) : null}

            <Input
              aria-label="Email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <Input
              aria-label="Password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Demo admin account after seeding: <strong>ava@example.com</strong> / <strong>Password123!</strong>
          </p>
        </Card>
      </div>
    </div>
  );
}
