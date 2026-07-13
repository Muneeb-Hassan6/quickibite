import React from "react";
import { FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = ({ isDesktop, isOpen, onClose, categories, activeCategory, expandedCategory, menuItems, onCategoryClick, onProductClick }) => {
    const renderList = (isDesktopMode) => categories.map((cat) => {
        const isExpanded = expandedCategory === cat;
        const isActive = activeCategory === cat;
        const catItems = menuItems.filter((item) => item.category === cat);

        // Desktop vs Mobile specific classes
        const desktopBtnBase = "border-l-[0.188rem] border-transparent transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:pl-[1.5rem] hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent)] hover:text-[var(--text-main)]";
        const desktopBtnActive = isActive ? "pl-[1.5rem] [text-shadow:0_0_10px_rgba(211,47,47,0.3)] bg-[linear-gradient(135deg,rgba(211,47,47,0.15),rgba(211,47,47,0.05))] text-[var(--brand-red,#d32f2f)] font-[800] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[0.313rem] before:h-[60%] before:bg-[var(--brand-yellow,#fbc02d)] before:rounded-[0_0.313rem_0.313rem_0] before:shadow-[0_0_10px_var(--brand-yellow,#fbc02d)]" : "text-[var(--text-muted)]";
        
        const mobileBtnBase = "border border-[var(--border-color)] bg-[var(--home-bg)] hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent)] hover:text-[var(--text-main)] transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]";
        const mobileBtnActive = isActive ? "bg-[linear-gradient(135deg,var(--brand-red,#d32f2f),var(--brand-red-dark,#9a0007))] text-white border-transparent shadow-[0_5px_15px_rgba(211,47,47,0.4)] -translate-y-[2px] font-[800]" : "text-[var(--text-muted)]";

        const btnClass = isDesktopMode 
            ? `bg-transparent border-none flex justify-between items-center w-full p-[0.875rem_1.125rem] text-[0.937rem] font-[600] rounded-[0.75rem] cursor-pointer relative overflow-hidden group/btn ${desktopBtnBase} ${desktopBtnActive}`
            : `flex justify-between items-center w-full p-[0.875rem_1.125rem] text-[0.937rem] font-[600] rounded-[0.75rem] cursor-pointer relative overflow-hidden group/btn ${mobileBtnBase} ${mobileBtnActive}`;

        return (
            <div key={cat} className="flex flex-col">
                <button className={btnClass} onClick={() => onCategoryClick(cat)}>
                    {/* 🔥 Spans add kiye hain theek alignment ke liye */}
                    <span className="flex-1 text-left">{cat}</span>
                    {catItems.length > 0 && (
                        <span className={`transition-transform duration-300 flex items-center ${isActive && isDesktopMode ? 'text-[var(--brand-red,#d32f2f)]' : isActive && !isDesktopMode ? 'text-white' : 'text-[#666]'}`}>
                            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                    )}
                </button>

                {isExpanded && catItems.length > 0 && (
                    <div className="flex flex-col p-[0.5rem_0_0.625rem_1.25rem] gap-[0.5rem] border-l-[2px] border-[var(--border-color)] ml-[0.937rem] mb-[0.625rem] animate-slide-down origin-top">
                        {catItems.map(item => (
                            <div key={item.id} className="text-[var(--text-muted)] text-[0.812rem] font-[500] cursor-pointer transition-all duration-300 flex items-center gap-[0.5rem] py-[0.25rem] hover:text-[var(--text-main)] hover:translate-x-[0.313rem] group/item" onClick={() => onProductClick(item.name)}>
                                <span className="w-[0.313rem] h-[0.313rem] bg-[var(--border-color)] rounded-full transition-all duration-300 group-hover/item:bg-[var(--brand-yellow,#fbc02d)] group-hover/item:shadow-[0_0_8px_var(--brand-yellow,#fbc02d)]"></span>{item.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    });

    if (isDesktop) return (
        <div className="w-[16.875rem] bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-[1.25rem] p-[1.563rem_1.25rem] h-full overflow-y-auto shrink-0 box-border shadow-[0_15px_35px_rgba(0,0,0,0.2),inset_0_2px_5px_rgba(255,255,255,0.02)] [&::-webkit-scrollbar]:w-[0.25rem] [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-[0.625rem]">
            <h3 className="font-['Oswald',sans-serif] text-[1.5rem] font-[800] text-[var(--text-main)] mb-[1.563rem] border-b border-dashed border-[var(--border-color)] pb-[0.937rem] uppercase tracking-[1px]">Categories</h3>
            <div className="flex flex-col gap-[0.625rem]">{renderList(true)}</div>
        </div>
    );

    return (
        <div className={`fixed top-0 w-[18.75rem] h-full bg-[var(--panel-bg)] z-[10001] transition-left duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col border-r border-[var(--border-color)] ${isOpen ? "left-0" : "left-[-100%]"}`}>
            <div className="flex justify-between items-center p-[1.563rem_1.25rem] border-b border-[var(--border-color)] bg-[var(--home-bg)]">
                <h3 className="m-0 text-[var(--text-main)] font-['Oswald',sans-serif] text-[1.375rem] uppercase">Categories</h3>
                <FaTimes className="text-[#888] text-[1.375rem] cursor-pointer transition-all duration-300 hover:text-[var(--brand-red,#d32f2f)] hover:rotate-90" onClick={onClose} />
            </div>
            <div className="p-[1.25rem_0.937rem] overflow-y-auto flex flex-col gap-[0.75rem]">{renderList(false)}</div>
        </div>
    );
};

export default Sidebar;