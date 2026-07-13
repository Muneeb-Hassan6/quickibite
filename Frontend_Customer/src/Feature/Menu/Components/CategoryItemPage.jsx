import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    <div className="w-full px-[0.937rem] md:px-12 py-6">
      <h2 className="text-[var(--text-main,#fff)] uppercase font-[800] tracking-[1px] font-['Oswald',sans-serif] text-[1.5rem] mb-[0.937rem] border-l-[0.25rem] pl-[0.75rem] md:text-[2rem] md:mb-[1.562rem] md:border-l-[0.376rem] md:pl-[0.938rem] border-[var(--brand-red,#ef4444)]">
        {decodedCat === "All" ? "Full Menu" : decodedCat}
      </h2>

      {/* 🔥 LOADING STATE */}
      {isLoading ? (
        <div className="flex justify-center py-[3.125rem]">
          <div className="flex items-center gap-2">
            <div className="w-[0.75rem] h-[0.75rem] bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-[0.75rem] h-[0.75rem] bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
            <div className="w-[0.75rem] h-[0.75rem] bg-red-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
          </div>
        </div>
      ) : (
        /* Grid Row */
        <div className="flex flex-wrap -mx-[0.625rem] justify-center">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="w-1/2 md:w-1/3 lg:w-1/4 px-[0.625rem] mb-4">
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
            <div className="w-full text-center mt-12">
              <p className="text-white text-2xl">
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
