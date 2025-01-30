import React, { useEffect, useState } from 'react';

const Alert = ({ message, type = 'info', duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-black text-white',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="fixed md:mb-[0%] mb-[12%] bottom-4 left-1/2 transform -translate-x-1/2">
      <div
        className={`${alertStyles[type]} px-4 py-2 rounded-full shadow-lg flex items-center justify-center text-sm font-medium animate-fade-in`}
      >
        {message}
      </div>
    </div>
  );
};

export default Alert;