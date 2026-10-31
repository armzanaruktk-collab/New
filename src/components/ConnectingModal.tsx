import React from 'react';
import { Shield, Check, Loader2, X, Circle } from 'lucide-react';
import { ConnectionStatus, ConnectionMetrics } from '../types';

interface ConnectingModalProps {
  isOpen: boolean;
  status: ConnectionStatus;
  metrics: ConnectionMetrics;
  mode: 'DIRECT' | 'PAYLOAD';
  onCancelOrDisconnect: () => void;
  onDismiss: () => void;
}

export const ConnectingModal: React.FC<ConnectingModalProps> = ({
  isOpen,
  status,
  metrics,
  mode,
  onCancelOrDisconnect,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';

  // Step calculations based on mode and metrics.stageStep
  const step1Done = metrics.stageStep >= 1;
  const step2Done = metrics.stageStep >= 2;
  const step3Done = metrics.stageStep >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#0a160f] border border-emerald-900/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,230,118,0.2)] flex flex-col items-center text-center">
        {/* Dismiss close button (top right) */}
        {isConnected && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/60 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Hero Neon Glow Circle with Shield (Matches Screen 5) */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="w-36 h-36 rounded-full border-2 border-emerald-500/40 flex items-center justify-center animate-pulse">
            {/* Middle glowing ring */}
            <div className="w-28 h-28 rounded-full border-2 border-[#00E676] flex items-center justify-center shadow-[0_0_25px_#00E676] bg-emerald-950/40">
              {/* Inner Shield Icon */}
              <Shield className="w-12 h-12 text-[#00E676] drop-shadow-[0_0_10px_#00E676]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mt-2">
          {isConnected
            ? 'เชื่อมต่อ SSH สำเร็จ!'
            : isConnecting
            ? 'กำลังเชื่อมต่อ SSH...'
            : isError
            ? 'การเชื่อมต่อขัดข้อง'
            : 'สถานะการเชื่อมต่อ'}
        </h3>

        {/* Checklist of Connection Stages (Matches Screen 5 exactly) */}
        <div className="w-full max-w-xs space-y-3.5 my-6 text-left">
          {/* Step 1: Proxy Transport (if PAYLOAD mode) or Direct TCP */}
          <div className="flex items-center space-x-3 text-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                step1Done
                  ? 'bg-[#00E676] text-black shadow-[0_0_8px_#00E676]'
                  : isConnecting && metrics.stageStep === 0
                  ? 'border border-[#00E676] text-[#00E676] animate-spin'
                  : 'border border-gray-600 text-transparent'
              }`}
            >
              {step1Done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isConnecting && metrics.stageStep === 0 ? <Loader2 className="w-3 h-3" /> : null}
            </div>
            <span className={step1Done ? 'text-white font-medium' : 'text-gray-400'}>
              {mode === 'PAYLOAD' ? 'เชื่อมต่อ Proxy สำเร็จ' : 'เชื่อมต่อเซิร์ฟเวอร์แบบตรง (Direct)'}
            </span>
          </div>

          {/* Step 2: SSH Handshake & Auth */}
          <div className="flex items-center space-x-3 text-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                step2Done
                  ? 'bg-[#00E676] text-black shadow-[0_0_8px_#00E676]'
                  : isConnecting && metrics.stageStep === 1
                  ? 'border border-[#00E676] text-[#00E676] animate-spin'
                  : 'border border-gray-600 text-transparent'
              }`}
            >
              {step2Done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isConnecting && metrics.stageStep === 1 ? <Loader2 className="w-3 h-3" /> : null}
            </div>
            <span className={step2Done ? 'text-white font-medium' : 'text-gray-400'}>
              กำลังเชื่อมต่อ SSH Server
            </span>
          </div>

          {/* Step 3: Network Routing / VPN Tun */}
          <div className="flex items-center space-x-3 text-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                step3Done
                  ? 'bg-[#00E676] text-black shadow-[0_0_8px_#00E676]'
                  : isConnecting && metrics.stageStep === 2
                  ? 'border border-[#00E676] text-[#00E676] animate-spin'
                  : 'border border-gray-600 text-transparent'
              }`}
            >
              {step3Done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isConnecting && metrics.stageStep === 2 ? <Loader2 className="w-3 h-3" /> : null}
            </div>
            <span className={step3Done ? 'text-white font-medium' : 'text-gray-400'}>
              กำลังตั้งค่าเส้นทางเครือข่าย
            </span>
          </div>
        </div>

        {/* Action Button: ออก จาก serverssh หรือ ยกเลิก */}
        <div className="w-full pt-2">
          <button
            onClick={onCancelOrDisconnect}
            className="w-full py-3 rounded-2xl bg-[#1e2e25] hover:bg-[#273d31] text-gray-200 hover:text-white font-semibold text-sm border border-emerald-900/50 shadow-md transition"
          >
            {isConnected ? 'ออก จาก serverssh' : 'ยกเลิก'}
          </button>
        </div>
      </div>
    </div>
  );
};
