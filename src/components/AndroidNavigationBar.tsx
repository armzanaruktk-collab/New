import React from 'react';

interface AndroidNavigationBarProps {
  onHomeClick?: () => void;
}

export const AndroidNavigationBar: React.FC<AndroidNavigationBarProps> = ({ onHomeClick }) => {
  return (
    <div className="w-full bg-[#040906] py-1.5 flex items-center justify-center select-none border-t border-emerald-950/40">
      {/* Android Gesture Pill Bar */}
      <div
        onClick={onHomeClick}
        className="w-28 h-1 rounded-full bg-gray-500/60 hover:bg-[#00E676] transition-colors cursor-pointer"
        title="แถบควบคุม Android (Home)"
      />
    </div>
  );
};
