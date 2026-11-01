import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Sun,
  CheckCircle2,
  Play,
  LogOut,
  ChevronDown,
  Box,
  Server,
  Zap,
  Activity,
  Smartphone,
  Menu,
  MoreVertical,
  Link2,
  Edit2,
  Circle,
  CheckCircle,
  QrCode
} from 'lucide-react';
import {
  SSHConnectionProfile,
  PayloadProfile,
  AppSettings,
  ConnectionStatus,
  ConnectionMetrics,
  ConnectionMode
} from '../types';
import { formatSpeed, formatDuration } from '../utils/formatters';

interface HomeScreenProps {
  profiles: SSHConnectionProfile[];
  selectedProfileId: string;
  onSelectProfile: (uuid: string) => void;
  payloadProfiles: PayloadProfile[];
  activePayloadId: string;
  onSelectPayload: (uuid: string) => void;
  connectionMode: ConnectionMode;
  onChangeConnectionMode: (mode: ConnectionMode) => void;
  settings: AppSettings;
  status: ConnectionStatus;
  metrics: ConnectionMetrics;
  onConnect: () => void;
  onDisconnect: () => void;
  onEditProfile: (profile: SSHConnectionProfile) => void;
  onOpenPayloadTab: () => void;
  onOpenApkModal: () => void;
  onOpenMenu: () => void;
  onOpenQRScanner: () => void;
  onOpenQRGenerator: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  payloadProfiles,
  activePayloadId,
  onSelectPayload,
  connectionMode,
  onChangeConnectionMode,
  settings,
  status,
  metrics,
  onConnect,
  onDisconnect,
  onEditProfile,
  onOpenPayloadTab,
  onOpenApkModal,
  onOpenMenu,
  onOpenQRScanner,
  onOpenQRGenerator,
}) => {
  // Screen sub-mode: 'dashboard' (Screen 1 - หน้าหลัก) vs 'ssh_view' (Screen 2 - SSH)
  const [subView, setSubView] = useState<'dashboard' | 'ssh_view'>('dashboard');

  const currentProfile = profiles.find((p) => p.uuid === selectedProfileId) || profiles[0] || null;
  const currentPayload = payloadProfiles.find((p) => p.uuid === activePayloadId) || payloadProfiles[0] || null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isBusy = isConnecting || status === 'disconnecting';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'godarmxvpn',
        text: 'VPN over SSH Android client for fast encrypted tunneling',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์แอปเรียบร้อยแล้ว');
    }
  };

  return (
    <div className="space-y-2.5 max-w-md mx-auto pb-6">
      {/* ============================================================== */}
      {/* TOP BAR: Dashboard Style (Screen 1) OR SSH Style (Screen 2) */}
      {/* ============================================================== */}
      {subView === 'dashboard' ? (
        /* Top Bar matching Screen 1 (21:15) */
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center space-x-2 text-[#00E676] font-bold text-base">
            <Globe className="w-5 h-5 text-[#00E676]" />
            <span className="text-white text-base">หน้าหลัก</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <button
              onClick={onOpenQRScanner}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-[10px] font-bold text-[#00E676] hover:bg-emerald-900 transition shadow-sm"
              title="สแกน QR Code นำเข้าเซิร์ฟเวอร์"
            >
              <QrCode className="w-3 h-3" />
              <span>สแกน QR</span>
            </button>
            <button
              onClick={onOpenApkModal}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-[10px] font-bold text-gray-300 hover:text-white hover:bg-emerald-900 transition shadow-sm"
              title="ติดตั้ง / Build APK"
            >
              <Smartphone className="w-3 h-3" />
              <span>APK</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1 rounded-lg text-gray-400 hover:text-[#00E676] hover:bg-emerald-950/40 transition"
              title="แชร์แอป"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSubView('ssh_view')}
              className="p-1 rounded-lg text-gray-400 hover:text-[#00E676] hover:bg-emerald-950/40 transition"
              title="สลับโหมด SSH / Dashboard"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Top Bar matching Screen 2 (21:16 - SSH) */
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center space-x-3 text-white">
            <button
              onClick={onOpenMenu}
              className="p-1 text-gray-300 hover:text-[#00E676]"
              title="เปิดเมนูด้านข้าง"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-base font-bold tracking-wide">SSH</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSubView('dashboard')}
              className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-semibold text-emerald-300 hover:text-white transition"
              title="กลับหน้าหลัก Dashboard"
            >
              หน้าหลัก
            </button>
            <button
              onClick={onOpenApkModal}
              className="p-1 text-gray-400 hover:text-white"
              title="เมนูเพิ่มเติม"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HERO SECTION: Dashboard circle (Screen 1) */}
      {/* ============================================================== */}
      {subView === 'dashboard' && (
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative">
            {/* Outer Neon Glow Circle */}
            <div className="w-32 h-32 rounded-full border-2 border-emerald-400/40 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,230,118,0.25)] bg-gradient-to-b from-emerald-950/50 to-transparent">
              {/* Inner Circle */}
              <div className="w-24 h-24 rounded-full border-2 border-[#00E676] flex items-center justify-center bg-[#07170e] shadow-[0_0_15px_#00E676]">
                <Globe className="w-10 h-10 text-[#00E676] drop-shadow-[0_0_8px_#00E676]" />
              </div>

              {/* WOR Pill Badge */}
              <div className="absolute -bottom-2 bg-[#091b11] border border-[#00E676] px-3.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-[0_0_10px_rgba(0,230,118,0.5)]">
                WOR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SSH SERVER SECTION (Matches Screen 1 & Screen 2) */}
      {/* ============================================================== */}
      <div className="bg-[#0b1810] border border-emerald-900/60 rounded-2xl p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span className="flex items-center space-x-1.5">
            <Server className="w-3.5 h-3.5 text-[#00E676]" />
            <span>{subView === 'dashboard' ? 'รายการเซิร์ฟเวอร์' : 'เซิร์ฟเวอร์ SSH'}</span>
          </span>
          <span className="text-[11px] text-gray-400 font-mono">เวอร์ชั่น: (1.1)</span>
        </div>

        <div className="relative">
          <select
            value={currentProfile?.uuid || ''}
            onChange={(e) => onSelectProfile(e.target.value)}
            disabled={isConnected || isBusy}
            className="w-full appearance-none bg-[#050f09] border border-emerald-900/80 hover:border-emerald-600 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white pr-9 outline-none transition font-medium"
          >
            {profiles.map((p) => (
              <option key={p.uuid} value={p.uuid} className="bg-[#0b1810] text-white">
                {p.countryFlag ? `${p.countryFlag} ` : '🇹🇭 '} {p.displayName || p.serverIP}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#00E676] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {currentProfile && (
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-0.5">
            <span>โฮสต์: <strong className="text-gray-200 font-mono">{currentProfile.serverIP}:{currentProfile.serverPort}</strong></span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenQRGenerator}
                className="text-[#00E676] hover:underline flex items-center space-x-1"
                title="สร้าง QR Code เพื่อแชร์เซิร์ฟเวอร์นี้"
              >
                <Share2 className="w-3 h-3" />
                <span>แชร์ QR</span>
              </button>
              <button
                onClick={onOpenQRScanner}
                disabled={isConnected || isBusy}
                className="text-gray-300 hover:text-white flex items-center space-x-1"
                title="สแกน QR Code นำเข้าเซิร์ฟเวอร์"
              >
                <QrCode className="w-3 h-3" />
                <span>สแกน</span>
              </button>
              <button
                onClick={() => onEditProfile(currentProfile)}
                disabled={isConnected || isBusy}
                className="text-gray-300 hover:text-white flex items-center space-x-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>แก้ไข</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* PAYLOAD SECTION (Matches Screen 1 & Screen 2) */}
      {/* ============================================================== */}
      <div className={`bg-[#0b1810] border border-emerald-900/60 rounded-2xl p-3.5 shadow-sm space-y-2 ${connectionMode === 'DIRECT' ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span className="flex items-center space-x-1.5">
            <Box className="w-3.5 h-3.5 text-[#00E676]" />
            <span>{subView === 'dashboard' ? 'รายการ Payload' : 'เลือก Payload'}</span>
          </span>
          <span className="text-[11px] text-gray-400 font-mono">เวอร์ชั่น: (1.1)</span>
        </div>

        <div className="relative">
          <select
            value={currentPayload?.uuid || ''}
            onChange={(e) => onSelectPayload(e.target.value)}
            disabled={isConnected || isBusy || connectionMode === 'DIRECT'}
            className="w-full appearance-none bg-[#050f09] border border-emerald-900/80 hover:border-emerald-600 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white pr-9 outline-none transition font-medium disabled:cursor-not-allowed"
          >
            {payloadProfiles.map((pay) => (
              <option key={pay.uuid} value={pay.uuid} className="bg-[#0b1810] text-white">
                📦 {pay.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#00E676] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {currentPayload && (
          <div className="text-[11px] text-gray-400 px-1 pt-0.5">
            Proxy: <strong className="text-gray-200 font-mono">{currentPayload.proxyHost}:{currentPayload.proxyPort}</strong>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CONNECTION METHOD SEPARATION (Screen 2: Direct SSH vs Payload) */}
      {/* ============================================================== */}
      <div className="bg-[#0b1810] border border-emerald-900/60 rounded-2xl p-3 shadow-sm space-y-2">
        <div
          onClick={() => {
            if (!isConnected && !isBusy) {
              onChangeConnectionMode(connectionMode === 'DIRECT' ? 'PAYLOAD' : 'DIRECT');
            }
          }}
          className="flex items-center space-x-3 cursor-pointer select-none p-1"
        >
          {/* Radio circle matching Screen 2 */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            connectionMode === 'DIRECT'
              ? 'border-[#00E676] bg-emerald-950/70 shadow-[0_0_8px_#00E676]'
              : 'border-gray-500'
          }`}>
            {connectionMode === 'DIRECT' && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E676]" />
            )}
          </div>

          <div className="flex-1">
            <span className="text-sm font-semibold text-white block">
              Direct SSH (ไม่ใช้ Payload)
            </span>
            <span className="text-[11px] text-gray-400 block -mt-0.5">
              เชื่อมต่อตรงไปยัง SSH Server โดยไม่ผ่าน HTTP Proxy Gateway
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATUS CARD (Screen 1) */}
      {/* ============================================================== */}
      {subView === 'dashboard' && (
        <div className="bg-[#0b1810] border border-emerald-900/60 rounded-2xl p-3.5 shadow-sm flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-950/70 border border-[#00E676] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,230,118,0.4)]">
            <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>สถานะ:</span>
              <span className={isConnected ? 'text-[#00E676]' : isConnecting ? 'text-amber-400' : 'text-[#00E676]'}>
                {isConnected ? 'กำลังออนไลน์' : isConnecting ? 'กำลังเชื่อมต่อ...' : 'พร้อมเชื่อมต่อ'}
              </span>
            </div>
            <div className="text-[11px] text-gray-300 mt-0.5">
              {isConnected
                ? `อุโมงค์ SSH ทำงานอยู่ (${formatDuration(metrics.uptimeSeconds)})`
                : 'พร้อมใช้งานสำหรับเชื่อมต่อ'}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ACTION BUTTON: เชื่อมต่อ (Connect) / ออก จาก serverssh */}
      {/* ============================================================== */}
      <div className="pt-2">
        {isConnected ? (
          /* Disconnect Button (ออก จาก serverssh) */
          <button
            onClick={onDisconnect}
            className="w-full py-4 rounded-full bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(225,29,72,0.4)] transition transform active:scale-[0.99] border border-rose-500/50"
          >
            <LogOut className="w-5 h-5" />
            <span>ออก จาก serverssh</span>
          </button>
        ) : (
          /* Connect Button (Screen 1 play or Screen 2 link icon) */
          <button
            onClick={onConnect}
            disabled={isBusy || !currentProfile}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#00C853] via-[#00E676] to-[#00C853] hover:opacity-95 text-black font-extrabold text-base flex items-center justify-center space-x-2.5 shadow-[0_0_25px_rgba(0,230,118,0.5)] transition transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subView === 'dashboard' ? (
              <Play className="w-5 h-5 fill-current" />
            ) : (
              <Link2 className="w-5 h-5 stroke-[2.5]" />
            )}
            <span>{isConnecting ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ'}</span>
          </button>
        )}
      </div>

      {/* Live Connected Stats Grid */}
      {isConnected && (
        <div className="bg-[#09150d] rounded-2xl p-4 border border-emerald-900/50 space-y-3 mt-3">
          <div className="text-xs font-semibold text-gray-300 flex items-center justify-between border-b border-emerald-950 pb-2">
            <span className="text-[#00E676] flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5" />
              <span>ความเร็วและข้อมูลเครือข่าย</span>
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              SOCKS5: 127.0.0.1:{settings.forwarderPort || 1080}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#050f09] p-2 rounded-xl border border-emerald-950">
              <span className="text-[10px] text-gray-400 block">อัปโหลด</span>
              <span className="text-xs font-bold text-white font-mono">{formatSpeed(metrics.uploadSpeed)}</span>
            </div>
            <div className="bg-[#050f09] p-2 rounded-xl border border-emerald-950">
              <span className="text-[10px] text-gray-400 block">ดาวน์โหลด</span>
              <span className="text-xs font-bold text-white font-mono">{formatSpeed(metrics.downloadSpeed)}</span>
            </div>
            <div className="bg-[#050f09] p-2 rounded-xl border border-emerald-950">
              <span className="text-[10px] text-gray-400 block">ค่า Ping</span>
              <span className="text-xs font-bold text-[#00E676] font-mono">{metrics.pingMs || 30} ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
