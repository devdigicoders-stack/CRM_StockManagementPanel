import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  FaBoxes,
  FaSearch,
  FaFilter,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaDownload
} from "react-icons/fa";

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, [search, categoryFilter, brandFilter, lowStockOnly]);

  const fetchMetadata = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const [catRes, brandRes] = await Promise.all([
        axios.get(`${baseUrl}/stock/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/brands`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (catRes.data.status === "success") setCategories(catRes.data.data);
      if (brandRes.data.status === "success") setBrands(brandRes.data.data);
    } catch (err) {
      console.error("Error fetching categories/brands", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (brandFilter) params.brand = brandFilter;
      if (lowStockOnly) params.lowStock = "true";

      const res = await axios.get(`${baseUrl}/stock/products`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === "success") {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `Are you sure you want to delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete"
    });

    if (result.isConfirmed) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
        await axios.delete(`${baseUrl}/stock/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <FaBoxes className="text-blue-600" />
            Product Catalog & Search
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage master product listings, pricing, and stock thresholds</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/products/import-export"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FaDownload />
            <span>Import / Export</span>
          </Link>
          <Link
            to="/products/add"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FaPlusCircle />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <FaSearch className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or Name..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="relative">
          <FaFilter className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <FaExclamationTriangle />
            Low Stock Only
          </span>
        </label>
      </div>

      {/* Product Table */}
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
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? (
                  products.map((p) => {
                    const isLow = p.currentStock <= p.minStockLevel;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-blue-600 font-bold">{p.sku}</td>
                        <td className="py-3 px-4 font-bold text-gray-800">
                          <div className="flex items-center gap-2">
                            <FaBoxes className="text-gray-400" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{p.category?.name || "-"}</td>
                        <td className="py-3 px-4 text-gray-600">{p.brand?.name || "-"}</td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          ₹{p.sellingPrice?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isLow
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}
                            >
                              {p.currentStock} {p.unit?.shortName || "units"}
                            </span>
                            {isLow && <FaExclamationTriangle className="text-amber-500 animate-pulse" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              p.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/products/edit/${p._id}`}
                              className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(p._id, p.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      No products found matching your search criteria.
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
