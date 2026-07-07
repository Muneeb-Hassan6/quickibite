import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  FaTrash,
  FaPowerOff,
  FaClock,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";

const DealList = ({ onEdit }) => {
  // 🔥 onEdit prop receive kia hy
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Database se saari deals lana
  const fetchAdminDeals = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_admin_deals.php`,
      );
      const data = await response.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDeals();
  }, []);

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
        setDeals(
          deals.map((deal) =>
            deal.id === id ? { ...deal, is_active: newStatus } : deal,
          ),
        );
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
            setDeals(deals.filter((deal) => deal.id !== id));
            Swal.fire({
              title: "Deleted!",
              text: "Deal has been removed.",
              icon: "success",
              background: "#141414",
              color: "#fff",
            });
          }
        } catch (error) {
          Swal.fire("Error", "Could not delete deal", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div style={{ color: "#fff", textAlign: "center", padding: "40px" }}>
        Loading deals...
      </div>
    );

  return (
    <div className="animate-slide-up" style={{ marginTop: "20px" }}>
      <div
        style={{
          background: "#111",
          borderRadius: "12px",
          border: "1px solid #2a2a2a",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#fff",
            textAlign: "left",
          }}
        >
          <thead
            style={{ background: "#1a1a1a", borderBottom: "2px solid #333" }}
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
                    borderBottom: "1px solid #222",
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
                  <td style={{ padding: "15px" }}>
                    {deal.is_permanent ? (
                      <span
                        style={{
                          background: "rgba(34, 197, 94, 0.1)",
                          color: "#22c55e",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        <FaCheckCircle /> Permanent
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          color: "#f59e0b",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        <FaClock /> {deal.start_time?.slice(0, 5)} -{" "}
                        {deal.end_time?.slice(0, 5)}
                      </span>
                    )}
                  </td>

                  {/* 4. Status (Active / Inactive Toggle) */}
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button
                      onClick={() =>
                        handleToggleStatus(deal.id, deal.is_active)
                      }
                      style={{
                        background: deal.is_active
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                        color: deal.is_active ? "#22c55e" : "#ef4444",
                        border: "none",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        width: "100px",
                        transition: "0.3s",
                      }}
                    >
                      <FaPowerOff style={{ marginRight: "5px" }} />{" "}
                      {deal.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* 5. Actions (Edit & Delete) */}
                  <td
                    style={{
                      padding: "15px",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {/* 🔥 VIP Edit Button */}
                    <button
                      onClick={() => onEdit(deal)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#3b82f6",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                      title="Edit Deal"
                    >
                      <FaEdit />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(deal.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "18px",
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                      title="Delete Deal"
                    >
                      <FaTrash />
                    </button>
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
