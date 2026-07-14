import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaPlus, FaTrash, FaQrcode, FaPrint, FaPowerOff, FaSave, FaLink } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import "../../styles/index.css"; // Ensure admin styling
import "./styles/index.css"; // Table Manager specific styles

const TableManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const [qrBaseUrl, setQrBaseUrl] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState("");

  const qrRefs = useRef({}); // To store references to QR canvases for downloading

  const { data = {}, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`);
      const result = await response.json();
      return result.success ? { tables: result.data, qrBaseUrl: result.qr_base_url } : { tables: [], qrBaseUrl: "" };
    }
  });

  const tables = data.tables || [];

  useEffect(() => {
    if (data.qrBaseUrl !== undefined && !qrBaseUrl && !baseUrlInput) {
      setQrBaseUrl(data.qrBaseUrl);
      setBaseUrlInput(data.qrBaseUrl);
    }
  }, [data.qrBaseUrl]);
  const handleSaveBaseUrl = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_qr_base_url", url: baseUrlInput }),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({ icon: "success", title: "Saved!", text: "QR Code Base Link updated.", timer: 1500, showConfirmButton: false });
        setQrBaseUrl(baseUrlInput);
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save link", "error");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      Swal.fire("Error", "Table Name is required", "error");
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", table_name: newTableName.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "New table added successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        setNewTableName("");
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server Error", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", id }),
      });
      const result = await response.json();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['tables'] }); // Refresh list
      }
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Table?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE}/admin_manage_tables.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id }),
          });
          const res = await response.json();
          if (res.success) {
            Swal.fire("Deleted!", "The table has been deleted.", "success");
            queryClient.invalidateQueries({ queryKey: ['tables'] });
          } else {
            Swal.fire("Error", res.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Server Error", "error");
        }
      }
    });
  };

  const downloadQR = (tableId, tableName) => {
    const canvas = qrRefs.current[tableId];
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Code_${tableName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="admin-panel-content">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="panel-title">Tables & QR Codes</h2>
          <p className="panel-subtitle">Manage restaurant tables and generate QR codes for Dine-In</p>
        </div>
        <button className="btn-add-table" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add New Table
        </button>
      </div>

      {/* QR Base URL Setting */}
      <div style={{ background: "var(--admin-panel)", padding: "15px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "var(--shadow-glow)" }}>
        <FaLink style={{ color: "var(--admin-orange)", fontSize: "20px" }} />
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "12px", color: "var(--admin-muted)", marginBottom: "4px" }}>Base Link for QR Codes</label>
          <input 
            type="text" 
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="e.g. https://myrestaurant.com"
            className="qr-input-field"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--admin-border)", background: "var(--admin-bg)", color: "var(--admin-text)" }}
          />
        </div>
        <button onClick={handleSaveBaseUrl} className="btn-qr-primary" style={{ marginTop: "18px", padding: "9px 20px" }}>
          <FaSave /> Save Link
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner" style={{ textAlign: "center", padding: "2rem" }}>Loading Tables...</div>
      ) : (
        <div className="tables-grid">
          {tables.length === 0 ? (
            <p style={{ color: "var(--admin-muted)" }}>No tables found. Add a table to get started.</p>
          ) : (
            tables.map((table) => {
              // Generate Dynamic URL based on base url or current window location
              const base = qrBaseUrl || window.location.origin;
              const qrValue = `${base}/?mode=dine_in&table=${encodeURIComponent(table.table_name)}`;
              
              return (
                <div key={table.id} className="table-card fade-in" style={{ opacity: table.status == 1 ? 1 : 0.6 }}>
                  <div className="table-card-header">
                    <h3 className="table-card-title">
                      <span style={{ color: "var(--admin-orange)" }}>#{table.id}</span>
                      {table.table_name}
                    </h3>
                    <span className={`status-badge ${table.status == 1 ? "status-delivered" : "status-cancelled"}`}>
                      {table.status == 1 ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="qr-code-wrapper">
                    <QRCodeCanvas 
                      value={qrValue} 
                      size={140} 
                      bgColor={"#ffffff"} 
                      fgColor={"#000000"} 
                      level={"H"} 
                      includeMargin={true}
                      ref={(el) => qrRefs.current[table.id] = el}
                    />
                  </div>
                  
                  <div className="qr-url-text">
                    {qrValue}
                  </div>

                  <div className="table-actions-row">
                    <button 
                      onClick={() => downloadQR(table.id, table.table_name)} 
                      className="btn-qr-primary"
                      title="Download QR"
                    >
                      <FaPrint /> Print
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(table.id)} 
                      className="btn-qr-icon"
                      title={table.status == 1 ? "Deactivate" : "Activate"}
                    >
                      <FaPowerOff />
                    </button>
                    <button 
                      onClick={() => handleDelete(table.id)} 
                      className="btn-qr-icon danger"
                      title="Delete Table"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content qr-modal-content" style={{ maxWidth: "420px" }}>
            <h3 className="qr-modal-header">
              <FaQrcode style={{ color: "var(--admin-orange)" }} /> Add New Table
            </h3>
            <form onSubmit={handleAddTable}>
              <div style={{ marginTop: "15px", marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "var(--admin-text)", fontWeight: "600" }}>Table Name or Number</label>
                <input 
                  type="text" 
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 1, VIP-A"
                  className="qr-input-field"
                  required
                />
              </div>
              <div className="modal-actions" style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-qr-icon" style={{ padding: "10px 20px" }}>
                  Cancel
                </button>
                <button type="submit" className="btn-qr-primary" style={{ flex: "none", padding: "10px 25px" }}>
                  <FaPlus /> Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TableManager;
