import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  Server,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SSHConnectionProfile } from '../types';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: SSHConnectionProfile[];
  initialProfileId?: string;
}

export const QRCodeGeneratorModal: React.FC<QRCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  profiles,
  initialProfileId,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfileId || '');
  const [includePassword, setIncludePassword] = useState(true);
  const [formatType, setFormatType] = useState<'SSH_URI' | 'JSON'>('SSH_URI');
  const [qrTheme, setQrTheme] = useState<'light' | 'neon'>('light'); // light is best for scanner cameras
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrRawString, setQrRawString] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Set initial selected profile
  useEffect(() => {
    if (initialProfileId && profiles.some((p) => p.uuid === initialProfileId)) {
      setSelectedProfileId(initialProfileId);
    } else if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].uuid);
    }
  }, [initialProfileId, profiles]);

  const currentProfile = profiles.find((p) => p.uuid === selectedProfileId) || profiles[0] || null;

  // Generate QR Code string and render to Canvas
  useEffect(() => {
    if (!currentProfile) return;

    let payloadString = '';

    if (formatType === 'SSH_URI') {
      const user = encodeURIComponent(currentProfile.username || 'root');
      const pass = includePassword && currentProfile.password ? `:${encodeURIComponent(currentProfile.password)}` : '';
      const host = currentProfile.serverIP;
      const port = currentProfile.serverPort || 22;
      const name = encodeURIComponent(currentProfile.displayName || `${user}@${host}`);
      payloadString = `ssh://${user}${pass}@${host}:${port}#${name}`;
    } else {
      const configObj: Record<string, unknown> = {
        displayName: currentProfile.displayName,
        serverIP: currentProfile.serverIP,
        serverPort: currentProfile.serverPort,
        username: currentProfile.username,
        authenticationType: currentProfile.authenticationType,
        connectionMode: currentProfile.connectionMode,
        countryFlag: currentProfile.countryFlag || '🇹🇭',
        version: '1.1',
      };
      if (includePassword && currentProfile.password) {
        configObj.password = currentProfile.password;
      }
      payloadString = JSON.stringify(configObj);
    }

    setQrRawString(payloadString);

    const darkColor = qrTheme === 'light' ? '#000000' : '#00E676';
    const lightColor = qrTheme === 'light' ? '#FFFFFF' : '#060E09';

    QRCode.toDataURL(
      payloadString,
      {
        width: 320,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [currentProfile, includePassword, formatType, qrTheme]);

  if (!isOpen || !currentProfile) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrRawString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `godarmxvpn-${currentProfile.displayName.replace(/\s+/g, '_')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `godarmxvpn - ${currentProfile.displayName}`,
          text: `SSH Configuration for ${currentProfile.displayName}\n${qrRawString}`,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#0b1810] rounded-3xl max-w-sm w-full border border-emerald-900/60 shadow-[0_0_50px_rgba(0,230,118,0.25)] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-950 bg-[#07130b]">
          <div className="flex items-center space-x-2 text-white">
            <QrCode className="w-5 h-5 text-[#00E676]" />
            <h3 className="text-sm font-bold tracking-wide">สร้าง QR Code เซิร์ฟเวอร์ SSH</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Select Profile to Generate */}
          {profiles.length > 1 && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300 block">
                เลือกเซิร์ฟเวอร์ที่ต้องการสร้าง QR:
              </label>
              <select
                value={currentProfile.uuid}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full bg-[#050f09] border border-emerald-900/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00E676]"
              >
                {profiles.map((p) => (
                  <option key={p.uuid} value={p.uuid} className="bg-[#0b1810]">
                    {p.countryFlag || '🇹🇭'} {p.displayName} ({p.serverIP}:{p.serverPort})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QR Code Canvas Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#050f09] rounded-2xl border border-emerald-900/70 shadow-inner space-y-3">
            {qrDataUrl ? (
              <div
                className={`p-3 rounded-2xl shadow-xl transition-all duration-300 ${
                  qrTheme === 'light'
                    ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                    : 'bg-[#060e09] border border-emerald-500/40 shadow-[0_0_25px_rgba(0,230,118,0.3)]'
                }`}
              >
                <img
                  src={qrDataUrl}
                  alt="Generated SSH QR Code"
                  className="w-52 h-52 object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-52 h-52 bg-black/40 rounded-xl flex items-center justify-center text-gray-500 text-xs">
                กำลังสร้าง QR Code...
              </div>
            )}

            {/* Profile Label Below QR */}
            <div className="text-center space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center justify-center space-x-1">
                <span>{currentProfile.countryFlag || '🇹🇭'}</span>
                <span>{currentProfile.displayName}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 block">
                {currentProfile.serverIP}:{currentProfile.serverPort}
              </span>
            </div>
          </div>

          {/* Options: Theme Toggle & Password Toggle */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Password Toggle */}
            <button
              type="button"
              onClick={() => setIncludePassword((prev) => !prev)}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                includePassword
                  ? 'bg-emerald-950/60 border-[#00E676] text-white'
                  : 'bg-[#050f09] border-emerald-950 text-gray-400'
              }`}
            >
              {includePassword ? <Lock className="w-3.5 h-3.5 text-[#00E676]" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold">{includePassword ? 'ใส่รหัสผ่าน' : 'ซ่อนรหัสผ่าน'}</span>
            </button>

            {/* QR Theme Toggle (High contrast Light vs Neon Dark) */}
            <button
              type="button"
              onClick={() => setQrTheme((prev) => (prev === 'light' ? 'neon' : 'light'))}
              className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 transition ${
                qrTheme === 'neon'
                  ? 'bg-emerald-950/60 border-[#00E676] text-[#00E676]'
                  : 'bg-white/10 border-gray-600 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">{qrTheme === 'light' ? 'ธีมสว่าง (สแกนง่าย)' : 'ธีมนีออนเขียว'}</span>
            </button>
          </div>

          {/* Format Selector: Standard SSH URI vs Full JSON */}
          <div className="bg-[#050f09] p-2.5 rounded-xl border border-emerald-950 flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px]">รูปแบบข้อมูล:</span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setFormatType('SSH_URI')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  formatType === 'SSH_URI'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'bg-[#0d1e13] text-gray-300 hover:text-white'
                }`}
              >
                SSH URI (มาตรฐาน)
              </button>
              <button
                type="button"
                onClick={() => setFormatType('JSON')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  formatType === 'JSON'
                    ? 'bg-[#00E676] text-black shadow-sm'
                    : 'bg-[#0d1e13] text-gray-300 hover:text-white'
                }`}
              >
                JSON (godarmxvpn)
              </button>
            </div>
          </div>

          {/* Raw Text String Preview with Copy Button */}
          <div className="bg-[#020704] p-2.5 rounded-xl border border-emerald-950 flex items-center justify-between font-mono text-[10px] text-gray-300">
            <span className="truncate pr-2 select-all">{qrRawString}</span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-emerald-950 text-gray-400 hover:text-white shrink-0"
              title="คัดลอกข้อความ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Action Buttons: Download & Share */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="py-3 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(0,230,118,0.4)] transition"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>บันทึกรูป QR (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-3 px-3 rounded-xl bg-[#0e2114] hover:bg-[#15311e] border border-emerald-900/80 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <Share2 className="w-4 h-4 text-[#00E676]" />
              <span>แชร์ / คัดลอก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
