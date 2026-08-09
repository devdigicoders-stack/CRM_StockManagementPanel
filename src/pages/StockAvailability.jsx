import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { FaBoxes, FaWarehouse, FaExclamationTriangle, FaFilter, FaSearch } from "react-icons/fa";

export default function StockAvailability() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '', 'low', 'out'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const [prodRes, whRes] = await Promise.all([
        axios.get(`${baseUrl}/stock/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/warehouses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (prodRes.data.status === "success") setProducts(prodRes.data.data);
      if (whRes.data.status === "success") setWarehouses(whRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load availability metrics");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    let matchesWarehouse = true;
    if (warehouseFilter) {
      matchesWarehouse = p.warehouseStock?.some(
        (w) => w.warehouse?._id === warehouseFilter || w.warehouse === warehouseFilter
      );
    }

    let matchesStatus = true;
    if (statusFilter === "low") {
      matchesStatus = p.currentStock <= p.minStockLevel && p.currentStock > 0;
    } else if (statusFilter === "out") {
      matchesStatus = p.currentStock <= 0;
    }

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <FaBoxes className="text-blue-600" />
            Stock Availability & Distribution
          </h1>
          <p className="text-xs text-gray-500 mt-1">Live stock levels tracked across all physical storage locations</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <FaSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <FaWarehouse className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <FaFilter className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const isLow = p.currentStock <= p.minStockLevel;
              const isOut = p.currentStock <= 0;

              return (
                <div key={p._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {p.sku}
                      </span>
                      <h3 className="text-sm font-bold text-gray-800 mt-1.5">{p.name}</h3>
                      <p className="text-[11px] text-gray-400">{p.category?.name || "General"}</p>
                    </div>
                    {isLow && (
                      <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg" title="Low Stock Warning">
                        <FaExclamationTriangle className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Total Available Stock</span>
                    <span
                      className={`text-base font-extrabold ${
                        isOut ? "text-rose-600" : isLow ? "text-amber-500" : "text-emerald-600"
                      }`}
                    >
                      {p.currentStock} {p.unit?.shortName || "units"}
                    </span>
                  </div>

                  {p.warehouseStock && p.warehouseStock.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Warehouse Distribution</p>
                      <div className="space-y-1">
                        {p.warehouseStock.map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <span>{w.warehouse?.name || "Unassigned"}</span>
                            <span className="font-bold text-gray-800">{w.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-gray-100 rounded-xl shadow-sm">
              No products found matching stock filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
