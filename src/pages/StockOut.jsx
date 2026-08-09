import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { ArrowUpRight, Save } from "lucide-react";

export default function StockOut() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    customer: "",
    referenceNo: "",
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

      if (prodRes.data.status === "success") setProducts(prodRes.data.data);
      if (whRes.data.status === "success") setWarehouses(whRes.data.data);

      if (prodRes.data.data.length > 0) setFormData((prev) => ({ ...prev, productId: prodRes.data.data[0]._id }));
      if (whRes.data.data.length > 0) setFormData((prev) => ({ ...prev, warehouseId: whRes.data.data[0]._id }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products/warehouses");
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === formData.productId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(formData.quantity);
    if (!formData.productId || !qty || qty <= 0) {
      return toast.error("Please select a product and enter a valid positive quantity");
    }

    if (selectedProduct && selectedProduct.currentStock < qty) {
      return toast.error(`Insufficient stock! Available stock is only ${selectedProduct.currentStock}`);
    }

    setSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const payload = {
        transactionType: "stock_out",
        productId: formData.productId,
        warehouseId: formData.warehouseId || null,
        quantity: qty,
        customer: formData.customer,
        referenceNo: formData.referenceNo || `OUT-${Date.now().toString().slice(-6)}`,
        notes: formData.notes,
      };

      const res = await axios.post(`${baseUrl}/stock/movements`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        toast.success(`Stock Out recorded! Remaining Stock Qty: ${res.data.currentStock}`);
        setFormData({
          ...formData,
          quantity: "",
          customer: "",
          referenceNo: "",
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record Stock Out");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-rose-400" />
          Stock Out Entry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record outgoing stock dispatches, sales fulfillments, and outward transfers
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Warehouse</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">General Location</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dispatch Quantity *</label>
              <input
                type="number"
                required
                min="1"
                max={selectedProduct?.currentStock || 999999}
                placeholder="Enter outward quantity..."
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer / Recipient Department</label>
              <input
                type="text"
                placeholder="e.g. Sales Division / Customer Name"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reference / Dispatch Order No.</label>
              <input
                type="text"
                placeholder="e.g. DO-77890"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Dispatch Remarks</label>
            <textarea
              rows={2}
              placeholder="Delivery note, vehicle info..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Record Stock Out Entry</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
