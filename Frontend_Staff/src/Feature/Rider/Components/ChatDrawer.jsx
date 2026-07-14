import React from 'react';

const ChatDrawer = ({ isOpen, onClose, customerName, showAlert }) => {
    const quickReplies = ["I have arrived!", "Stuck in traffic, 5 mins.", "Please share exact location.", "I am outside."];

    const handleSend = (reply) => {
        showAlert(`Message sent to ${customerName}: "${reply}"`, "info");
        onClose();
    };

    return (
        <div className={`absolute left-0 w-full h-max min-h-[400px] bg-[var(--admin-bg)] rounded-t-[24px] transition-[bottom] duration-300 ease-in-out z-[9999] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] p-[25px] ${isOpen ? 'bottom-0' : 'bottom-[-100%]'}`}>
            <div className="flex justify-between items-center pb-[15px] mb-[20px] text-[var(--admin-text)] shadow-sm">
                <h3 className="font-semibold text-[20px] m-0 font-oswald">Chat with {customerName}</h3>
                <button onClick={onClose} className="bg-transparent border-none text-white cursor-pointer text-[24px] flex items-center justify-center transition-all duration-200 hover:text-[var(--admin-orange)] hover:scale-110">&times;</button>
            </div>
            <div className="flex flex-col">
                <p className="text-[var(--admin-muted)] text-[12px] text-center mb-[15px] m-0">Tap a quick reply to send</p>
                {quickReplies.map((reply, index) => (
                    <button key={index} onClick={() => handleSend(reply)} className="bg-[var(--admin-panel)] text-[var(--admin-text)] p-[15px] rounded-[12px] text-left flex justify-between items-center cursor-pointer mb-[10px] w-full font-medium text-[14px] transition-all duration-200 border-none shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] active:scale-[0.98]">
                        {reply}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatDrawer;