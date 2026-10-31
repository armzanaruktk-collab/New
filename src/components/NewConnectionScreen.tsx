import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Key,
  Lock,
  Server,
  FileCode,
  AlertCircle,
  FileText
} from 'lucide-react';
import { SSHConnectionProfile, PayloadProfile, ConnectionMode } from '../types';
import { formatKeyPreview } from '../utils/formatters';

interface NewConnectionScreenProps {
  editingProfile: SSHConnectionProfile | null;
  payloadProfiles: PayloadProfile[];
  onSave: (profile: SSHConnectionProfile) => void;
  onDelete?: (uuid: string) => void;
  onCancel: () => void;
  onManagePayloads: () => void;
}

export const NewConnectionScreen: React.FC<NewConnectionScreenProps> = ({
  editingProfile,
  payloadProfiles,
  onSave,
  onDelete,
  onCancel,
  onManagePayloads,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState('22');
  const [username, setUsername] = useState('');
  const [authType, setAuthType] = useState<'PASSWORD' | 'PRIVATE_KEY'>('PASSWORD');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('PAYLOAD');
  const [selectedPayloadUuid, setSelectedPayloadUuid] = useState<string>('');
  const [countryFlag, setCountryFlag] = useState('🇹🇭');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProfile) {
      setDisplayName(editingProfile.displayName || '');
      setServerIP(editingProfile.serverIP || '');
      setServerPort(String(editingProfile.serverPort || 22));
      setUsername(editingProfile.username || '');
      setAuthType(editingProfile.authenticationType || 'PASSWORD');
      setPassword(editingProfile.password || '');
      setPrivateKey(editingProfile.privateKey || '');
      setConnectionMode(editingProfile.connectionMode || 'PAYLOAD');
      setSelectedPayloadUuid(editingProfile.payloadUuid || '');
      setCountryFlag(editingProfile.countryFlag || '🇹🇭');
    } else {
      setDisplayName('');
      setServerIP('');
      setServerPort('22');
      setUsername('');
      setAuthType('PASSWORD');
      setPassword('');
      setPrivateKey('');
      setConnectionMode('PAYLOAD');
      setSelectedPayloadUuid(payloadProfiles[0]?.uuid || '');
      setCountryFlag('🇹🇭');
    }
  }, [editingProfile, payloadProfiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPrivateKey(content);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('ไม่สามารถอ่านไฟล์ Private Key ได้');
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const host = serverIP.trim();
    const user = username.trim();
    const port = parseInt(serverPort.trim(), 10);

    if (!host || !user || isNaN(port) || port < 1 || port > 65535) {
      setError('กรุณากรอก Server IP, Username และ Port (1–65535) ให้ถูกต้อง');
      return;
    }

    if (authType === 'PRIVATE_KEY' && (!privateKey || !privateKey.trim())) {
      setError('กรุณาเลือกหรือวาง Private Key สำหรับยืนยันตัวตน');
      return;
    }

    const profile: SSHConnectionProfile = {
      uuid: editingProfile ? editingProfile.uuid : `ssh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      displayName: displayName.trim() || `${user}@${host}:${port}`,
      serverIP: host,
      serverPort: port,
      username: user,
      authenticationType: authType,
      password: authType === 'PASSWORD' ? password : '',
      privateKey: authType === 'PRIVATE_KEY' ? privateKey : '',
      connectionMode: connectionMode,
      payloadUuid: connectionMode === 'PAYLOAD' ? selectedPayloadUuid : null,
      countryFlag,
      version: '1.1',
    };

    onSave(profile);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-gray-300 hover:text-white"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-white">
            {editingProfile ? 'แก้ไขเซิร์ฟเวอร์ SSH' : 'เพิ่มเซิร์ฟเวอร์ SSH'}
          </h2>
        </div>

        {editingProfile && onDelete && (
          <button
            onClick={() => onDelete(editingProfile.uuid)}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition"
            title="ลบเซิร์ฟเวอร์นี้"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-600/50 rounded-2xl p-3 flex items-center space-x-2 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Connection Form */}
      <div className="bg-[#0b1810] border border-emerald-900/60 rounded-2xl p-4 space-y-3.5 shadow-sm">
        {/* Name & Flag */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3 space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">ชื่อแสดงเซิร์ฟเวอร์</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="เช่น bd_ready_01"
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">ธง</label>
            <select
              value={countryFlag}
              onChange={(e) => setCountryFlag(e.target.value)}
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-2 py-2 text-sm text-white outline-none"
            >
              <option value="🇹🇭">🇹🇭 TH</option>
              <option value="🇸🇬">🇸🇬 SG</option>
              <option value="🇯🇵">🇯🇵 JP</option>
              <option value="🇩🇪">🇩🇪 DE</option>
              <option value="🇺🇸">🇺🇸 US</option>
            </select>
          </div>
        </div>

        {/* Server IP & Port */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">
              Server Host / IP <span className="text-[#00E676]">*</span>
            </label>
            <input
              type="text"
              value={serverIP}
              onChange={(e) => setServerIP(e.target.value)}
              placeholder="th-node01.godarmx.net"
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">
              Port <span className="text-[#00E676]">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="65535"
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value)}
              placeholder="22"
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
            />
          </div>
        </div>

        {/* Connection Mode Separation: Direct SSH vs ผ่าน HTTP Payload */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-gray-300 block">
            วิธีการเชื่อมต่อ (Connection Mode)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConnectionMode('PAYLOAD')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                connectionMode === 'PAYLOAD'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-[#050f09] border-emerald-950 text-gray-400'
              }`}
            >
              ผ่าน HTTP Payload
            </button>
            <button
              type="button"
              onClick={() => setConnectionMode('DIRECT')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                connectionMode === 'DIRECT'
                  ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676]'
                  : 'bg-[#050f09] border-emerald-950 text-gray-400'
              }`}
            >
              Direct SSH (แบบตรง)
            </button>
          </div>
        </div>

        {/* Payload Picker if mode is PAYLOAD */}
        {connectionMode === 'PAYLOAD' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">เลือก Payload</label>
              <button
                type="button"
                onClick={onManagePayloads}
                className="text-[11px] text-[#00E676] hover:underline"
              >
                จัดการ Payload...
              </button>
            </div>
            <select
              value={selectedPayloadUuid}
              onChange={(e) => setSelectedPayloadUuid(e.target.value)}
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              {payloadProfiles.map((pay) => (
                <option key={pay.uuid} value={pay.uuid}>
                  {pay.name} ({pay.proxyHost}:{pay.proxyPort})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 block">
            SSH Username <span className="text-[#00E676]">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="root"
            className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white font-mono outline-none"
          />
        </div>

        {/* Authentication Mode (Password vs Key) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 block">การยืนยันตัวตน</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAuthType('PASSWORD')}
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                authType === 'PASSWORD'
                  ? 'bg-emerald-950/60 border-[#00E676] text-[#00E676]'
                  : 'bg-[#050f09] border-emerald-950 text-gray-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>รหัสผ่าน (Password)</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthType('PRIVATE_KEY')}
              className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition ${
                authType === 'PRIVATE_KEY'
                  ? 'bg-emerald-950/60 border-[#00E676] text-[#00E676]'
                  : 'bg-[#050f09] border-emerald-950 text-gray-400'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Private Key</span>
            </button>
          </div>
        </div>

        {authType === 'PASSWORD' ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">รหัสผ่าน SSH</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              className="w-full bg-[#050f09] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3 py-2 text-sm text-white outline-none"
            />
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <label className="relative cursor-pointer px-3 py-2 bg-[#122318] hover:bg-[#1a3323] border border-emerald-900 rounded-xl text-xs font-medium text-white flex items-center justify-center space-x-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-[#00E676]" />
              <span>อัปโหลดไฟล์ Private Key</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            {privateKey && (
              <pre className="text-[10px] font-mono text-emerald-300 bg-[#050f09] p-2 rounded-xl border border-emerald-950 overflow-x-auto">
                {formatKeyPreview(privateKey)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-full bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] transition"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการตั้งค่าเซิร์ฟเวอร์</span>
        </button>
      </div>
    </div>
  );
};
