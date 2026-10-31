import React from 'react';
import { Home, Box, Settings, Menu } from 'lucide-react';

export type TabType = 'home' | 'payload' | 'settings' | 'menu';

interface BottomNavBarProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07130b]/95 backdrop-blur-md border-t border-emerald-950/80 px-4 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {/* Tab 1: หน้าหลัก */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'home'
              ? 'text-[#00E676] font-semibold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'text-[#00E676] drop-shadow-[0_0_8px_#00E676]' : ''}`} />
          <span className="text-[11px] tracking-wide">หน้าหลัก</span>
        </button>

        {/* Tab 2: Payload */}
        <button
          onClick={() => onChangeTab('payload')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'payload'
              ? 'text-[#00E676] font-semibold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Box className={`w-5 h-5 mb-0.5 ${currentTab === 'payload' ? 'text-[#00E676] drop-shadow-[0_0_8px_#00E676]' : ''}`} />
          <span className="text-[11px] tracking-wide">Payload</span>
        </button>

        {/* Tab 3: ตั้งค่า */}
        <button
          onClick={() => onChangeTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'settings'
              ? 'text-[#00E676] font-semibold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className={`w-5 h-5 mb-0.5 ${currentTab === 'settings' ? 'text-[#00E676] drop-shadow-[0_0_8px_#00E676]' : ''}`} />
          <span className="text-[11px] tracking-wide">ตั้งค่า</span>
        </button>

        {/* Tab 4: เมนู */}
        <button
          onClick={() => onChangeTab('menu')}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            currentTab === 'menu'
              ? 'text-[#00E676] font-semibold scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${currentTab === 'menu' ? 'text-[#00E676] drop-shadow-[0_0_8px_#00E676]' : ''}`} />
          <span className="text-[11px] tracking-wide">เมนู</span>
        </button>
      </div>
    </nav>
  );
};
