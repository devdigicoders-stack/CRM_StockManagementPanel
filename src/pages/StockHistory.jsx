import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { History, Filter, RefreshCw, Calendar } from "lucide-react";

export default function StockHistory() {
  const { token } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMovements();
  }, [typeFilter, startDate, endDate]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const params = {};
      if (typeFilter) params.transactionType = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get(`${baseUrl}/stock/movements`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        setMovements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Stock Movement History & Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">Complete chronological audit trail of all inward, outward, and adjustment entries</p>
        </div>

        <button
          onClick={fetchMovements}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload History</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Movement Types</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
            <option value="purchase">Purchase Entry</option>
            <option value="opening_stock">Opening Stock</option>
            <option value="adjustment">Stock Adjustment</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4">Ref No</th>
                  <th className="py-3 px-4">Party / Notes</th>
                  <th className="py-3 px-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movements.length > 0 ? (
                  movements.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(m.date || m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
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
                      <td className="py-3 px-4 font-bold text-white">
                        {m.product?.name || "Deleted Product"} <span className="text-[10px] text-slate-400 font-mono">({m.product?.sku})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{m.warehouse?.name || "General"}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-white">{m.quantity}</td>
                      <td className="py-3 px-4 text-right text-slate-300">₹{m.unitPrice?.toLocaleString("en-IN") || 0}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-400">{m.referenceNo || "-"}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {m.supplier ? `Supplier: ${m.supplier} ` : m.customer ? `Customer: ${m.customer} ` : ""}
                        {m.notes || ""}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{m.performedBy?.name || "System"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No movement history records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
