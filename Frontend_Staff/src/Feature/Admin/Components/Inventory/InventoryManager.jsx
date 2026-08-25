import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Components
import InventoryStats from "./Components/InventoryStats";
import InventoryControls from "./Components/InventoryControls";
import InventoryTable from "./Components/InventoryTable";
import InventoryModal from "./Components/InventoryModal";

const InventoryManager = () => {
  const queryClient = useQueryClient();
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
    setForm(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Ingredient?",
      text: "This item will be permanently removed from raw inventory.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete",
      background: "#171717",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await fetch(
          `${import.meta.env.VITE_API_BASE}/inventory_api.php?id=${id}`,
          {
            method: "DELETE",
          },
        );
        queryClient.setQueryData(['inventory'], (old) =>
          old ? old.filter((p) => p.id !== id) : []
        );
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || form.stock === "") {
      return Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill all required fields.",
        background: "#171717",
        color: "#fff",
      });
    }

    const method = editingProduct ? "PUT" : "POST";
    const payload = editingProduct ? { ...form, id: editingProduct.id } : form;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/inventory_api.php`,
        {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

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
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Raw Inventory & Stock Valuation
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Track ingredients, unit costs, low-stock alerts, and raw material quantities in real-time.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
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
