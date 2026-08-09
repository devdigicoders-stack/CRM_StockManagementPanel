import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaHistory, FaFilter, FaSync, FaCalendar } from "react-icons/fa";

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <FaHistory className="text-blue-600" />
            Stock Movement History & Audit Log
          </h1>
          <p className="text-xs text-gray-500 mt-1">Complete chronological audit trail of all stock movements</p>
        </div>

        <button
          onClick={fetchMovements}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <FaSync />
          <span>Reload History</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <FaFilter className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Movement Types</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
            <option value="purchase">Purchase Entry</option>
            <option value="opening_stock">Opening Stock</option>
            <option value="adjustment">Stock Adjustment</option>
          </select>
        </div>

        <div className="relative">
          <FaCalendar className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <FaCalendar className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
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
              <tbody className="divide-y divide-gray-100">
                {movements.length > 0 ? (
                  movements.map((m) => (
                    <tr key={m._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                        {new Date(m.date || m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
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
                        {m.product?.name || "Deleted Product"} <span className="text-[10px] text-gray-400 font-mono">({m.product?.sku})</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{m.warehouse?.name || "General"}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-800">{m.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-700">₹{m.unitPrice?.toLocaleString("en-IN") || 0}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-600">{m.referenceNo || "-"}</td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {m.supplier ? `Supplier: ${m.supplier} ` : m.customer ? `Customer: ${m.customer} ` : ""}
                        {m.notes || ""}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{m.performedBy?.name || "System"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
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
