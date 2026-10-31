import React from 'react';
import { Shield, Settings, Terminal, FileCode, HelpCircle } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  currentScreen: 'main' | 'new_connection' | 'payload_manager' | 'settings';
  onNavigate: (screen: 'main' | 'new_connection' | 'payload_manager' | 'settings') => void;
  showLogs: boolean;
  onToggleLogs: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  currentScreen,
  onNavigate,
  showLogs,
  onToggleLogs,
  onOpenHelp,
}) => {
  return (
    <header className="bg-[#1E1E1E] border-b border-[#2C2C2C] sticky top-0 z-40 select-none shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onNavigate('main')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#000000] border border-[#333333] flex items-center justify-center text-[#03DAC5] shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-base">godarmxvpn</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2D2D2D] text-gray-300">
                SSH/TUN
              </span>
            </div>
            <div className="text-[11px] text-gray-400 -mt-0.5 font-mono">VPN over SSH</div>
          </div>
        </div>

        {/* Status Indicator & Actions */}
        <div className="flex items-center space-x-2">
          {/* Connection Status Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-[#121212]/70 border-[#2D2D2D]">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected'
                  ? 'bg-[#03DAC5] shadow-[0_0_8px_#03DAC5]'
                  : status === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-gray-500'
              }`}
            />
            <span className="capitalize text-xs text-gray-300 font-mono">
              {status}
            </span>
          </div>

          {/* Action: Payloads */}
          <button
            onClick={() => onNavigate(currentScreen === 'payload_manager' ? 'main' : 'payload_manager')}
            className={`p-2 rounded-md transition-colors ${
              currentScreen === 'payload_manager'
                ? 'bg-[#03DAC5]/20 text-[#03DAC5] border border-[#03DAC5]/40'
                : 'text-gray-300 hover:text-white hover:bg-[#2A2A2A]'
            }`}
            title="Payload Manager"
          >
            <FileCode className="w-4 h-4" />
          </button>

          {/* Action: Toggle Logs */}
          <button
            onClick={onToggleLogs}
            className={`p-2 rounded-md transition-colors ${
              showLogs
                ? 'bg-[#BB86FC]/20 text-[#BB86FC] border border-[#BB86FC]/40'
                : 'text-gray-300 hover:text-white hover:bg-[#2A2A2A]'
            }`}
            title="Connection Logs (Logcat)"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Action: Settings */}
          <button
            onClick={() => onNavigate(currentScreen === 'settings' ? 'main' : 'settings')}
            className={`p-2 rounded-md transition-colors ${
              currentScreen === 'settings'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-300 hover:text-white hover:bg-[#2A2A2A]'
            }`}
            title="VPN & SSH Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Action: Help / Docs */}
          <button
            onClick={onOpenHelp}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-[#2A2A2A] rounded-md transition-colors"
            title="Documentation & Usage"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
