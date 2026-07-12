import React from "react";
import ProductCard from "../../../Components/UI/ProductCard";

const MenuContent = ({ searchTerm, searchResults, categories, menuItems }) => {
    const titleClasses = "font-['Oswald',sans-serif] text-[1.5rem] lg:text-[1.874rem] font-[800] text-[var(--text-main,#fff)] uppercase tracking-[1px] mb-[1.563rem] flex items-center before:content-[''] before:inline-block before:w-[0.313rem] lg:before:w-[0.375rem] before:h-[1.5rem] lg:before:h-[1.875rem] before:bg-[var(--brand-red,#ef4444)] before:mr-[0.937rem] before:rounded-[0.25rem] before:shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    const gridClasses = "grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-[0.625rem] min-[23.813rem]:gap-[0.937rem] lg:gap-[1.562rem]";

    if (searchTerm) {
        return (
            <div className="mb-[3.125rem] animate-[fadeIn_0.5s_ease-in-out]">
                <h3 className={titleClasses}>Results for: <span className="text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] ml-2">"{searchTerm}"</span></h3>
                {searchResults.length > 0 ? (
                    <div className={gridClasses}>
                        {searchResults.map((item) => (
                            <div id={`product-${item.name}`} key={item.id}>
                                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center text-[var(--text-muted,#888)] p-[5rem_1.25rem] bg-[var(--panel-bg,#111)] rounded-[1.25rem] border border-dashed border-[var(--border-color,#333)]"><h4 className="mb-[0.313rem] text-[var(--text-main,#fff)]">No food found.</h4></div>}
            </div>
        );
    }

    return categories.map((cat) => {
        const items = menuItems.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
            <div key={cat} id={cat} className="mb-[3.125rem] animate-[fadeIn_0.5s_ease-in-out]">
                <h3 className={titleClasses}>{cat}</h3>
                <div className={gridClasses}>
                    {items.map((item) => (
                        <div id={`product-${item.name}`} key={item.id}>
                            <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                        </div>
                    ))}
                </div>
            </div>
        );
    });
};

export default MenuContent;