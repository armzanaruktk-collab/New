import React, { useState } from 'react';
import {
  Server,
  Plus,
  Edit2,
  FileCode,
  Power,
  Shield,
  ArrowUp,
  ArrowDown,
  Clock,
  Activity,
  Layers,
  Key,
  Lock,
  Globe,
  AlertCircle,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import { SSHConnectionProfile, PayloadProfile, AppSettings, ConnectionStatus, ConnectionMetrics } from '../types';
import { formatBytes, formatSpeed, formatDuration } from '../utils/formatters';

interface MainScreenProps {
  profiles: SSHConnectionProfile[];
  selectedProfileId: string;
  onSelectProfile: (uuid: string) => void;
  onEditProfile: (profile: SSHConnectionProfile) => void;
  onAddProfile: () => void;
  onOpenPayloadManager: () => void;
  payloadProfiles: PayloadProfile[];
  settings: AppSettings;
  status: ConnectionStatus;
  metrics: ConnectionMetrics;
  errorMessage: string | null;
  onToggleConnect: () => void;
  onOpenLogs: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onEditProfile,
  onAddProfile,
  onOpenPayloadManager,
  payloadProfiles,
  settings,
  status,
  metrics,
  errorMessage,
  onToggleConnect,
  onOpenLogs,
}) => {
  const [copiedProxy, setCopiedProxy] = useState(false);

  const currentProfile = profiles.find((p) => p.uuid === selectedProfileId) || profiles[0] || null;
  const currentPayload = currentProfile?.payloadUuid
    ? payloadProfiles.find((p) => p.uuid === currentProfile.payloadUuid)
    : null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isDisconnecting = status === 'disconnecting';
  const isBusy = isConnecting || isDisconnecting;

  const copySocksProxy = () => {
    const socksAddress = `socks5://127.0.0.1:${settings.forwarderPort || 1080}`;
    navigator.clipboard.writeText(socksAddress);
    setCopiedProxy(true);
    setTimeout(() => setCopiedProxy(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Selector Toolbar (Matches Android activity_main.xml) */}
      <div className="bg-[#1E1E1E] rounded-xl p-4 border border-[#2D2D2D] shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
          <span>SSH Server Profile</span>
          <span className="text-[11px] font-normal text-gray-400">
            {profiles.length} saved {profiles.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Spinner / Dropdown */}
          <div className="relative flex-1">
            <select
              value={currentProfile?.uuid || ''}
              onChange={(e) => onSelectProfile(e.target.value)}
              disabled={isConnected || isBusy}
              className="w-full appearance-none bg-[#121212] border border-[#3A3A3A] hover:border-[#555] focus:border-[#03DAC5] rounded-lg px-3.5 py-2.5 text-sm text-white pr-9 outline-none transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            >
              {profiles.map((p) => {
                const label = p.displayName || `${p.username}@${p.serverIP}:${p.serverPort}`;
                const modeTag = p.connectionMode === 'PAYLOAD' ? '[PAYLOAD]' : '[DIRECT]';
                return (
                  <option key={p.uuid} value={p.uuid} className="bg-[#1e1e1e] text-white">
                    {modeTag} {label}
                  </option>
                );
              })}
              {profiles.length === 0 && <option value="">No profile created yet</option>}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Edit Profile Button (baseline_edit_24) */}
          <button
            onClick={() => currentProfile && onEditProfile(currentProfile)}
            disabled={!currentProfile || isConnected || isBusy}
            className="p-2.5 rounded-lg bg-[#2A2A2A] hover:bg-[#353535] text-gray-200 hover:text-white border border-[#3A3A3A] disabled:opacity-40 transition"
            title="Edit this profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Payload Button (payloadManagerButton labeled "PAYLOAD") */}
          <button
            onClick={onOpenPayloadManager}
            className="px-3 py-2 rounded-lg bg-[#252525] hover:bg-[#303030] text-[#03DAC5] border border-[#03DAC5]/40 hover:border-[#03DAC5] text-xs font-semibold tracking-wide transition flex items-center space-x-1.5"
            title="Open Payload Manager"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>PAYLOAD</span>
          </button>

          {/* Add Profile Button (baseline_add_24) */}
          <button
            onClick={onAddProfile}
            disabled={isConnected || isBusy}
            className="p-2.5 rounded-lg bg-[#03DAC5] hover:bg-[#02b8a6] text-black font-medium disabled:opacity-40 transition shadow-sm"
            title="Add new SSH profile"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Profile Detail Pills */}
        {currentProfile && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#121212] px-2.5 py-1.5 rounded-md border border-[#252525]">
              <span className="text-gray-400 block text-[10px]">Server Host</span>
              <span className="text-gray-200 font-mono truncate block" title={currentProfile.serverIP}>
                {currentProfile.serverIP}:{currentProfile.serverPort}
              </span>
            </div>

            <div className="bg-[#121212] px-2.5 py-1.5 rounded-md border border-[#252525]">
              <span className="text-gray-400 block text-[10px]">Auth Method</span>
              <span className="text-gray-200 flex items-center space-x-1">
                {currentProfile.authenticationType === 'PRIVATE_KEY' ? (
                  <>
                    <Key className="w-3 h-3 text-[#BB86FC]" />
                    <span>Private Key</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Password</span>
                  </>
                )}
              </span>
            </div>

            <div className="bg-[#121212] px-2.5 py-1.5 rounded-md border border-[#252525]">
              <span className="text-gray-400 block text-[10px]">Tunnel Mode</span>
              <span className={`font-semibold ${currentProfile.connectionMode === 'PAYLOAD' ? 'text-[#03DAC5]' : 'text-blue-400'}`}>
                {currentProfile.connectionMode === 'PAYLOAD' ? 'Payload Tunnel' : 'Direct SSH'}
              </span>
            </div>

            <div className="bg-[#121212] px-2.5 py-1.5 rounded-md border border-[#252525]">
              <span className="text-gray-400 block text-[10px]">Payload Ref</span>
              <span className="text-gray-300 truncate block">
                {currentPayload ? currentPayload.name : currentProfile.connectionMode === 'PAYLOAD' ? 'Missing Payload' : 'None (Direct)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Connect Button Area (Matching Android ssh_connect_button) */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative">
          {/* Animated Glow Rings when connecting/connected */}
          {isConnected && (
            <div className="absolute inset-0 rounded-full bg-[#03DAC5]/20 animate-ping opacity-75 pointer-events-none scale-125" />
          )}
          {isConnecting && (
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none scale-110" />
          )}

          <button
            onClick={onToggleConnect}
            disabled={!currentProfile || isBusy}
            className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 ${
              isConnected
                ? 'bg-gradient-to-b from-[#1a3835] to-[#0c2422] border-[#03DAC5] text-[#03DAC5] hover:scale-[1.02] shadow-[0_0_35px_rgba(3,218,197,0.35)]'
                : isConnecting
                ? 'bg-gradient-to-b from-[#3a331c] to-[#241f0f] border-amber-400 text-amber-300 animate-pulse'
                : 'bg-gradient-to-b from-[#252525] to-[#161616] border-[#383838] text-white hover:border-[#03DAC5]/60 hover:text-[#03DAC5]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Power className={`w-12 h-12 mb-2 transition-transform ${isConnected ? 'rotate-0 text-[#03DAC5]' : 'text-gray-300'}`} />
            <span className="text-base font-bold uppercase tracking-wider">
              {isConnected ? 'Disconnect' : isConnecting ? 'Connecting' : isDisconnecting ? 'Stopping' : 'Connect'}
            </span>
            <span className="text-[11px] text-gray-400 mt-1 font-mono">
              {isConnected ? formatDuration(metrics.uptimeSeconds) : 'Tap to start'}
            </span>
          </button>
        </div>

        {/* Current Stage Indicator */}
        <div className="mt-4 text-center">
          <div className="text-xs font-mono text-gray-400">
            Current Stage: <span className="text-white font-medium">{metrics.stageName}</span>
          </div>
          {isConnected && (
            <div className="text-xs text-[#03DAC5] mt-0.5 font-medium flex items-center justify-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>VPN Active (tun2socks 26.26.26.1/24)</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-600/50 rounded-xl p-3.5 flex items-start space-x-3 text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-rose-300">Connection Failed</div>
            <div className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</div>
            <button
              onClick={onOpenLogs}
              className="mt-2 text-[11px] underline text-rose-300 hover:text-white"
            >
              View diagnostic logs
            </button>
          </div>
        </div>
      )}

      {/* Live Metrics Grid (When Connected or Connecting) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Upload Rate */}
        <div className="bg-[#1E1E1E] rounded-xl p-3.5 border border-[#2D2D2D] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">TX</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {formatSpeed(metrics.uploadSpeed)}
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
            Total: {formatBytes(metrics.bytesUp)}
          </div>
        </div>

        {/* Download Rate */}
        <div className="bg-[#1E1E1E] rounded-xl p-3.5 border border-[#2D2D2D] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">RX</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {formatSpeed(metrics.downloadSpeed)}
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
            Total: {formatBytes(metrics.bytesDown)}
          </div>
        </div>

        {/* Latency */}
        <div className="bg-[#1E1E1E] rounded-xl p-3.5 border border-[#2D2D2D]">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Ping</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">RTT</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {metrics.pingMs !== null ? `${metrics.pingMs} ms` : '--'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            DNS: {settings.dnsResolverIp || '1.1.1.1'}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-[#1E1E1E] rounded-xl p-3.5 border border-[#2D2D2D]">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#BB86FC]" />
              <span>Uptime</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">SESSION</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {formatDuration(metrics.uptimeSeconds)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Port: {settings.forwarderPort || 1080}
          </div>
        </div>
      </div>

      {/* SOCKS5 Endpoint & Routing Info */}
      <div className="bg-[#191919] rounded-xl p-4 border border-[#282828] text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-300">
            <Globe className="w-4 h-4 text-[#03DAC5]" />
            <span className="font-semibold text-white">Local SOCKS5 Forwarder</span>
            <span className="text-gray-400 font-mono">
              127.0.0.1:{settings.forwarderPort || 1080}
            </span>
          </div>
          <button
            onClick={copySocksProxy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2A2A2A] hover:bg-[#333] text-gray-300 hover:text-white transition text-[11px]"
          >
            {copiedProxy ? <Check className="w-3 h-3 text-[#03DAC5]" /> : <Copy className="w-3 h-3" />}
            <span>{copiedProxy ? 'Copied' : 'Copy Proxy URL'}</span>
          </button>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-[#252525] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-gray-400 text-[11px]">
          <div>
            DNS Resolver: <span className="text-gray-200 font-mono">{settings.dnsResolverIp || '1.1.1.1'}</span> (bypasses VPN)
          </div>
          <div>
            Tunnel routing: <span className="text-gray-200">
              {settings.includedApps.length === 0
                ? 'All Apps Included'
                : `${settings.includedApps.length} Apps Routed`}
            </span>
          </div>
          <div>
            SSH transport: <span className="text-gray-200">OpenSSH/connectbot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
