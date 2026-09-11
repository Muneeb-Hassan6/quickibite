import React from "react";
import { FaTimes, FaDownload, FaCopy } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

export default function TableQRCodeModal({
  isOpen,
  onClose,
  table,
  qrBaseUrl,
  downloadQR,
  copyQrLink,
}) {
  if (!isOpen || !table) return null;

  const base = qrBaseUrl || window.location.origin;
  const qrValue = `${base}/?mode=dine_in&table=${encodeURIComponent(
    table.table_name
  )}`;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="bg-[var(--panel-bg)] border border-[var(--border-subtle)] w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl relative text-[var(--text-primary)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-sm font-black uppercase tracking-wider font-['Oswald',sans-serif]">
              {table.table_name} QR Code
            </h3>
          </div>
          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-[var(--input-bg)] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[var(--text-secondary)] flex items-center justify-center border-none cursor-pointer"
            onClick={onClose}
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl mx-auto shadow-md border-4 border-black/10 dark:border-black/30 flex items-center justify-center my-3 max-w-[180px]">
          <QRCodeCanvas
            value={qrValue}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-center text-[var(--text-secondary)] font-mono break-all my-3 p-2 bg-[var(--input-bg)] rounded-xl border border-[var(--border-subtle)]">
          {qrValue}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => copyQrLink(qrValue)}
            className="flex-1 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--border-subtle)]"
          >
            <FaCopy className="text-xs" />
            <span>Copy URL</span>
          </button>
          <button
            type="button"
            onClick={() => downloadQR(table.id, table.table_name)}
            className="flex-1 py-2.5 rounded-xl btn-brand-cta text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            <FaDownload className="text-xs" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
