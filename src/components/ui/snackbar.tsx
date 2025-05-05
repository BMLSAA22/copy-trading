import React, { useState, useEffect } from 'react';

const Snackbar = ({ message, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    return (
        isVisible && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-md shadow-md">
                <span>{message}</span>
            </div>
        )
    );
};

export default Snackbar;
