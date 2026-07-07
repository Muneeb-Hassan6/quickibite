import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// 🔥 Local static data (foodMenu) ko remove kar diya hai
import PopupCard from "../../../Components/UI/PopupCard";

const CategoryItemGrid = () => {
  const { categoryName } = useParams();
  const decodedCat = decodeURIComponent(categoryName);

  // --- STATES ---
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA FROM API ---
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE}/get_menu.php`,
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          // Sirf available items ko state mein save karein
          const availableItems = data.filter(
            (item) => item.isAvailable === true,
          );
          setMenuItems(availableItems);
        }
      } catch (error) {
        console.error("Error fetching category items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredItems =
    decodedCat === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category?.toLowerCase() === decodedCat.toLowerCase(),
        );

  return (
    <div className="container-fluid px-3 px-md-5 py-4">
      <h2 className="page-title">
        {decodedCat === "All" ? "Full Menu" : decodedCat}
      </h2>

      {/* 🔥 LOADING STATE */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "50px 0",
          }}
        >
          <div className="dot-loader">
            <div
              className="dot"
              style={{ width: "12px", height: "12px" }}
            ></div>
            <div
              className="dot"
              style={{ width: "12px", height: "12px" }}
            ></div>
            <div
              className="dot"
              style={{ width: "12px", height: "12px" }}
            ></div>
          </div>
        </div>
      ) : (
        /* Grid Row */
        <div className="row g-2 g-md-3 g-lg-4 justify-content-center">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="col-6 col-md-4 col-lg-3">
                <PopupCard
                  item={item}
                  image={item.img}
                  title={item.name} /* 🔥 DB field 'name' */
                  description={item.description} /* 🔥 DB field 'description' */
                  price={item.price}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center mt-5">
              <p className="text-white fs-4">
                No items found for "{decodedCat}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryItemGrid;
