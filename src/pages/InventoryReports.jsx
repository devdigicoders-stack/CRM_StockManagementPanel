import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaFileExcel, FaRupeeSign, FaBoxes, FaExclamationTriangle, FaLayerGroup } from "react-icons/fa";

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

  const totalItems = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockLevel).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <FaFileExcel className="text-indigo-600" />
          Inventory Summary & Valuation Reports
        </h1>
        <p className="text-xs text-gray-500 mt-1">Valuation insights, asset breakdown, and catalog stock health</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Total Units in Stock</span>
            <FaBoxes className="text-emerald-600 text-lg" />
          </div>
          <p className="text-2xl font-extrabold text-gray-800">{totalItems.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-gray-400 mt-1">Across all product lines</p>
        </div>

        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Low Stock Products</span>
            <FaExclamationTriangle className="text-amber-500 text-lg" />
          </div>
          <p className="text-2xl font-extrabold text-gray-800">{lowStockItems}</p>
          <p className="text-[11px] text-gray-400 mt-1">At or below safety limits</p>
        </div>
      </div>

      {/* Product Valuation Breakdown */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
          <FaLayerGroup className="text-blue-600" />
          Product Asset Valuation Breakdown
        </h3>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Available Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">{p.sku}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-800">{p.name}</td>
                    <td className="py-2.5 px-3 text-gray-600">{p.category?.name || "-"}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-800">
                      {p.currentStock} {p.unit?.shortName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
