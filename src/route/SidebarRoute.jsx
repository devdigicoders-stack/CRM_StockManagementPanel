import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  Tag,
  Ruler,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Sliders,
  Boxes,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Download,
  FileUp,
  KeyRound,
  FileEdit
} from "lucide-react";
import React from "react";

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
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, component: Dashboard },
    ]
  },
  {
    title: "Catalog Management",
    items: [
      { name: "All Products", path: "/products", icon: Package, component: Products },
      { name: "Add New Product", path: "/products/add", icon: PlusCircle, component: AddProduct },
      { name: "Categories", path: "/categories", icon: FolderTree, component: Categories },
      { name: "Brands", path: "/brands", icon: Tag, component: Brands },
      { name: "Units of Measure", path: "/units", icon: Ruler, component: Units },
      { name: "Warehouses / Locations", path: "/warehouses", icon: Building2, component: Warehouses },
    ]
  },
  {
    title: "Stock Operations",
    items: [
      { name: "Stock In Entry", path: "/stock/in", icon: ArrowDownLeft, component: StockIn },
      { name: "Stock Out Entry", path: "/stock/out", icon: ArrowUpRight, component: StockOut },
      { name: "Purchase Entry", path: "/stock/purchase", icon: ShoppingCart, component: PurchaseEntry },
      { name: "Opening Stock", path: "/stock/opening", icon: Boxes, component: OpeningStock },
      { name: "Stock Adjustment", path: "/stock/adjustment", icon: Sliders, component: StockAdjustment },
    ]
  },
  {
    title: "Inventory Tracking",
    items: [
      { name: "Stock Availability", path: "/stock/availability", icon: Boxes, component: StockAvailability },
      { name: "Low Stock Alerts", path: "/stock/low-alerts", icon: AlertTriangle, component: LowStockAlerts },
      { name: "Stock History", path: "/stock/history", icon: History, component: StockHistory },
    ]
  },
  {
    title: "Reports & Data",
    items: [
      { name: "Inventory Reports", path: "/reports/inventory", icon: FileSpreadsheet, component: InventoryReports },
      { name: "Download Reports", path: "/reports/download", icon: Download, component: DownloadReports },
      { name: "Import / Export", path: "/products/import-export", icon: FileUp, component: ImportExportProducts },
    ]
  },
  {
    title: "Account Settings",
    items: [
      { name: "Change Password", path: "/change-password", icon: KeyRound, component: ChangePassword },
    ]
  }
];

export const nonSidebarRoutes = [
  { path: "/products/edit/:id", component: EditProduct }
];
