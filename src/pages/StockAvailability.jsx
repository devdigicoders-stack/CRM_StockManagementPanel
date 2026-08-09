import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Boxes, Search, AlertTriangle, Building2 } from "lucide-react";

export default function StockAvailability() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    if (!warehouseFilter) return matchesSearch;
    const hasWhStock = p.warehouseStock?.some((w) => w.warehouse?._id === warehouseFilter && w.quantity > 0);
    return matchesSearch && hasWhStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            Current Stock Availability
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live inventory levels and warehouse distribution breakdown</p>
        </div>
      </div>

      {/* Search & Warehouse Filter */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by Name or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Warehouses & Central Stock</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Cards / Grid */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const isLow = p.currentStock <= p.minStockLevel;
              return (
                <div
                  key={p._id}
                  className={`p-5 bg-slate-900/90 border rounded-2xl space-y-3 transition-all ${
                    isLow ? "border-amber-500/40 bg-amber-950/10" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {p.sku}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">{p.category?.name || "General"}</p>
                    </div>
                    {isLow && (
                      <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg" title="Low Stock Warning">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Total Available Stock</span>
                    <span className={`text-base font-extrabold ${isLow ? "text-amber-400" : "text-emerald-400"}`}>
                      {p.currentStock} {p.unit?.shortName || "units"}
                    </span>
                  </div>

                  {p.warehouseStock && p.warehouseStock.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Warehouse Distribution</p>
                      <div className="space-y-1">
                        {p.warehouseStock.map((w, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/50 px-2.5 py-1 rounded-lg">
                            <span>{w.warehouse?.name || "Unassigned"}</span>
                            <span className="font-bold text-white">{w.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              No products found matching stock filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
