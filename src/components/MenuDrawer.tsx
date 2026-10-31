import React from 'react';
import {
  Home,
  Box,
  Settings,
  BookOpen,
  Info,
  LogOut,
  X,
  Shield,
  Sun,
  Share2
} from 'lucide-react';
import { TabType } from './BottomNavBar';
import { ConnectionStatus } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onOpenGuide: () => void;
  onOpenAbout: () => void;
  onOpenApkModal: () => void;
  status: ConnectionStatus;
  onExitServerSSH: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenGuide,
  onOpenAbout,
  onOpenApkModal,
  status,
  onExitServerSSH,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content (Matches Screen 6 in screenshot) */}
      <div className="relative w-72 max-w-[80vw] bg-[#0c1811] border-r border-emerald-900/60 h-full flex flex-col p-5 shadow-2xl z-10 text-gray-200">
        {/* Top Header & Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/80">
          <div className="flex items-center space-x-3">
            {/* Hexagonal stylized icon matching screenshot */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-blue-600 p-[2px] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full bg-[#07130b] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-sm tracking-tighter">
                  HC
                </div>
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-white tracking-wide">godarmxvpn</div>
              <div className="text-xs text-gray-400 font-mono">v1.0.0</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 py-4 space-y-1">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            เมนูหลัก
          </div>

          {/* 1. หน้าหลัก */}
          <button
            onClick={() => {
              onSelectTab('home');
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/50 text-gray-200 hover:text-[#00E676] transition text-sm text-left"
          >
            <Home className="w-4 h-4 text-[#00E676]" />
            <span>หน้าหลัก</span>
          </button>

          {/* 2. Payload */}
          <button
            onClick={() => {
              onSelectTab('payload');
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/50 text-gray-200 hover:text-[#00E676] transition text-sm text-left"
          >
            <Box className="w-4 h-4 text-[#00E676]" />
            <span>Payload</span>
          </button>

          {/* 3. ตั้งค่า */}
          <button
            onClick={() => {
              onSelectTab('settings');
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/50 text-gray-200 hover:text-[#00E676] transition text-sm text-left"
          >
            <Settings className="w-4 h-4 text-[#00E676]" />
            <span>ตั้งค่า</span>
          </button>

          {/* 4. คู่มือการใช้งาน */}
          <button
            onClick={() => {
              onOpenGuide();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/50 text-gray-200 hover:text-[#00E676] transition text-sm text-left"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>คู่มือการใช้งาน</span>
          </button>

          {/* 5. เกี่ยวกับแอป */}
          <button
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-950/50 text-gray-200 hover:text-[#00E676] transition text-sm text-left"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>เกี่ยวกับแอป</span>
          </button>

          {/* 6. ติดตั้ง / Build APK */}
          <button
            onClick={() => {
              onOpenApkModal();
              onClose();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-[#00E676] hover:bg-emerald-900/50 transition text-sm text-left"
          >
            <Shield className="w-4 h-4 text-[#00E676]" />
            <span className="font-semibold">ติดตั้ง / Build APK</span>
          </button>
        </div>

        {/* BOTTOM ACTION: ออก จาก serverssh (Disconnect / Exit) */}
        <div className="pt-3 border-t border-emerald-950/80">
          <button
            onClick={() => {
              onExitServerSSH();
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition text-sm font-semibold ${
              status === 'connected' || status === 'connecting'
                ? 'bg-rose-950/60 border border-rose-600/50 text-rose-300 hover:bg-rose-900/70 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                : 'bg-emerald-950/40 border border-emerald-800/40 text-gray-300 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <LogOut className={`w-4 h-4 ${status === 'connected' ? 'text-rose-400 animate-pulse' : 'text-gray-400'}`} />
            <div className="flex flex-col text-left">
              <span>ออก จาก serverssh</span>
              {status === 'connected' && (
                <span className="text-[10px] text-rose-300 font-normal">กำลังออนไลน์ - แตะเพื่อตัดการเชื่อมต่อ</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
