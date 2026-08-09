import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import { Toaster } from "sonner";
import { sidebarNavigation, nonSidebarRoutes } from "./route/SidebarRoute";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-xs font-medium text-slate-400">Loading Stock Management System...</p>
    </div>
  </div>
);

function App() {
  const { isLoggedIn, loading, user, logout } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Force logout if user is not authorized for Stock panel
  if (!loading && user && !["stock", "superAdmin", "admin"].includes(user.role)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  const allRoutes = [
    ...sidebarNavigation.flatMap((group) => group.items),
    ...nonSidebarRoutes,
  ];

  return (
    <Router>
      <Toaster position="top-right" theme="dark" richColors />
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected Stock Routes */}
        {isLoggedIn ? (
          <Route element={<DashboardLayout />}>
            {allRoutes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
