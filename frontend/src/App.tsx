import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";
import type { User } from "./types";

type AuthMode = "login" | "register";

type AuthState = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: "client" | "vendor";
};

type UserRole = User["role"];

const tokenStorageKey = "house-market-token";

const rolePaths: Record<UserRole, string> = {
  admin: "/admin",
  vendor: "/vendor",
  client: "/client",
};

const roleScreens: Record<UserRole, {
  eyebrow: string;
  title: string;
  subtitle: string;
  accentClass: string;
  panelClass: string;
  highlights: Array<{ label: string; value: string }>;
  actions: string[];
}> = {
  admin: {
    eyebrow: "Platform Control",
    title: "Admin Command Center",
    subtitle: "Oversee user access, marketplace health, and operational priorities from one place.",
    accentClass: "from-slate-900 via-slate-800 to-emerald-700",
    panelClass: "bg-slate-900 text-white",
    highlights: [
      { label: "Access", value: "Full permissions" },
      { label: "Focus", value: "Users, listings, policy" },
      { label: "Priority", value: "Keep the platform stable" },
    ],
    actions: ["Review new vendor accounts", "Monitor marketplace activity", "Adjust platform settings"],
  },
  vendor: {
    eyebrow: "Sales Workspace",
    title: "Vendor Operations",
    subtitle: "Manage inventory, respond to demand, and keep listings performing.",
    accentClass: "from-emerald-700 via-emerald-600 to-amber-400",
    panelClass: "bg-emerald-600 text-white",
    highlights: [
      { label: "Access", value: "Vendor tools" },
      { label: "Focus", value: "Listings and conversions" },
      { label: "Priority", value: "Keep stock market-ready" },
    ],
    actions: ["Publish new listings", "Track buyer interest", "Update inventory status"],
  },
  client: {
    eyebrow: "Buyer Space",
    title: "Client Dashboard",
    subtitle: "Track saved properties, compare options, and move deals forward.",
    accentClass: "from-amber-400 via-orange-300 to-slate-900",
    panelClass: "bg-amber-100 text-amber-950",
    highlights: [
      { label: "Access", value: "Client tools" },
      { label: "Focus", value: "Saved homes and requests" },
      { label: "Priority", value: "Find the right match" },
    ],
    actions: ["Review saved listings", "Compare offers", "Send new inquiries"],
  },
};

function RoleDashboard({ user, onLogout }: { user: User; onLogout: () => Promise<void> }) {
  const screen = roleScreens[user.role];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8e8,_#f1f5f9_55%,_#dbe4f0)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className={`overflow-hidden rounded-[2rem] bg-gradient-to-br ${screen.accentClass} p-8 text-left shadow-2xl`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">{screen.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">{screen.title}</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">{screen.subtitle}</p>
            </div>

            <div className="rounded-[1.5rem] border border-white/20 bg-white/10 p-5 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Authenticated As</p>
              <p className="mt-3 text-2xl font-semibold">{user.name}</p>
              <p className="mt-1 text-sm text-white/75">{user.email}</p>
              <p className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/85">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {screen.highlights.map((item) => (
              <div key={item.label} className={`rounded-[1.5rem] p-5 shadow-lg ${screen.panelClass}`}>
                <p className="text-xs uppercase tracking-[0.25em] opacity-70">{item.label}</p>
                <p className="mt-4 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick Actions</p>
            <div className="mt-5 space-y-3">
              {screen.actions.map((action) => (
                <div key={action} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] bg-white p-6 text-left shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Current Route</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{rolePaths[user.role]}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Users now land on a dedicated screen based on their assigned role immediately after login. If they try to open another role screen directly, the app pushes them back to their own workspace.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-slate-900 p-6 text-left text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
            <p className="mt-4 text-2xl font-semibold">Authenticated</p>
            <p className="mt-2 text-sm text-slate-300">Token-backed access is active for this account.</p>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({
  mode,
  setMode,
  form,
  updateField,
  submitting,
  message,
  handleSubmit,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  form: AuthState;
  updateField: <K extends keyof AuthState>(field: K, value: AuthState[K]) => void;
  submitting: boolean;
  message: string;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">House Market</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{mode === "login" ? "Login" : "Create Account"}</h1>
          <p className="mt-2 text-slate-600">
            {mode === "login" ? "Access your account with email and password." : "Register as a client or vendor."}
          </p>
        </div>

        <div className="mt-4 flex justify-center gap-2 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"}`}
          >
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {mode === "register" && (
            <input
              className="w-full rounded-xl border border-slate-200 p-3"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          )}

          <input
            className="w-full rounded-xl border border-slate-200 p-3"
            placeholder="Email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <input
            className="w-full rounded-xl border border-slate-200 p-3"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />

          {mode === "register" && (
            <>
              <input
                className="w-full rounded-xl border border-slate-200 p-3"
                placeholder="Confirm password"
                type="password"
                value={form.passwordConfirmation}
                onChange={(event) => updateField("passwordConfirmation", event.target.value)}
              />

              <select
                className="w-full rounded-xl border border-slate-200 p-3"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value as "client" | "vendor")}
              >
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
              </select>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 p-3 font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>

          {message && <p className="text-center text-sm text-rose-600">{message}</p>}

          {mode === "login" && (
            <p className="text-center text-sm text-slate-500">
              Admin seed: admin@example.com / Admin123456
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function ProtectedRoleRoute({ user, role, onLogout }: { user: User | null; role: UserRole; onLogout: () => Promise<void> }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={rolePaths[user.role]} replace />;
  }

  return <RoleDashboard user={user} onLogout={onLogout} />;
}

function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<AuthState>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    role: "client",
  });

  useEffect(() => {
    const token = window.localStorage.getItem(tokenStorageKey);

    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    void api.get<User>("/user")
      .then((response) => setUser(response.data))
      .catch(() => {
        window.localStorage.removeItem(tokenStorageKey);
        delete api.defaults.headers.common.Authorization;
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof AuthState>(field: K, value: AuthState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      role: "client",
    });
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "register" && form.password !== form.passwordConfirmation) {
        setMessage("Passwords do not match.");
        return;
      }

      const payload = mode === "register"
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.passwordConfirmation,
            role: form.role,
          }
        : {
            email: form.email,
            password: form.password,
          };

      const endpoint = mode === "register" ? "/register" : "/login";
      const response = await api.post<{ access_token: string; user: User }>(endpoint, payload);

      window.localStorage.setItem(tokenStorageKey, response.data.access_token);
      api.defaults.headers.common.Authorization = `Bearer ${response.data.access_token}`;
      setUser(response.data.user);
      resetForm();
      navigate(rolePaths[response.data.user.role], { replace: true });
    } catch (error: unknown) {
      const backendErrors = isAxiosError(error) ? error.response?.data?.errors : undefined;

      if (backendErrors) {
        const firstError = Object.values(backendErrors).flat()[0];
        setMessage(typeof firstError === "string" ? firstError : "Authentication failed.");
      } else {
        setMessage(
          isAxiosError(error)
            ? error.response?.data?.message || "Authentication failed."
            : "Authentication failed."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } finally {
      window.localStorage.removeItem(tokenStorageKey);
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      setMode("login");
      resetForm();
      navigate("/", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to={rolePaths[user.role]} replace />} />
        <Route path="/admin" element={<ProtectedRoleRoute user={user} role="admin" onLogout={handleLogout} />} />
        <Route path="/vendor" element={<ProtectedRoleRoute user={user} role="vendor" onLogout={handleLogout} />} />
        <Route path="/client" element={<ProtectedRoleRoute user={user} role="client" onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to={rolePaths[user.role]} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <AuthScreen
            mode={mode}
            setMode={(nextMode) => {
              setMode(nextMode);
              setMessage("");
            }}
            form={form}
            updateField={updateField}
            submitting={submitting}
            message={message}
            handleSubmit={handleSubmit}
          />
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;