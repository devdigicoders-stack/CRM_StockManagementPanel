import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUp, Download, UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";

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

  // Download Sample Template
  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        SKU: "SKU-SAMPLE1",
        Name: "Sample LED Monitor 24inch",
        PurchasePrice: 8500,
        SellingPrice: 11000,
        MinStockLevel: 5,
        OpeningStock: 20,
        Description: "High resolution LED monitor",
      },
      {
        SKU: "SKU-SAMPLE2",
        Name: "Wireless Ergonomic Mouse",
        PurchasePrice: 450,
        SellingPrice: 799,
        MinStockLevel: 10,
        OpeningStock: 50,
        Description: "2.4GHz Wireless Mouse",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample_Template");
    XLSX.writeFile(wb, "Product_Import_Sample_Template.xlsx");
    toast.success("Sample template downloaded!");
  };

  // Handle File Import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (categories.length === 0 || units.length === 0) {
      return toast.error("Please add at least 1 Category and 1 Unit of Measure in system before importing products.");
    }

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          toast.error("File is empty or invalid format");
          setImporting(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
        const defaultCat = categories[0]._id;
        const defaultUnit = units[0]._id;
        let successCount = 0;

        for (const item of data) {
          if (!item.Name) continue;
          try {
            await axios.post(
              `${baseUrl}/stock/products`,
              {
                sku: item.SKU || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: item.Name,
                category: defaultCat,
                unit: defaultUnit,
                purchasePrice: Number(item.PurchasePrice) || 0,
                sellingPrice: Number(item.SellingPrice) || 0,
                minStockLevel: Number(item.MinStockLevel) || 5,
                openingStock: Number(item.OpeningStock) || 0,
                description: item.Description || "Imported via bulk sheet",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
          } catch (err) {
            console.error("Row import error", err);
          }
        }

        setImportedCount(successCount);
        toast.success(`Successfully imported ${successCount} products!`);
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
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileUp className="w-5 h-5 text-blue-400" />
          Import & Export Products
        </h1>
        <p className="text-xs text-slate-400 mt-1">Bulk upload inventory catalog via Excel/CSV spreadsheets or export master data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Bulk Import Products</h3>
              <p className="text-xs text-slate-400">Upload Excel (.xlsx) file</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Download our standardized sample template first. Populate product title, SKU, purchase price, selling price, and opening stock count.
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={downloadSampleTemplate}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Sample Excel Template</span>
            </button>

            <label className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
              <FileSpreadsheet className="w-4 h-4" />
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
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Last Import Success: {importedCount} products created</span>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Export Master Catalog</h3>
                <p className="text-xs text-slate-400">Download Excel Spreadsheet</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Export all currently active and inactive product listings from the system database into a full Excel file for offline backup or distribution.
            </p>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/stock/products/export`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all text-center"
          >
            <Download className="w-4 h-4" />
            <span>Export Products to Excel</span>
          </a>
        </div>
      </div>
    </div>
  );
}
