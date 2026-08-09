import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FileSpreadsheet, IndianRupee, Boxes, AlertTriangle, Layers } from "lucide-react";

export default function InventoryReports() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.get(`${baseUrl}/stock/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = products.reduce((acc, p) => acc + (p.currentStock || 0) * (p.purchasePrice || 0), 0);
  const totalItems = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          Inventory Summary & Valuation Reports
        </h1>
        <p className="text-xs text-slate-400 mt-1">Valuation insights, asset breakdown, and catalog stock health</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-indigo-600/20 to-indigo-500/10 border border-indigo-500/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Total Inventory Valuation</span>
            <IndianRupee className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">₹{totalValue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-400 mt-1">Based on purchase unit prices</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Total Units in Stock</span>
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalItems.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-400 mt-1">Across all product lines</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-600/20 to-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Low Stock Products</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{lowStockItems}</p>
          <p className="text-[11px] text-slate-400 mt-1">At or below safety limits</p>
        </div>
      </div>

      {/* Product Valuation Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4 text-blue-400" />
          Product Asset Valuation Breakdown
        </h3>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Available Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {products.map((p) => {
                  const val = (p.currentStock || 0) * (p.purchasePrice || 0);
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-blue-400">{p.sku}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{p.category?.name || "-"}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-200">
                        {p.currentStock} {p.unit?.shortName}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">₹{p.purchasePrice?.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                        ₹{val.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
