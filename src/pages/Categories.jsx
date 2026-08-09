import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { FaFolder, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaMagic } from "react-icons/fa";

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.get(`${baseUrl}/stock/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.post(`${baseUrl}/stock/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "success") {
        toast.success("Default categories, brands, units & warehouses seeded!");
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed defaults");
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", code: "", description: "", status: "active" });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      name: c.name || "",
      code: c.code || "",
      description: c.description || "",
      status: c.status || "active",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");

    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      if (editingId) {
        await axios.put(`${baseUrl}/stock/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category updated!");
      } else {
        await axios.post(`${baseUrl}/stock/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category created!");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id, name) => {
    const res = await Swal.fire({
      title: "Delete Category?",
      text: `Are you sure you want to delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
    });

    if (res.isConfirmed) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
        await axios.delete(`${baseUrl}/stock/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category deleted");
        fetchCategories();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <FaFolder className="text-blue-600" />
            Product Categories Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">Organize master products into logical categories</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FaPlus />
            <span>Add Category</span>
          </button>
        </div>
      </div>

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
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-blue-600 font-bold">{c.code || "-"}</td>
                      <td className="py-3 px-4 font-bold text-gray-800">{c.name}</td>
                      <td className="py-3 px-4 text-gray-500">{c.description || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            c.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id, c.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No categories created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-800">
                {editingId ? "Edit Category" : "Create New Category"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics, Raw Materials"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category Code</label>
                <input
                  type="text"
                  placeholder="e.g. CAT-ELE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Category notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <FaSave />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
