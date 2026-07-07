import React, { useState } from "react";
import DealMaker from "./DealMaker";
import DealList from "./DealList";
import { FaTag, FaList } from "react-icons/fa";

const DealsDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState("manage");
  const [dealToEdit, setDealToEdit] = useState(null); // 🔥 Edit Data State

  // Jab edit button press ho
  const handleEditDeal = (deal) => {
    setDealToEdit(deal);
    setActiveSubTab("create"); // Create walay tab par bhej do
  };

  // Jab edit pura ho jaye ya cancel ho jaye
  const clearEdit = () => {
    setDealToEdit(null);
    setActiveSubTab("manage");
  };

  return (
    <div style={{ padding: "20px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
          borderBottom: "1px solid #333",
          paddingBottom: "15px",
        }}
      >
        <button
          onClick={clearEdit} // Is par click karny se reset ho jayega
          style={{
            background: activeSubTab === "manage" ? "#ef4444" : "transparent",
            color: activeSubTab === "manage" ? "#fff" : "#888",
            border: "1px solid",
            borderColor: activeSubTab === "manage" ? "#ef4444" : "#333",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "0.3s",
          }}
        >
          <FaList /> Manage Deals
        </button>

        <button
          onClick={() => {
            setDealToEdit(null);
            setActiveSubTab("create");
          }} // Fresh deal bnany k liay
          style={{
            background: activeSubTab === "create" ? "#ef4444" : "transparent",
            color: activeSubTab === "create" ? "#fff" : "#888",
            border: "1px solid",
            borderColor: activeSubTab === "create" ? "#ef4444" : "#333",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "0.3s",
          }}
        >
          <FaTag /> {dealToEdit ? "Edit Deal" : "Create New Deal"}
        </button>
      </div>

      {/* 🔥 Props Pass Kar Diye */}
      {activeSubTab === "manage" ? (
        <DealList onEdit={handleEditDeal} />
      ) : (
        <DealMaker editDeal={dealToEdit} onSuccess={clearEdit} />
      )}
    </div>
  );
};

export default DealsDashboard;
