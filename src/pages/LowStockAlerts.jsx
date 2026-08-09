import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaArrowDown, FaSync } from "react-icons/fa";


export default function LowStockAlerts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.get(`${baseUrl}/stock/products?lowStock=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") setProducts(res.data.data);
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
            <FaExclamationTriangle className="text-amber-500" />
            Low Stock Alerts & Reorder List
          </h1>
          <p className="text-xs text-gray-500 mt-1">Products at or below safety stock threshold requiring restocking</p>
        </div>
        <button
          onClick={fetchLowStock}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <FaSync />
          <span>Refresh Alerts</span>
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Min Threshold</th>
                  <th className="py-3 px-4 text-center">Deficit Qty</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? (
                  products.map((p) => {
                    const deficit = Math.max(0, p.minStockLevel - p.currentStock);
                    return (
                      <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-amber-500 font-bold">{p.sku}</td>
                        <td className="py-3 px-4 font-bold text-gray-800">{p.name}</td>
                        <td className="py-3 px-4 text-gray-600">{p.category?.name || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-600 border border-rose-100">
                            {p.currentStock} {p.unit?.shortName || "units"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500 font-semibold">{p.minStockLevel}</td>
                        <td className="py-3 px-4 text-center font-bold text-amber-600">+{deficit} needed</td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to="/stock/in"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            <FaArrowDown />
                            <span>Stock In Now</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-emerald-600 font-medium">
                      ✓ All product stock levels are above minimum threshold safety limits.
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
