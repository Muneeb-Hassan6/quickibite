import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaTrash,
  FaQrcode,
  FaPrint,
  FaPowerOff,
  FaSave,
  FaLink,
  FaCopy,
  FaChair,
  FaCheckCircle,
  FaTimes,
  FaDownload,
  FaGlobe,
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

const TableManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  const [qrBaseUrl, setQrBaseUrl] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState("");

  const qrRefs = useRef({});

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
        Swal.fire({
          icon: "success",
          title: "Base URL Saved!",
          text: "QR codes will now generate with this domain prefix.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setQrBaseUrl(baseUrlInput);
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save base URL", "error");
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
        body: JSON.stringify({
          action: "add",
          table_name: newTableName.trim(),
          capacity: newTableCapacity,
        }),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Table Added!",
          text: `Table ${newTableName} created successfully.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setNewTableName("");
        setNewTableCapacity("4");
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
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      }
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const handleDelete = async (id, tableName) => {
    Swal.fire({
      title: `Delete ${tableName}?`,
      text: "This table and associated QR links will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete",
      background: "#171717",
      color: "#fff",
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
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Table has been deleted.",
              timer: 1500,
              showConfirmButton: false,
              background: "#171717",
              color: "#fff",
            });
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

  const copyQrLink = (url) => {
    navigator.clipboard.writeText(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Dine-In Link Copied",
      showConfirmButton: false,
      timer: 1500,
      background: "#171717",
      color: "#fff",
    });
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[var(--admin-text,#fff)] m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Tables & Dine-In QR Generator
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-muted,#888)] m-0 mt-0.5 font-sans">
            Manage restaurant tables and generate high-resolution QR codes for contactless Dine-In ordering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
        >
          <FaPlus className="text-xs" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Base Domain Input Helper */}
      <div className="p-4 bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-sm shrink-0">
            <FaGlobe />
          </span>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              Dine-In QR Base Domain
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-sans">
              Domain prefixed to customer QR code scan targets.
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="e.g. https://bigbite.pk"
            className="flex-1 p-2.5 bg-[var(--input-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl text-xs font-mono outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleSaveBaseUrl}
            className="btn-brand-cta px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none shrink-0 active:scale-95"
          >
            <FaSave className="text-xs" />
            <span>Save URL</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
          Loading Tables & QR Codes...
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] p-12 text-center shadow-sm">
          <FaQrcode className="text-3xl text-[var(--text-muted)] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Tables Configured</h4>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Create your first table using the button above to generate a scannable dine-in QR code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tables.map((table) => {
            const base = qrBaseUrl || window.location.origin;
            const qrValue = `${base}/?mode=dine_in&table=${encodeURIComponent(table.table_name)}`;
            const isActive = Number(table.status) === 1;

            return (
              <div
                key={table.id}
                className={`bg-[var(--panel-bg)] rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-200 shadow-sm relative ${
                  isActive
                    ? "border-[var(--border-subtle)] hover:border-amber-500/30"
                    : "border-[var(--border-subtle)] opacity-60"
                }`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold text-xs font-mono">
                        #{table.id}
                      </span>
                      <span className="font-extrabold text-sm text-[var(--text-primary)] block">
                        {table.table_name}
                      </span>
                    </div>
                  </div>

                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(table.id)}
                    className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30 hover:bg-neutral-500/25"
                    }`}
                    title={isActive ? "Deactivate Table" : "Activate Table"}
                  >
                    {isActive ? "Active" : "Disabled"}
                  </button>
                </div>

                {/* Framed QR Code Center */}
                <div className="bg-white p-4 rounded-2xl mx-auto shadow-md border-4 border-black/10 dark:border-black/30 flex items-center justify-center">
                  <QRCodeCanvas
                    value={qrValue}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={false}
                    ref={(el) => (qrRefs.current[table.id] = el)}
                  />
                </div>

                {/* URL Chip with 1-click Copy */}
                <div className="bg-[var(--input-bg)] p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono truncate max-w-[170px]">
                    {qrValue}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyQrLink(qrValue)}
                    className="p-1 text-[var(--text-muted)] hover:text-amber-500 bg-transparent border-none cursor-pointer transition-colors shrink-0"
                    title="Copy QR Link"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => downloadQR(table.id, table.table_name)}
                    className="flex-1 py-2 rounded-xl bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                  >
                    <FaDownload className="text-[11px]" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(table.id, table.table_name)}
                    className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
                    title="Delete Table"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--admin-panel,#171717)] border border-[var(--admin-border,rgba(255,255,255,0.08))] rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-[var(--admin-border,rgba(255,255,255,0.06))]">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h3 className="m-0 text-base sm:text-lg font-black text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                  Add Restaurant Table
                </h3>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--admin-muted,#888)] hover:text-white flex items-center justify-center border-none cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                  Table Name or Number *
                </label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 01, VIP Terrace A"
                  className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-[var(--admin-muted,#888)] uppercase tracking-wider block mb-1.5">
                  Seating Capacity (Guests)
                </label>
                <select
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option className="bg-[#171717]" value="2">2 Persons (Couple Table)</option>
                  <option className="bg-[#171717]" value="4">4 Persons (Standard Table)</option>
                  <option className="bg-[#171717]" value="6">6 Persons (Family Table)</option>
                  <option className="bg-[#171717]" value="8">8 Persons (Large Group)</option>
                  <option className="bg-[#171717]" value="12">12+ Persons (VIP Lounge)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--admin-border,rgba(255,255,255,0.06))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[var(--admin-muted,#888)] hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer flex items-center gap-2"
                >
                  <FaPlus className="text-xs" />
                  <span>Create Table</span>
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
