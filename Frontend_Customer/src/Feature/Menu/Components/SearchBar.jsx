import React from "react";
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";
import "../styles/SearchBar.css";

const SearchBar = ({ searchTerm, setSearchTerm, searchResults, showDropdown, setShowDropdown, searchBoxRef, onFilterOpen }) => {
    return (
        <div className="search-filter-row">
            <button className="mobile-filter-btn d-lg-none" onClick={onFilterOpen}>
                <FaFilter />
            </button>

            <div className="premium-search-container" ref={searchBoxRef}>
                <div className="premium-search-box">
                    {/* 🔥 CLASS THEEK KAR DI */}
                    <FaSearch className="premium-search-icon" />
                    <input
                        type="text"
                        placeholder="Search burgers, pizzas..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        className="premium-search-input" /* 🔥 YAHAN BHI CLASS WAPIS AAGAYI */
                    />
                    {searchTerm && <FaTimes className="premium-clear-icon" onClick={() => { setSearchTerm(""); setShowDropdown(false); }} />}
                </div>

                {showDropdown && searchTerm && searchResults.length > 0 && (
                    <div className="search-dropdown-menu animate-slide-up">
                        {searchResults.slice(0, 5).map((item) => (
                            <div key={item.id} className="search-dropdown-item" onClick={() => { setSearchTerm(item.name); setShowDropdown(false); }}>
                                <img src={optimizeCloudinaryImage(item.img || "https://placehold.co/100x100", 100)} alt={item.name} />
                                <div className="sd-info"><span className="sd-name">{item.name}</span><span className="sd-price">Rs {item.price}</span></div>
                            </div>
                        ))}
                        {searchResults.length > 5 && (
                            <div className="search-dropdown-footer" onClick={() => setShowDropdown(false)}>
                                See all {searchResults.length} results...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;