import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export default function usePosMenu({ terminalResetTrigger = 0 } = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Settings Query
  const { data: settingsData = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const data = await response.json();
      return data.status === "success" ? data.data : {};
    },
  });

  const gstRate = parseFloat(settingsData?.tax) || 0;
  const deliveryFee = parseFloat(settingsData?.delivery_charges) || 0;

  // Menu Query
  const { data: menuData = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_menu.php`
      );
      return await response.json();
    },
  });

  // Reset Terminal on Trigger
  useEffect(() => {
    if (terminalResetTrigger > 0) {
      setSearchTerm("");
      setSelectedCategory(null);
    }
  }, [terminalResetTrigger]);

  // Format Menu Items & Categories
  const { menuItems, categories } = useMemo(() => {
    if (!Array.isArray(menuData) || menuData.length === 0) {
      return { menuItems: [], categories: ["All"] };
    }

    const items = menuData
      .filter((item) => item.isAvailable)
      .map((item) => ({
        id: item.id,
        title: item.name,
        name: item.name,
        category: item.category || "Uncategorized",
        img: item.img || "",
        variants: item.variants || [],
        price:
          item.variants && item.variants.length > 0
            ? parseFloat(item.variants[0].price)
            : parseFloat(item.price),
      }));

    const uniqueCategories = [
      "All",
      ...new Set(items.map((i) => i.category).filter(Boolean)),
    ];

    return { menuItems: items, categories: uniqueCategories };
  }, [menuData]);

  // Derived Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const isNotAddon = item.category.toLowerCase() !== "add-ons";
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (searchTerm.trim() !== "") {
        return matchesSearch && isNotAddon;
      }

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesCategory && isNotAddon;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    gstRate,
    deliveryFee,
    menuItems,
    categories,
    filteredItems,
    isMenuLoading,
    isSearching: searchTerm.trim() !== "",
    isDrilldown: selectedCategory !== null,
  };
}
