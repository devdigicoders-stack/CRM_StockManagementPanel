import React from "react";
import {
  FaTachometerAlt,
  FaBoxes,
  FaPlusCircle,
  FaFolder,
  FaTags,
  FaRuler,
  FaWarehouse,
  FaArrowDown,
  FaArrowUp,
  FaShoppingCart,
  FaSlidersH,
  FaExclamationTriangle,
  FaHistory,
  FaFileExcel,
  FaDownload,
  FaFileImport,
  FaKey
} from "react-icons/fa";

// Lazy load pages for performance
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Products = React.lazy(() => import("../pages/Products"));
const AddProduct = React.lazy(() => import("../pages/AddProduct"));
const EditProduct = React.lazy(() => import("../pages/EditProduct"));
const Categories = React.lazy(() => import("../pages/Categories"));
const Brands = React.lazy(() => import("../pages/Brands"));
const Units = React.lazy(() => import("../pages/Units"));
const Warehouses = React.lazy(() => import("../pages/Warehouses"));
const OpeningStock = React.lazy(() => import("../pages/OpeningStock"));
const StockIn = React.lazy(() => import("../pages/StockIn"));
const StockOut = React.lazy(() => import("../pages/StockOut"));
const PurchaseEntry = React.lazy(() => import("../pages/PurchaseEntry"));
const StockAdjustment = React.lazy(() => import("../pages/StockAdjustment"));
const StockAvailability = React.lazy(() => import("../pages/StockAvailability"));
const LowStockAlerts = React.lazy(() => import("../pages/LowStockAlerts"));
const StockHistory = React.lazy(() => import("../pages/StockHistory"));
const InventoryReports = React.lazy(() => import("../pages/InventoryReports"));
const DownloadReports = React.lazy(() => import("../pages/DownloadReports"));
const ImportExportProducts = React.lazy(() => import("../pages/ImportExportProducts"));
const ChangePassword = React.lazy(() => import("../pages/ChangePassword"));

export const sidebarNavigation = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: FaTachometerAlt, component: Dashboard },
    ]
  },
  {
    title: "Catalog Management",
    items: [
      { name: "All Products", path: "/products", icon: FaBoxes, component: Products },
      { name: "Add New Product", path: "/products/add", icon: FaPlusCircle, component: AddProduct },
      { name: "Categories", path: "/categories", icon: FaFolder, component: Categories },
      { name: "Brands", path: "/brands", icon: FaTags, component: Brands },
      { name: "Units of Measure", path: "/units", icon: FaRuler, component: Units },
      { name: "Warehouses / Locations", path: "/warehouses", icon: FaWarehouse, component: Warehouses },
    ]
  },
  {
    title: "Stock Operations",
    items: [
      { name: "Stock In Entry", path: "/stock/in", icon: FaArrowDown, component: StockIn },
      { name: "Stock Out Entry", path: "/stock/out", icon: FaArrowUp, component: StockOut },
      { name: "Purchase Entry", path: "/stock/purchase", icon: FaShoppingCart, component: PurchaseEntry },
      { name: "Opening Stock", path: "/stock/opening", icon: FaBoxes, component: OpeningStock },
      { name: "Stock Adjustment", path: "/stock/adjustment", icon: FaSlidersH, component: StockAdjustment },
    ]
  },
  {
    title: "Inventory Tracking",
    items: [
      { name: "Stock Availability", path: "/stock/availability", icon: FaBoxes, component: StockAvailability },
      { name: "Low Stock Alerts", path: "/stock/low-alerts", icon: FaExclamationTriangle, component: LowStockAlerts },
      { name: "Stock History", path: "/stock/history", icon: FaHistory, component: StockHistory },
    ]
  },
  {
    title: "Reports & Data",
    items: [
      { name: "Inventory Reports", path: "/reports/inventory", icon: FaFileExcel, component: InventoryReports },
      { name: "Download Reports", path: "/reports/download", icon: FaDownload, component: DownloadReports },
      { name: "Import / Export", path: "/products/import-export", icon: FaFileImport, component: ImportExportProducts },
    ]
  },
  {
    title: "Account Settings",
    items: [
      { name: "Change Password", path: "/change-password", icon: FaKey, component: ChangePassword },
    ]
  }
];

export const nonSidebarRoutes = [
  { path: "/products/edit/:id", component: EditProduct }
];
