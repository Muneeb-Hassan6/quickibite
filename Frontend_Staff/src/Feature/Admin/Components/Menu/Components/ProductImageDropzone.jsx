import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function ProductImageDropzone({
  menuForm,
  fileInputRef,
  handleImageChange,
}) {
  return (
    <div>
      <label className="text-xs text-[var(--admin-muted,#888)] font-extrabold uppercase tracking-wider mb-2 block">
        Product Image
      </label>
      <div
        className="border-2 border-dashed border-[var(--admin-border,rgba(255,255,255,0.12))] rounded-2xl h-44 sm:h-52 flex flex-col justify-center items-center cursor-pointer overflow-hidden relative bg-white/[0.02] hover:border-amber-400 hover:bg-amber-400/5 transition-all group shadow-inner"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageChange}
        />
        {menuForm.img ? (
          <>
            <img
              src={
                typeof menuForm.img === "string"
                  ? menuForm.img
                  : URL.createObjectURL(menuForm.img)
              }
              alt="Preview"
              className="w-full h-full object-contain p-3"
            />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col justify-center items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCloudUploadAlt size={30} className="text-amber-400" />
              <span className="text-xs font-bold mt-2">Change Image</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--admin-muted,#888)] p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FaCloudUploadAlt className="text-xl" />
            </div>
            <p className="m-0 font-bold text-xs text-[var(--admin-text,#fff)]">
              Click to upload image
            </p>
            <span className="text-[10px] mt-1 text-[var(--admin-muted,#888)]">
              PNG, JPG or WebP (transparent recommended)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
