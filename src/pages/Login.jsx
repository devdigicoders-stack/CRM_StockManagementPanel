import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { FaBoxes, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";

export default function Login() {
  const { setLoginData } = useAuth();
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.post(`${baseUrl}/auth/login`, {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.data.status === "success") {
        const loggedInUser = res.data.data.user;
        const token = res.data.token;

        const allowed = ["stock", "superAdmin", "admin"];
        if (!allowed.includes(loggedInUser?.role)) {
          toast.error("Access denied! Only Stock Managers or Admins can access this panel.");
          setLoading(false);
          return;
        }

        setLoginData({ user: loggedInUser, token });
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: themeColors?.background || "#f8fafc",
        fontFamily: currentFont?.family || "inherit",
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-xl border"
        style={{
          backgroundColor: themeColors?.surface || "#ffffff",
          borderColor: themeColors?.border || "#e2e8f0",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-4"
            style={{ backgroundColor: themeColors?.primary || "#2563eb" }}
          >
            <FaBoxes className="w-7 h-7" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: themeColors?.primary || "#1e293b" }}
          >
            Stock Management Panel
          </h1>
          <p
            className="text-xs"
            style={{ color: themeColors?.textSecondary || "#64748b" }}
          >
            Sign in with your Stock Manager credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: themeColors?.text || "#334155" }}
            >
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="stock@crm.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: themeColors?.background || "#f8fafc",
                  color: themeColors?.text || "#1e293b",
                  borderColor: themeColors?.border || "#cbd5e1",
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: themeColors?.text || "#334155" }}
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: themeColors?.background || "#f8fafc",
                  color: themeColors?.text || "#1e293b",
                  borderColor: themeColors?.border || "#cbd5e1",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: themeColors?.primary || "#2563eb",
              color: themeColors?.onPrimary || "#ffffff",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In to Panel"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-600">
            <FaShieldAlt className="w-3.5 h-3.5" />
            <span>Accounts are provisioned by SuperAdmin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
