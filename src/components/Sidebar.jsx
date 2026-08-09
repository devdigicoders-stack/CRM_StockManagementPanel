import { NavLink } from "react-router-dom";
import { sidebarNavigation } from "../route/SidebarRoute";
import { PackageSearch, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base">Stock Matrix</h1>
            <p className="text-[11px] text-blue-400 font-medium">Inventory & Warehousing</p>
          </div>
        </div>
      </div>

      {/* User Info Pill */}
      <div className="p-3 mx-3 my-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
          {user?.name?.charAt(0).toUpperCase() || "S"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.name || "Stock Manager"}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span className="capitalize">{user?.role || "Stock Manager"}</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {sidebarNavigation.map((group, groupIdx) => (
          <div key={groupIdx}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen && setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 border border-blue-500/50"
                          : "hover:bg-slate-800/80 hover:text-white text-slate-300"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
