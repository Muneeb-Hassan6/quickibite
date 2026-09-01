import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBoxes, FaFire } from "react-icons/fa";
import Swal from "sweetalert2";

// Components
import InventoryStats from "./Components/InventoryStats";
import InventoryControls from "./Components/InventoryControls";
import InventoryTable from "./Components/InventoryTable";
import InventoryModal from "./Components/InventoryModal";
import WastageAnalytics from "./Components/WastageAnalytics";

const InventoryManager = () => {
  const queryClient = useQueryClient();
  const [mainView, setMainView] = useState("stock"); // "stock" | "wastage"
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const defaultForm = {
    name: "",
    price: "",
    stock: "",
    unit: "kg",
    threshold: "10",
  };
  const [form, setForm] = useState(defaultForm);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/inventory_api.php`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const totalItems = products.length;
  const lowStock = products.filter((p) => {
    const s = parseFloat(p.stock || 0);
    const t = parseFloat(p.threshold || 10);
    return s <= t && s > 0;
  }).length;
  const totalValue = products
    .reduce((acc, p) => acc + (parseFloat(p.price || 0) * parseFloat(p.stock || 0)), 0)
    .toFixed(2);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const s = parseFloat(product.stock || 0);
    const t = parseFloat(product.threshold || 10);

    if (activeTab === "In Stock") return s > t;
    if (activeTab === "Low Stock") return s <= t && s > 0;
    if (activeTab === "Out of Stock") return s === 0;
    return true;
  });

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "price" || sortConfig.key === "stock") {
          aValue = parseFloat(aValue || 0);
          bValue = parseFloat(bValue || 0);
        } else {
          aValue = aValue ? aValue.toString().toLowerCase() : "";
          bValue = bValue ? bValue.toString().toLowerCase() : "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit || "kg",
      threshold: product.threshold || "10",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#171717",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/inventory_api.php?id=${id}`,
          { method: "DELETE" }
        );
        const res = await response.json();
        if (res.status === "success") {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Item has been deleted.",
            timer: 1500,
            showConfirmButton: false,
            background: "#171717",
            color: "#fff",
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = `${import.meta.env.VITE_API_BASE}/inventory_api.php`;
      const method = editingProduct ? "PUT" : "POST";
      const payload = editingProduct ? { ...form, id: editingProduct.id } : form;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.status === "success") {
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        setIsModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Inventory updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to save to database.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12 w-full max-w-full overflow-x-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Inventory & Raw Materials Control
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Track ingredients, unit costs, live stock depletion, and role-based wastage loss audits.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-neutral-800/80 rounded-xl border border-zinc-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setMainView("stock")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-['Oswald',sans-serif] flex items-center gap-1.5 cursor-pointer transition-all ${
              mainView === "stock"
                ? "bg-amber-500 text-neutral-950 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FaBoxes className="text-xs" />
            <span>Raw Stock & Valuation</span>
          </button>
          <button
            type="button"
            onClick={() => setMainView("wastage")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-['Oswald',sans-serif] flex items-center gap-1.5 cursor-pointer transition-all ${
              mainView === "wastage"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400"
            }`}
          >
            <FaFire className="text-xs" />
            <span>Wastage & Loss Audit</span>
          </button>
        </div>
      </div>

      {mainView === "wastage" ? (
        <WastageAnalytics />
      ) : (
        <>
          {isLoading && (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              Loading Raw Inventory...
            </div>
          )}

          {/* KPI Stats */}
          <InventoryStats
            totalItems={totalItems}
            lowStock={lowStock}
            totalValue={totalValue}
          />

          {/* Filter Tabs & Search */}
          <InventoryControls
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddClick={handleAddClick}
          />

          {/* Inventory Table */}
          <InventoryTable
            products={sortedAndFilteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            requestSort={requestSort}
            sortConfig={sortConfig}
          />
        </>
      )}

      {/* Modal */}
      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
    </div>
  );
};

export default InventoryManager;
