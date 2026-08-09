import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBoxes,
  FaRupeeSign,
  FaExclamationTriangle,
  FaArrowDown,
  FaArrowUp,
  FaPlusCircle,
  FaLayerGroup,
  FaWarehouse,
  FaChartLine,
  FaHistory,
  FaBoxOpen
} from "react-icons/fa";

const StatCard = ({ title, value, subText, icon: Icon, colorClass, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${
      onClick ? "cursor-pointer hover:border-blue-200" : ""
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subText}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Stock Management Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time inventory levels, stock movement entries, and alerts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/products/add"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <FaPlusCircle />
            <span>Add Product</span>
          </Link>
          <Link
            to="/stock/in"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <FaArrowDown />
            <span>Stock In</span>
          </Link>
          <Link
            to="/stock/out"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <FaArrowUp />
            <span>Stock Out</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subText={`${stats?.activeProducts || 0} active in catalog`}
          icon={FaBoxOpen}
          colorClass="bg-blue-50 text-blue-600"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Total Stock Qty"
          value={stats?.totalStockQuantity || 0}
          subText="Across all warehouses"
          icon={FaBoxes}
          colorClass="bg-emerald-50 text-emerald-600"
          onClick={() => navigate('/stock/availability')}
        />
        <StatCard
          title="Stock Valuation"
          value={`₹${(stats?.totalStockValue || 0).toLocaleString("en-IN")}`}
          subText="Total inventory cost value"
          icon={FaRupeeSign}
          colorClass="bg-indigo-50 text-indigo-600"
          onClick={() => navigate('/reports/inventory')}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount || 0}
          subText={`${stats?.outOfStockCount || 0} out of stock`}
          icon={FaExclamationTriangle}
          colorClass="bg-amber-50 text-amber-600"
          onClick={() => navigate('/stock/low-alerts')}
        />
      </div>

      {/* Quick Launch & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaLayerGroup className="text-blue-600" />
              Quick Launch Modules
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link
              to="/categories"
              className="p-4 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaLayerGroup className="text-lg text-blue-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Categories</p>
              <p className="text-xs text-gray-500">{stats?.totalCategories || 0} categories</p>
            </Link>

            <Link
              to="/warehouses"
              className="p-4 bg-gray-50 hover:bg-purple-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaWarehouse className="text-lg text-purple-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Warehouses</p>
              <p className="text-xs text-gray-500">{stats?.totalWarehouses || 0} locations</p>
            </Link>

            <Link
              to="/stock/availability"
              className="p-4 bg-gray-50 hover:bg-emerald-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaBoxes className="text-lg text-emerald-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Availability</p>
              <p className="text-xs text-gray-500">Live quantities</p>
            </Link>

            <Link
              to="/stock/purchase"
              className="p-4 bg-gray-50 hover:bg-indigo-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaChartLine className="text-lg text-indigo-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Purchase Entry</p>
              <p className="text-xs text-gray-500">Vendor receipts</p>
            </Link>

            <Link
              to="/stock/history"
              className="p-4 bg-gray-50 hover:bg-amber-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaHistory className="text-lg text-amber-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Movement Logs</p>
              <p className="text-xs text-gray-500">Audit trail</p>
            </Link>

            <Link
              to="/stock/low-alerts"
              className="p-4 bg-gray-50 hover:bg-rose-50/50 border border-gray-200/80 rounded-xl transition-all group text-left"
            >
              <FaExclamationTriangle className="text-lg text-rose-600 mb-2" />
              <p className="text-sm font-bold text-gray-800">Low Stock</p>
              <p className="text-xs text-rose-600 font-semibold">{stats?.lowStockCount || 0} items alert</p>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                Stock Health Notice
              </h3>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1 mb-3">
              <p className="text-sm font-bold text-amber-800">
                {stats?.lowStockCount || 0} Products Below Minimum Threshold
              </p>
              <p className="text-xs text-amber-700">
                Reorder incoming supplies soon to prevent stockout bottlenecks.
              </p>
            </div>
          </div>

          <Link
            to="/stock/low-alerts"
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold text-center transition-all"
          >
            Manage Low Stock Items
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            Recent Stock Movement Activity
          </h3>
          <Link to="/stock/history" className="text-xs font-semibold text-blue-600 hover:underline">
            View All History
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentMovements && stats.recentMovements.length > 0 ? (
                stats.recentMovements.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.transactionType === "stock_in" || m.transactionType === "purchase"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : m.transactionType === "stock_out"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {m.transactionType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {m.product?.name || "N/A"} <span className="text-[10px] text-gray-400">({m.product?.sku})</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{m.warehouse?.name || "General"}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">{m.quantity}</td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{m.referenceNo || "-"}</td>
                    <td className="py-3 px-4 text-right text-gray-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
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
