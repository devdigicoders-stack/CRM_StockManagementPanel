import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  FaPlusCircle,
  FaArrowLeft,
  FaSave,
  FaFileExcel,
  FaUpload,
  FaDownload,
  FaCheckCircle,
  FaLayerGroup,
  FaTags
} from "react-icons/fa";

export default function AddProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("single"); // 'single' | 'excel'

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Manual Form State
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    minStockLevel: "5",
    openingStock: "0",
    warehouseId: "",
    description: "",
    status: "active",
  });

  // Excel Bulk Import State
  const [excelFile, setExcelFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const [catRes, brandRes, unitRes, whRes] = await Promise.all([
        axios.get(`${baseUrl}/stock/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/brands`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/units`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/warehouses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (catRes.data.status === "success") setCategories(catRes.data.data);
      if (brandRes.data.status === "success") setBrands(brandRes.data.data);
      if (unitRes.data.status === "success") setUnits(unitRes.data.data);
      if (whRes.data.status === "success") setWarehouses(whRes.data.data);

      if (catRes.data.data.length > 0) setFormData((prev) => ({ ...prev, category: catRes.data.data[0]._id }));
      if (unitRes.data.data.length > 0) setFormData((prev) => ({ ...prev, unit: unitRes.data.data[0]._id }));
      if (whRes.data.data.length > 0) setFormData((prev) => ({ ...prev, warehouseId: whRes.data.data[0]._id }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load category/unit metadata");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.unit) {
      toast.error("Please fill required fields (Name, Category, Unit)");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.post(`${baseUrl}/stock/products`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "success") {
        toast.success("New Product added successfully!");
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Excel File Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("The selected Excel sheet is empty");
          return;
        }

        setParsedData(data);
        toast.success(`Loaded ${data.length} products from Excel sheet`);
      } catch (err) {
        console.error(err);
        toast.error("Error reading Excel file. Make sure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkImportSubmit = async () => {
    if (parsedData.length === 0) {
      toast.error("No valid products to import");
      return;
    }

    setImporting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const res = await axios.post(
        `${baseUrl}/stock/products/import-bulk`,
        { products: parsedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "success") {
        toast.success(`Successfully imported ${res.data.count} products!`);
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to import products");
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const templateData = [
      {
        SKU: "PROD-101",
        Name: "Wireless Optical Mouse",
        Category: "Electronics",
        Brand: "Logitech",
        Unit: "pcs",
        "Purchase Price": 450,
        "Selling Price": 799,
        "Min Stock Level": 10,
        "Opening Stock": 50,
        Description: "Ergonomic 2.4GHz wireless optical mouse"
      },
      {
        SKU: "PROD-102",
        Name: "LED Desk Lamp",
        Category: "Home & Office Appliances",
        Brand: "Philips",
        Unit: "pcs",
        "Purchase Price": 850,
        "Selling Price": 1499,
        "Min Stock Level": 5,
        "Opening Stock": 20,
        Description: "Touch dimmable LED table lamp"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample_Template");
    XLSX.writeFile(workbook, "Sample_Product_Import_Template.xlsx");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <FaPlusCircle className="text-blue-600" />
            Add Products to Stock
          </h1>
          <p className="text-xs text-gray-500 mt-1">Single product entry or bulk Excel import</p>
        </div>
        <Link
          to="/products"
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <FaArrowLeft />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("single")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "single"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <FaPlusCircle />
          <span>Manual Single Entry</span>
        </button>
        <button
          onClick={() => setActiveTab("excel")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "excel"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <FaFileExcel />
          <span>Excel Bulk Import</span>
        </button>
      </div>

      {/* TAB 1: Single Product Entry */}
      {activeTab === "single" && (
        <form onSubmit={handleManualSubmit} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Product SKU / Code</label>
              <input
                type="text"
                placeholder="Auto-generated if left empty"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter product title..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Unit of Measurement <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.shortName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Default Warehouse</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Primary Location</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cost / Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Min Stock Alert Level</label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Opening Quantity</label>
              <input
                type="number"
                value={formData.openingStock}
                onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Add specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Link
              to="/products"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <FaSave />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Excel Bulk Import */}
      {activeTab === "excel" && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <FaFileExcel className="text-emerald-600 text-lg" />
                Bulk Import Products via Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                Download the sample Excel template, fill your products, and upload below.
              </p>
            </div>
            <button
              onClick={downloadSampleTemplate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
            >
              <FaDownload />
              <span>Download Sample Excel</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-gray-50/50 transition-all">
            <FaUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Choose or Drag & Drop Excel File</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Supports .xlsx, .xls and .csv formats</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <FaFileExcel />
              <span>Browse Excel File</span>
            </label>
            {excelFile && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
                <FaCheckCircle />
                Selected: {excelFile.name} ({parsedData.length} items ready)
              </p>
            )}
          </div>

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Preview Import List ({parsedData.length} items)
                </h4>
                <button
                  onClick={handleBulkImportSubmit}
                  disabled={importing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Confirm & Import All Products</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 text-right">Purchase Price</th>
                      <th className="py-2.5 px-3 text-right">Selling Price</th>
                      <th className="py-2.5 px-3 text-center">Opening Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedData.slice(0, 100).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="py-2 px-3 font-mono font-bold text-blue-600">
                          {row.sku || row.SKU || "-"}
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-800">{row.name || row.Name || "-"}</td>
                        <td className="py-2 px-3 text-gray-600">{row.category || row.Category || "-"}</td>
                        <td className="py-2 px-3 text-gray-600">{row.brand || row.Brand || "-"}</td>
                        <td className="py-2 px-3 text-gray-600">{row.unit || row.Unit || "pcs"}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          ₹{row.purchasePrice || row.PurchasePrice || row["Purchase Price"] || 0}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-emerald-600">
                          ₹{row.sellingPrice || row.SellingPrice || row["Selling Price"] || 0}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-gray-800">
                          {row.openingStock || row.OpeningStock || row["Opening Stock"] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
