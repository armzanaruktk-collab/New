import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Shield, Bell } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface AndroidStatusBarProps {
  status: ConnectionStatus;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ status }) => {
  const [time, setTime] = useState('21:15');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#060e09] px-6 py-1.5 flex items-center justify-between text-gray-200 text-[11px] select-none">
      {/* Left: Clock & Notifications */}
      <div className="flex items-center space-x-2 font-medium tracking-tight">
        <span className="font-bold text-white text-[12px]">{time}</span>
        {status === 'connected' && (
          <Shield className="w-3.5 h-3.5 text-[#00E676] drop-shadow-[0_0_5px_#00E676]" />
        )}
        <Bell className="w-3 h-3 text-gray-400" />
      </div>

      {/* Right: Network VoLTE, Wi-Fi, Signal & Battery (27% as in user's screenshot) */}
      <div className="flex items-center space-x-1.5 font-medium text-[11px]">
        <Wifi className="w-3.5 h-3.5 text-white" />
        <Signal className="w-3.5 h-3.5 text-white" />
        <div className="flex items-center space-x-1 pl-0.5">
          <span className="text-[11px] text-gray-200 font-mono font-semibold">27%</span>
          <Battery className="w-4 h-4 text-emerald-400 rotate-90" />
        </div>
      </div>
    </div>
  );
};
