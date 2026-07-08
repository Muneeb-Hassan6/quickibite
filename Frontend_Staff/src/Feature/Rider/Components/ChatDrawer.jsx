import React from 'react';

const ChatDrawer = ({ isOpen, onClose, customerName, showAlert }) => {
    const quickReplies = ["I have arrived!", "Stuck in traffic, 5 mins.", "Please share exact location.", "I am outside."];

    const handleSend = (reply) => {
        showAlert(`Message sent to ${customerName}: "${reply}"`, "info");
        onClose();
    };

    return (
        <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
            <div className="chat-header">
                <h3 style={{ margin: 0 }}>Chat with {customerName}</h3>
                <button onClick={onClose} className="btn-close-chat">&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p className="chat-hint-text">Tap a quick reply to send</p>
                {quickReplies.map((reply, index) => (
                    <button key={index} onClick={() => handleSend(reply)} className="btn-quick-reply">
                        {reply}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatDrawer;