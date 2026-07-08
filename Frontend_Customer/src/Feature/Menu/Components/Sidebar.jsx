import React from "react";
import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../styles/Sidebar.css";

const Sidebar = ({ isDesktop, isOpen, onClose, categories, activeCategory, expandedCategory, menuItems, onCategoryClick, onProductClick }) => {
    const renderList = () => categories.map((cat) => {
        const isExpanded = expandedCategory === cat;
        const catItems = menuItems.filter((item) => item.category === cat);

        return (
            <div key={cat} className="sidebar-accordion-wrapper">
                <button className={`cat-btn ${activeCategory === cat ? "active" : ""}`} onClick={() => onCategoryClick(cat)}>
                    {/* 🔥 Spans add kiye hain theek alignment ke liye */}
                    <span className="sidebar-cat-name">{cat}</span>
                    {catItems.length > 0 && (
                        <span className="sidebar-cat-icon">
                            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                    )}
                </button>

                {isExpanded && catItems.length > 0 && (
                    <div className="sidebar-sub-menu animate-slide-down">
                        {catItems.map(item => (
                            <div key={item.id} className="sidebar-sub-item" onClick={() => onProductClick(item.name)}>
                                <span className="sub-item-dot"></span>{item.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    });

    if (isDesktop) return (
        <div className="desktop-sidebar">
            <h3 className="sidebar-title">Categories</h3>
            <div className="cat-list">{renderList()}</div>
        </div>
    );

    return (
        <div className={`mobile-sidebar-drawer ${isOpen ? "open" : ""}`}>
            <div className="drawer-header">
                <h3>Categories</h3>
                <FaTimes className="close-icon" onClick={onClose} />
            </div>
            <div className="drawer-content">{renderList()}</div>
        </div>
    );
};

export default Sidebar;