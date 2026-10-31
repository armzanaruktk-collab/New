import React from 'react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavigationBar } from './AndroidNavigationBar';
import { ConnectionStatus } from '../types';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  status: ConnectionStatus;
  onHomeClick?: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  bottomBar,
  status,
  onHomeClick,
}) => {
  return (
    <div className="w-full h-screen min-h-screen flex flex-col bg-[#040805] text-gray-100 select-none overflow-hidden relative">
      {/* Fullscreen Mobile Viewport Container */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#060e09] relative shadow-2xl overflow-hidden">
        {/* Top Android Status Bar */}
        <div className="shrink-0 z-30 bg-[#060e09] border-b border-emerald-950/40">
          <AndroidStatusBar status={status} />
        </div>

        {/* Scrollable Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col px-3.5 py-2">
          {children}
        </div>

        {/* Fixed Bottom Navigation Bar (Docked at bottom, does not scroll away) */}
        {bottomBar && (
          <div className="shrink-0 z-30">
            {bottomBar}
          </div>
        )}

        {/* Bottom Android Gesture Navigation Bar */}
        <div className="shrink-0 z-30 bg-[#060e09]">
          <AndroidNavigationBar onHomeClick={onHomeClick} />
        </div>
      </div>
    </div>
  );
};
