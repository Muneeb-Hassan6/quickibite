import React from "react";
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { optimizeCloudinaryImage } from "../../../utils/imageOptimizer";

const SearchBar = ({ searchTerm, setSearchTerm, searchResults, showDropdown, setShowDropdown, searchBoxRef, onFilterOpen }) => {
    return (
        <div className="flex gap-[0.625rem] lg:gap-[0.938rem] items-center mb-[1.25rem] lg:mb-[2.188rem] sticky top-[3.125rem] lg:top-0 z-[900] bg-[rgba(5,5,5,0.9)] backdrop-blur-[0.625rem] py-[0.937rem] border-b border-[rgba(255,255,255,0.02)]">
            <button className="lg:hidden bg-gradient-to-br from-[#ef4444] to-[#c62828] text-white border-none px-[0.75rem] min-[23.813rem]:px-[1.125rem] h-[2.625rem] min-[23.813rem]:h-[2.812rem] rounded-[1.563rem] font-[800] text-[0.812rem] min-[23.813rem]:text-[0.875rem] flex items-center gap-[0.5rem] cursor-pointer whitespace-nowrap shadow-[0_4px_15px_rgba(239,68,68,0.4)]" onClick={onFilterOpen}>
                <FaFilter />
            </button>

            <div className="flex-1 flex items-center bg-[var(--panel-bg,rgba(20,20,20,0.8))] backdrop-blur-[0.625rem] border border-[var(--border-color,#333)] rounded-[1.875rem] p-[0.375rem_0.937rem] transition-all duration-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] w-full box-border focus-within:border-[var(--brand-red,#ef4444)] focus-within:shadow-[0_0_15px_rgba(239,68,68,0.25),inset_0_2px_5px_rgba(0,0,0,0.5)] focus-within:bg-[var(--bg-body,#1a1a1a)] relative" ref={searchBoxRef}>
                <div className="flex items-center w-full flex-1 h-[2.625rem] min-[23.813rem]:h-[2.812rem] lg:h-auto px-[0.937rem] lg:px-0 rounded-[1.563rem] lg:rounded-none">
                    {/* 🔥 CLASS THEEK KAR DI */}
                    <FaSearch className="static float-none block text-[#ef4444] text-[1rem] min-w-[1rem] mr-[0.75rem] ml-[0.313rem] transform-none" />
                    <input
                        type="text"
                        placeholder="Search burgers, pizzas..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        className="flex-1 bg-transparent border-none text-[var(--text-main,#fff)] text-[0.937rem] outline-none tracking-[0.5px] w-full placeholder:text-[#666] placeholder:font-[500]" /* 🔥 YAHAN BHI CLASS WAPIS AAGAYI */
                    />
                    {searchTerm && <FaTimes className="static text-[#666] cursor-pointer text-[1rem] ml-[0.625rem] transition-all duration-300 hover:text-[var(--brand-red,#ef4444)] hover:rotate-90" onClick={() => { setSearchTerm(""); setShowDropdown(false); }} />}
                </div>

                {showDropdown && searchTerm && searchResults.length > 0 && (
                    <div className="absolute top-[calc(100%+0.625rem)] left-0 w-full bg-[rgba(15,15,15,0.95)] backdrop-blur-[0.937rem] border border-[var(--border-color,#333)] rounded-[1rem] shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(239,68,68,0.1)] z-[9999] overflow-hidden animate-slide-up">
                        {searchResults.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center gap-[0.937rem] p-[0.75rem_0.937rem] cursor-pointer border-b border-[var(--border-color,#333)] transition-all duration-200 ease-in last:border-b-0 hover:bg-[rgba(239,68,68,0.15)]" onClick={() => { setSearchTerm(item.name); setShowDropdown(false); }}>
                                <img className="w-[2.812rem] h-[2.812rem] rounded-[0.5rem] object-cover border border-[var(--border-color,#333)]" src={optimizeCloudinaryImage(item.img || "https://placehold.co/100x100", 100)} alt={item.name} />
                                <div className="flex flex-col"><span className="text-[var(--text-main,#fff)] text-[0.875rem] font-[700] m-[0_0_0.25rem]">{item.name}</span><span className="text-[var(--brand-red,#ef4444)] text-[0.812rem] font-[800]">Rs {item.price}</span></div>
                            </div>
                        ))}
                        {searchResults.length > 5 && (
                            <div className="p-[0.75rem] text-center text-[0.812rem] font-bold color-[var(--text-muted,#aaaaaa)] bg-[var(--bg-body,#111111)] cursor-pointer hover:color-[var(--brand-red,#ef4444)] hover:bg-[var(--panel-bg,#1a1a1a)]" onClick={() => setShowDropdown(false)}>
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