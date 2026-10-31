import React from 'react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavigationBar } from './AndroidNavigationBar';
import { ConnectionStatus } from '../types';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  status: ConnectionStatus;
  onHomeClick?: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  status,
  onHomeClick,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-6 bg-gradient-to-br from-[#020704] via-[#050f09] to-[#020503] relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#00E676]/10 blur-[140px] pointer-events-none -bottom-20 -right-20" />

      {/* Hardware Buttons on Phone Edges */}
      <div className="relative flex items-center justify-center w-full max-w-[400px]">
        {/* Left Volume Buttons */}
        <div className="hidden sm:block absolute -left-[14px] top-28 w-[4px] h-14 bg-[#1e3326] rounded-l-sm shadow-md" />
        <div className="hidden sm:block absolute -left-[14px] top-48 w-[4px] h-14 bg-[#1e3326] rounded-l-sm shadow-md" />
        {/* Right Power Button */}
        <div className="hidden sm:block absolute -right-[14px] top-36 w-[4px] h-16 bg-[#1e3326] rounded-r-sm shadow-md" />

        {/* Physical Android Phone Chassis */}
        <div className="w-full max-w-[390px] h-[844px] max-h-[96vh] rounded-[48px] border-[10px] border-[#182a1f] ring-1 ring-emerald-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(0,230,118,0.2)] bg-[#060e09] flex flex-col relative overflow-hidden select-none">
          {/* Top Speaker Ear-piece */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-[#112017] z-50 pointer-events-none" />

          {/* Front Camera Punch Hole */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#1e3827] flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
            </div>
          </div>

          {/* Android Status Bar */}
          <div className="pt-2 z-40 bg-[#060e09]">
            <AndroidStatusBar status={status} />
          </div>

          {/* Screen Display Area (Scrollable content) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#060e09]">
            {children}
          </div>

          {/* Android Navigation Gesture Bar */}
          <div className="z-40 bg-[#060e09]">
            <AndroidNavigationBar onHomeClick={onHomeClick} />
          </div>
        </div>
      </div>
    </div>
  );
};
