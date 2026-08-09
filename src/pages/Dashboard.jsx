import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  History,
  Layers,
  Building2
} from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.get(`${baseUrl}/stock/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      subText: `${stats?.activeProducts || 0} active in catalog`,
      icon: Package,
      color: "from-blue-600/20 to-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      title: "Total Stock Qty",
      value: stats?.totalStockQuantity || 0,
      subText: "Across all warehouses",
      icon: Boxes,
      color: "from-emerald-600/20 to-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Stock Valuation",
      value: `₹${(stats?.totalStockValue || 0).toLocaleString("en-IN")}`,
      subText: "Total inventory cost value",
      icon: IndianRupee,
      color: "from-indigo-600/20 to-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Low Stock Alerts",
      value: stats?.lowStockCount || 0,
      subText: `${stats?.outOfStockCount || 0} out of stock`,
      icon: AlertTriangle,
      color: "from-amber-600/20 to-amber-500/10 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Inventory Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time stock monitoring, entries, movements, and analytics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/products/add"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/stock/in"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock In</span>
          </Link>
          <Link
            to="/stock/out"
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock Out</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 bg-gradient-to-br ${card.color} border rounded-2xl transition-all hover:scale-[1.02] shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">{card.title}</span>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-white tracking-tight">{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{card.subText}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Access Modules & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Shortcuts */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Stock Operations Quick Launch
            </h3>
            <span className="text-[11px] text-slate-400">22 Core Modules</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              to="/categories"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Categories</p>
              <p className="text-[10px] text-slate-400">{stats?.totalCategories || 0} active</p>
            </Link>

            <Link
              to="/warehouses"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Warehouses</p>
              <p className="text-[10px] text-slate-400">{stats?.totalWarehouses || 0} locations</p>
            </Link>

            <Link
              to="/stock/availability"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Stock Availability</p>
              <p className="text-[10px] text-slate-400">Live quantities</p>
            </Link>

            <Link
              to="/stock/purchase"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Purchase Entry</p>
              <p className="text-[10px] text-slate-400">Vendor receipts</p>
            </Link>

            <Link
              to="/stock/history"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                <History className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Movement Logs</p>
              <p className="text-[10px] text-slate-400">Complete audit</p>
            </Link>

            <Link
              to="/stock/low-alerts"
              className="p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">Low Stock Alerts</p>
              <p className="text-[10px] text-rose-400 font-medium">{stats?.lowStockCount || 0} items action required</p>
            </Link>
          </div>
        </div>

        {/* Quick Low Stock Warning Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Stock Health Notice
              </h3>
              <Link to="/stock/low-alerts" className="text-[11px] text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 mb-3">
              <p className="text-xs font-semibold text-amber-300">
                {stats?.lowStockCount || 0} Products Below Minimum Threshold
              </p>
              <p className="text-[11px] text-amber-400/80">
                Reorder incoming supplies soon to prevent stockout bottlenecks.
              </p>
            </div>
          </div>

          <Link
            to="/stock/low-alerts"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold text-center transition-all"
          >
            Manage Low Stock Items
          </Link>
        </div>
      </div>

      {/* Recent Movement Activity Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Recent Stock Movement Activity
          </h3>
          <Link to="/stock/history" className="text-[11px] text-blue-400 hover:underline">
            Full Audit History
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Warehouse</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3">Ref No</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {stats?.recentMovements && stats.recentMovements.length > 0 ? (
                stats.recentMovements.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.transactionType === "stock_in" || m.transactionType === "purchase"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : m.transactionType === "stock_out"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {m.transactionType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {m.product?.name || "N/A"} <span className="text-[10px] text-slate-400">({m.product?.sku})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{m.warehouse?.name || "General"}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{m.quantity}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{m.referenceNo || "-"}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">
                    No recent stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
