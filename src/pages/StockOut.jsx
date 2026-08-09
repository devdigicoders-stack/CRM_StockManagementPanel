import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowUp, FaSave } from "react-icons/fa";

export default function StockOut() {
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
    referenceNo: "",
    customer: "",
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
          setFormData((prev) => ({ ...prev, productId: prodRes.data.data[0]._id }));
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
      toast.error("Please select a product and enter quantity");
      return;
    }

    const selectedProduct = products.find((p) => p._id === formData.productId);
    if (selectedProduct && selectedProduct.currentStock < Number(formData.quantity)) {
      toast.error(`Insufficient stock! Available quantity is ${selectedProduct.currentStock}`);
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const payload = {
        transactionType: "stock_out",
        productId: formData.productId,
        warehouseId: formData.warehouseId || undefined,
        quantity: Number(formData.quantity),
        referenceNo: formData.referenceNo || `OUT-${Date.now()}`,
        customer: formData.customer || undefined,
        notes: formData.notes || "Stock Out Entry",
      };

      const res = await axios.post(`${baseUrl}/stock/movements`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        toast.success("Stock Out entry saved!");
        navigate("/stock/availability");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record Stock Out entry");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === formData.productId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <FaArrowUp className="text-rose-600" />
          Stock Out Entry
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Record outgoing stock dispatches, sales fulfillments, and outward transfers
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) - Available Stock: {p.currentStock} {p.unit?.shortName || "units"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Source Warehouse</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
              >
                <option value="">General Location</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dispatch Quantity *</label>
              <input
                type="number"
                required
                min="1"
                max={selectedProduct?.currentStock || 999999}
                placeholder="Enter outward quantity..."
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Customer / Recipient Department</label>
              <input
                type="text"
                placeholder="e.g. Sales Division / Customer Name"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / Dispatch Order No.</label>
              <input
                type="text"
                placeholder="e.g. DO-77890"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              placeholder="Record reason for stock outward dispatch..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSave />
                  <span>Confirm Stock Out</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
