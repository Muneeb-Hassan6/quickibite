import React from "react";
import ProductCard from "../../../Components/UI/ProductCard";
// import "../styles/MenuContent.css";

const MenuContent = ({ searchTerm, searchResults, categories, menuItems }) => {
    if (searchTerm) {
        return (
            <div className="menu-section">
                <h3 className="menu-section-title">Results for: <span className="text-red">"{searchTerm}"</span></h3>
                {searchResults.length > 0 ? (
                    <div className="menu-grid">
                        {searchResults.map((item) => (
                            <div id={`product-${item.name}`} key={item.id}>
                                <ProductCard item={item} image={item.img} title={item.name} description={item.description} price={item.price} isTopDeal={item.isTopDeal} isBestSeller={item.isBestSeller} />
                            </div>
                        ))}
                    </div>
                ) : <div className="empty-search-msg"><h4>No food found.</h4></div>}
            </div>
        );
    }

    return categories.map((cat) => {
        const items = menuItems.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
            <div key={cat} id={cat} className="menu-section">
                <h3 className="menu-section-title">{cat}</h3>
                <div className="menu-grid">
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