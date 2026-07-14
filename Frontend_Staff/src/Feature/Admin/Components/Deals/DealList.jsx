import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaPowerOff,
  FaClock,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";

const DealList = ({ onEdit }) => {
  const queryClient = useQueryClient();
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['admin_deals'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_admin_deals.php`);
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });

  // Deal ko On/Off (Active/Inactive) karna
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_deal_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, is_active: newStatus }),
        },
      );
      const data = await response.json();

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['admin_deals'] });
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: newStatus ? "Deal Activated" : "Deal Deactivated",
          showConfirmButton: false,
          timer: 1500,
          background: "#141414",
          color: "#fff",
        });
      }
    } catch (error) {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // Deal ko Delete karna
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#333",
      confirmButtonText: "Yes, delete it!",
      background: "#141414",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/delete_deal.php`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            },
          );
          const data = await response.json();
          if (data.success) {
            Swal.fire("Deleted!", "Your deal has been deleted.", "success");
            queryClient.invalidateQueries({ queryKey: ['admin_deals'] });
          } else {
            Swal.fire("Error", "Could not delete deal", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Could not delete deal", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div style={{ color: "var(--admin-muted)", textAlign: "center", padding: "40px" }}>
        Loading deals...
      </div>
    );

  return (
    <div className="animate-slide-up" style={{ marginTop: "20px" }}>
      <div
        style={{
          background: "var(--admin-panel)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "var(--admin-text)",
            textAlign: "left",
          }}
        >
          <thead
            style={{ background: "var(--admin-bg)", borderBottom: "2px solid var(--admin-border)" }}
          >
            <tr>
              <th style={{ padding: "15px" }}>Image</th>
              <th style={{ padding: "15px" }}>Title & Price</th>
              <th style={{ padding: "15px" }}>Type</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#777",
                  }}
                >
                  No deals found.
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr
                  key={deal.id}
                  style={{
                    borderBottom: "1px solid var(--admin-border)",
                    opacity: deal.is_active ? 1 : 0.5,
                    transition: "0.3s",
                  }}
                >
                  {/* 1. Image */}
                  <td style={{ padding: "15px" }}>
                    <img
                      src={deal.img || "https://placehold.co/100"}
                      alt="deal"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </td>

                  {/* 2. Title & Price */}
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                      {deal.title}
                    </div>
                    <div
                      style={{
                        color: "#ef4444",
                        fontWeight: "bold",
                        marginTop: "5px",
                      }}
                    >
                      Rs {deal.price}
                    </div>
                  </td>

                  {/* 3. Type (Permanent / Time-based) */}
                  <td className="p-[0.938rem] text-[var(--admin-text)]">
                    {deal.is_permanent ? (
                      <span className="inline-flex items-center gap-[0.313rem] bg-[rgba(34,197,94,0.1)] text-[#22c55e] px-[0.625rem] py-[0.313rem] rounded-[1.25rem] text-[0.75rem] font-bold">
                        <FaCheckCircle /> Permanent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-[0.313rem] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] px-[0.625rem] py-[0.313rem] rounded-[1.25rem] text-[0.75rem] font-bold">
                        <FaClock /> {deal.start_time?.slice(0, 5)} - {deal.end_time?.slice(0, 5)}
                      </span>
                    )}
                  </td>

                  {/* 4. Status (Active / Inactive Toggle) */}
                  <td className="p-[0.938rem] text-center">
                    <button
                      onClick={() => handleToggleStatus(deal.id, deal.is_active)}
                      className={`inline-flex items-center justify-center gap-[0.313rem] border-none px-[0.938rem] py-[0.5rem] rounded-[0.5rem] cursor-pointer font-bold w-[6.25rem] transition-all duration-300 ${deal.is_active ? "bg-[rgba(34,197,94,0.2)] text-[#22c55e]" : "bg-[rgba(239,68,68,0.2)] text-[#ef4444]"}`}
                    >
                      <FaPowerOff /> {deal.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* 5. Actions (Edit & Delete) */}
                  <td className="p-[0.938rem]">
                    <div className="flex justify-center items-center gap-[0.938rem] h-full">
                      {/* 🔥 VIP Edit Button */}
                      <button
                        onClick={() => onEdit(deal)}
                        className="bg-transparent border-none text-[#3b82f6] text-[1.125rem] cursor-pointer transition-all duration-200 hover:-translate-y-[1px]"
                        title="Edit Deal"
                      >
                        <FaEdit />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="bg-transparent border-none text-[#ef4444] text-[1.125rem] cursor-pointer transition-all duration-200 hover:-translate-y-[1px]"
                        title="Delete Deal"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealList;
