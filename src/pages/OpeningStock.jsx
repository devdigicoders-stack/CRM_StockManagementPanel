import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaBoxes, FaSave } from "react-icons/fa";

export default function OpeningStock() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    unitPrice: "",
    notes: "",
  });

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

      if (prodRes.data.status === "success") {
        setProducts(prodRes.data.data);
        if (prodRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            productId: prodRes.data.data[0]._id,
            unitPrice: prodRes.data.data[0].purchasePrice || "",
          }));
        }
      }
      if (whRes.data.status === "success") setWarehouses(whRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products/warehouses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      toast.error("Please enter Product and Quantity");
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const selectedProd = products.find((p) => p._id === formData.productId);

      const payload = {
        transactionType: "opening_stock",
        productId: formData.productId,
        warehouseId: formData.warehouseId || undefined,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice) || selectedProd?.purchasePrice || 0,
        notes: formData.notes || "Opening Stock Entry",
      };

      const res = await axios.post(`${baseUrl}/stock/movements`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        toast.success("Opening Stock Entry recorded!");
        navigate("/stock/availability");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save stock movement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <FaBoxes className="text-blue-600" />
          Opening Stock Entry
        </h1>
        <p className="text-xs text-gray-500 mt-1">Initialize or set standard starting count of a product in warehouse</p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => {
                const p = products.find((x) => x._id === e.target.value);
                setFormData({
                  ...formData,
                  productId: e.target.value,
                  unitPrice: p ? p.purchasePrice : "",
                });
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) - Current: {p.currentStock} {p.unit?.shortName || "units"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Warehouse Location</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">General (Default)</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Opening Stock Quantity *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Enter units count..."
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Unit Price (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Internal Audit Reason</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSave />
                  <span>Confirm Opening Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
