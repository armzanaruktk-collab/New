import React from 'react';
import { X, Shield, Terminal, Globe, Server, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] rounded-2xl max-w-xl w-full p-6 border border-[#3A3A3A] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#03DAC5]" />
            <h3 className="text-base font-bold text-white">About VPN over SSH (godarmxvpn)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-gray-300 space-y-3 leading-relaxed">
          <p>
            <strong className="text-white">VPN over SSH</strong> tunnels system-wide network traffic through a remote SSH server using dynamic port forwarding and a tun2socks virtual interface. It provides an encrypted proxy tunnel without needing custom server-side software.
          </p>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-[#252525] space-y-2">
            <div className="text-xs font-bold text-[#03DAC5] flex items-center space-x-1.5">
              <Server className="w-4 h-4" />
              <span>How Connection Modes Work</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-gray-300">
              <li>
                <strong className="text-white">Direct SSH:</strong> Connects straight to the SSH server hostname and port (e.g. port 22), authenticates via password or private key, and launches the local SOCKS5 forwarder on <code>127.0.0.1:1080</code>.
              </li>
              <li>
                <strong className="text-white">Payload Tunnel:</strong> Resolves an HTTP proxy gateway (e.g. Cloudflare IP or Squid/Apache proxy) and sends a customized HTTP CONNECT request payload (e.g., bug-host headers, SNI fronting, or WebSocket upgrade) before wrapping the SSH stream inside.
              </li>
            </ul>
          </div>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-[#252525] space-y-2">
            <div className="text-xs font-bold text-[#BB86FC] flex items-center space-x-1.5">
              <FileCode className="w-4 h-4" />
              <span>Supported Payload Tags</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-[#0D0D0D] p-1.5 rounded border border-[#222]">
                <span className="text-[#03DAC5]">[host_port]</span>: Target IP:Port
              </div>
              <div className="bg-[#0D0D0D] p-1.5 rounded border border-[#222]">
                <span className="text-[#03DAC5]">[host]</span>: Target IP/Host
              </div>
              <div className="bg-[#0D0D0D] p-1.5 rounded border border-[#222]">
                <span className="text-[#03DAC5]">[port]</span>: Target SSH Port
              </div>
              <div className="bg-[#0D0D0D] p-1.5 rounded border border-[#222]">
                <span className="text-[#03DAC5]">[ua]</span>: godarmxvpn/1.0
              </div>
              <div className="bg-[#0D0D0D] p-1.5 rounded border border-[#222] col-span-2">
                <span className="text-[#03DAC5]">[crlf]</span>: CRLF (\r\n) line break
              </div>
            </div>
          </div>

          <div className="border-t border-[#2A2A2A] pt-3 text-[11px] text-gray-400">
            <strong className="text-gray-300">Important Note:</strong> Android's underlying SSH library (sshlib) uses HTTPProxyData which requires HTTP CONNECT requests. Raw GET/POST methods are automatically rejected by the engine in accordance with the application specification.
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#333] text-white text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
