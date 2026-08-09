import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaDownload, FaFileExcel, FaFilePdf, FaBoxes } from "react-icons/fa";

export default function DownloadReports() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
      const [pRes, mRes] = await Promise.all([
        axios.get(`${baseUrl}/stock/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseUrl}/stock/movements`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (pRes.data.status === "success") setProducts(pRes.data.data);
      if (mRes.data.status === "success") setMovements(mRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Export Stock List PDF
  const exportStockPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Stock Inventory & Valuation Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      const tableRows = products.map((p) => [
        p.sku,
        p.name,
        p.category?.name || "-",
        p.currentStock,
        p.unit?.shortName || "units",
        `Rs. ${p.purchasePrice || 0}`,
        `Rs. ${(p.currentStock || 0) * (p.purchasePrice || 0)}`,
      ]);

      autoTable(doc, {
        head: [["SKU", "Product", "Category", "Qty", "Unit", "Unit Price", "Total Value"]],
        body: tableRows,
        startY: 28,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`Stock_Inventory_Report_${Date.now()}.pdf`);
      toast.success("Stock PDF report generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report");
    }
  };

  // Export Stock Movements PDF
  const exportMovementsPdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Stock Movement Audit Trail", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      const tableRows = movements.map((m) => [
        new Date(m.date || m.createdAt).toLocaleDateString(),
        m.transactionType.toUpperCase(),
        m.product?.name || "N/A",
        m.quantity,
        m.referenceNo || "-",
        m.performedBy?.name || "System",
      ]);

      autoTable(doc, {
        head: [["Date", "Type", "Product", "Qty", "Ref No", "User"]],
        body: tableRows,
        startY: 28,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] },
      });

      doc.save(`Stock_Movements_Report_${Date.now()}.pdf`);
      toast.success("Movement Audit PDF generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF report");
    }
  };

  // Export Stock Excel
  const exportStockExcel = () => {
    try {
      const data = products.map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category?.name || "",
        Brand: p.brand?.name || "",
        Unit: p.unit?.shortName || "",
        "Purchase Price": p.purchasePrice,
        "Selling Price": p.sellingPrice,
        "Current Stock": p.currentStock,
        "Min Stock Level": p.minStockLevel,
        "Total Inventory Value": (p.currentStock || 0) * (p.purchasePrice || 0),
        Status: p.status,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory");
      XLSX.writeFile(wb, `Inventory_Stock_${Date.now()}.xlsx`);
      toast.success("Excel report downloaded!");
    } catch (err) {
      toast.error("Failed to export Excel report");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <FaDownload className="text-blue-600" />
          Download Stock & Inventory Reports
        </h1>
        <p className="text-xs text-gray-500 mt-1">Export official PDF documents and Excel datasheets for accounting and audits</p>
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1: PDF Inventory */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4 hover:border-blue-500/50 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <FaFilePdf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Current Stock PDF Report</h3>
              <p className="text-xs text-gray-500 mt-1">Formal PDF inventory report with product pricing, quantities, and asset valuation.</p>
            </div>
            <button
              onClick={exportStockPdf}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <FaDownload />
              <span>Download Stock PDF</span>
            </button>
          </div>

          {/* Card 2: Excel Inventory */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4 hover:border-emerald-500/50 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <FaFileExcel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Full Stock Excel Spreadsheet</h3>
              <p className="text-xs text-gray-500 mt-1">Complete raw product catalog data sheet including categories, brands, prices, and stock levels.</p>
            </div>
            <button
              onClick={exportStockExcel}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <FaDownload />
              <span>Download Stock Excel</span>
            </button>
          </div>

          {/* Card 3: PDF Movements Audit */}
          <div className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4 hover:border-indigo-500/50 transition-all shadow-sm sm:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
              <FaBoxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Stock Movement Audit PDF Report</h3>
              <p className="text-xs text-gray-500 mt-1">Audit log document containing all recorded Stock In, Stock Out, Purchase entries, and Adjustments.</p>
            </div>
            <button
              onClick={exportMovementsPdf}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <FaDownload />
              <span>Download Movement Audit PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
