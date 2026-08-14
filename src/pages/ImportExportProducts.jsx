import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FaFileImport, FaDownload, FaUpload, FaCheckCircle, FaFileExcel } from "react-icons/fa";

export default function ImportExportProducts() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const [cRes, uRes] = await Promise.all([
        axios.get(`${baseUrl}/stock/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/units`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (cRes.data.status === "success") setCategories(cRes.data.data);
      if (uRes.data.status === "success") setUnits(uRes.data.data);
    } catch (err) {
      console.error(err);
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
        "Selling Price": 799,
        "Min Stock Level": 10,
        "Opening Stock": 50,
        Description: "Ergonomic 2.4GHz wireless optical mouse",
      },
      {
        SKU: "PROD-102",
        Name: "LED Desk Lamp",
        Category: "Home & Office Appliances",
        Brand: "Philips",
        Unit: "pcs",
        "Selling Price": 1499,
        "Min Stock Level": 5,
        "Opening Stock": 20,
        Description: "Touch dimmable LED table lamp",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample_Template");
    XLSX.writeFile(workbook, "Sample_Product_Import_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("Excel sheet is empty");
          setImporting(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
        const res = await axios.post(
          `${baseUrl}/stock/products/import-bulk`,
          { products: data },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.status === "success") {
          toast.success(`Successfully imported ${res.data.count} products!`);
          setImportedCount(res.data.count);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse or process import file");
      } finally {
        setImporting(false);
        e.target.value = null;
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <FaFileImport className="text-blue-600" />
          Import & Export Products
        </h1>
        <p className="text-xs text-gray-500 mt-1">Bulk upload inventory catalog via Excel/CSV spreadsheets or export master data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FaUpload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Bulk Import Products</h3>
              <p className="text-xs text-gray-400">Upload Excel (.xlsx) file</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Download our standardized sample template first. Populate product title, SKU, selling price, and opening stock count.
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={downloadSampleTemplate}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FaDownload className="text-blue-600" />
              <span>Download Sample Excel Template</span>
            </button>

            <label className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
              <FaFileExcel />
              <span>{importing ? "Processing Import..." : "Select File to Upload & Import"}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                disabled={importing}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importedCount > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-600">
              <FaCheckCircle />
              <span>Last Import Success: {importedCount} products created</span>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <FaFileExcel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Export Master Catalog</h3>
                <p className="text-xs text-gray-400">Download Excel Spreadsheet</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Export all existing product master information including live stock quantity levels, unit descriptions, and brand records.
            </p>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/stock/products/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all text-center"
          >
            <FaDownload />
            <span>Export Product Catalog</span>
          </a>
        </div>
      </div>
    </div>
  );
}
