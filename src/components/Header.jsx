import { Menu, Bell, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-white">Stock Management System</h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">Control, track, and optimize your inventory seamlessly</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-2.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            <UserIcon className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-200">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
