import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function AddonGroupCard({
  mapGroup,
  openModal,
  handleDelete,
}) {
  return (
    <div className="bg-[var(--panel-bg,#1a1a1a)] border border-[#333] p-5 rounded-lg shadow-lg relative">
      <div className="flex justify-between items-start mb-4 border-b border-[#333] pb-3">
        <div>
          <span className="text-gray-400 text-xs uppercase tracking-widest block mb-1">
            Target Category
          </span>
          <h3 className="text-xl font-bold text-white m-0">
            {mapGroup.target_category}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal(mapGroup)}
            className="text-blue-400 hover:text-blue-300 bg-transparent border-none cursor-pointer p-1"
            title="Edit Mapping"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(mapGroup.target_category)}
            className="text-red-500 hover:text-red-400 bg-transparent border-none cursor-pointer p-1"
            title="Delete Mapping"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div>
        <strong className="text-white text-sm mb-2 block">
          Available Addon Categories:
        </strong>
        {mapGroup.addons && mapGroup.addons.length > 0 ? (
          <div className="flex flex-col gap-2">
            {mapGroup.addons.map((a, i) => (
              <React.Fragment key={i}>
                <div className="bg-[#222] border border-[#444] p-2 rounded text-sm flex justify-between items-center">
                  <span className="font-bold text-white">
                    {a.addon_category}
                  </span>
                  <div className="text-xs text-gray-400 text-right">
                    <span className={a.is_required ? "text-red-400" : ""}>
                      {a.is_required ? "Required" : "Optional"}
                    </span>
                    <br />
                    <span>
                      {a.selection_type === "single_choice"
                        ? "Single Choice"
                        : "Multiple Choice"}
                    </span>
                  </div>
                </div>
                {a.custom_label && (
                  <div className="text-xs text-gray-500 mt-1 italic pl-2 border-l-2 border-[#555]">
                    Label: {a.custom_label}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-sm">No addons mapped.</span>
        )}
      </div>
    </div>
  );
}
