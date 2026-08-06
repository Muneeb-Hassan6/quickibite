import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import "./styles/index.css"

// Components
import InventoryStats from "./Components/InventoryStats";
import InventoryControls from "./Components/InventoryControls";
import InventoryTable from "./Components/InventoryTable";
import InventoryModal from "./Components/InventoryModal";

const InventoryManager = () => {
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
  const [products, setProducts] = useState([]); // 🔥 Dummy data removed

  // 🔥 1. FETCH DATA FROM DATABASE
  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/inventory_api.php`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalItems = products.length;
  const lowStock = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const totalValue = products
    .reduce((acc, p) => acc + parseFloat(p.price) * p.stock, 0)
    .toFixed(2);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "In Stock") return product.stock > 10;
    if (activeTab === "Low Stock")
      return product.stock <= 10 && product.stock > 0;
    if (activeTab === "Out of Stock") return product.stock == 0;
    return true;
  });

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "price" || sortConfig.key === "stock") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
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

  // 🔥 2. DELETE FROM DATABASE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Item?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      background: "var(--admin-panel)",
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
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--admin-panel)",
          color: "#fff",
        });
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  // 🔥 3. SAVE / UPDATE IN DATABASE
  const handleSave = async () => {
    if (!form.name || !form.price || form.stock === "") {
      return Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill all required fields.",
        background: "var(--admin-panel)",
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
        fetchInventory(); // Reload fresh data
        setIsModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Inventory updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--admin-panel)",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save to database.",
          background: "var(--admin-panel)",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div style={{ paddingBottom: "50px" }}>
      <div style={{ marginBottom: "25px" }}>
        <h2 className="section-header" style={{ marginBottom: "5px" }}>
          Inventory Management
        </h2>
        <p style={{ color: "var(--admin-muted)", fontSize: "14px", margin: 0 }}>
          Manage your products, stock, and prices efficiently.
        </p>
      </div>

      <InventoryStats
        totalItems={totalItems}
        lowStock={lowStock}
        totalValue={totalValue}
      />

      <InventoryControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddClick={handleAddClick}
      />

      <InventoryTable
        products={sortedAndFilteredProducts}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />

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
