import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Play,
  Box,
  Radio,
  FileCode
} from 'lucide-react';
import { PayloadProfile, SSHConnectionProfile } from '../types';
import { parseConnectPayload, PAYLOAD_TEMPLATES } from '../services/payloadParser';

interface PayloadManagerScreenProps {
  payloads: PayloadProfile[];
  activePayloadId: string;
  onSetActivePayload: (uuid: string) => void;
  sshProfiles: SSHConnectionProfile[];
  onSavePayload: (payload: PayloadProfile) => void;
  onDeletePayload: (uuid: string) => { affectedServers: number };
  onBack: () => void;
}

export const PayloadManagerScreen: React.FC<PayloadManagerScreenProps> = ({
  payloads,
  activePayloadId,
  onSetActivePayload,
  sshProfiles,
  onSavePayload,
  onDeletePayload,
  onBack,
}) => {
  // Mode: 'list' (จัดการ Payload) or 'form' (เพิ่ม / แก้ไข Payload)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields (Matches Screen 3)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [payloadText, setPayloadText] = useState(
    'CONNECT [host_port] HTTP/1.1[crlf]Host: [host_port][crlf]User-Agent: [ua][crlf]Connection: Keep-Alive[crlf][crlf]'
  );
  const [remoteProxyHost, setRemoteProxyHost] = useState('');
  const [remoteProxyPort, setRemoteProxyPort] = useState('8080');

  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingPayload, setDeletingPayload] = useState<PayloadProfile | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClear = () => {
    setName('');
    setDescription('');
    setPayloadText('');
    setRemoteProxyHost('');
    setRemoteProxyPort('8080');
    setError(null);
  };

  const handleStartCreate = () => {
    setEditingId(null);
    handleClear();
    setPayloadText('CONNECT [host_port] HTTP/1.1[crlf]Host: [host_port][crlf]User-Agent: [ua][crlf]Connection: Keep-Alive[crlf][crlf]');
    setViewMode('form');
  };

  const handleStartEdit = (p: PayloadProfile) => {
    setEditingId(p.uuid);
    setName(p.name);
    setDescription(p.description || '');
    setPayloadText(p.payload);
    setRemoteProxyHost(p.proxyHost);
    setRemoteProxyPort(String(p.proxyPort));
    setError(null);
    setViewMode('form');
  };

  const handleSave = () => {
    const n = name.trim();
    const h = remoteProxyHost.trim();
    const p = parseInt(remoteProxyPort.trim(), 10);
    const body = payloadText.trim();

    if (!n) {
      setError('กรุณากรอกชื่อ Payload');
      return;
    }
    if (!body) {
      setError('กรุณากรอกเนื้อหา Payload');
      return;
    }
    if (!h) {
      setError('กรุณากรอก Remote Proxy Host');
      return;
    }
    if (isNaN(p) || p < 1 || p > 65535) {
      setError('Remote Proxy Port ต้องเป็นตัวเลขระหว่าง 1 ถึง 65535');
      return;
    }

    const parsed = parseConnectPayload(body, 'proxy.test.com', 22);
    if (!parsed.valid) {
      setError(`ข้อผิดพลาดของรูปแบบ Payload: ${parsed.error}`);
      return;
    }

    const payloadToSave: PayloadProfile = {
      uuid: editingId || `payload-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: n,
      description: description.trim(),
      proxyHost: h,
      proxyPort: p,
      payload: payloadText,
    };

    onSavePayload(payloadToSave);
    showToast(editingId ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่ม Payload สำเร็จ');
    setViewMode('list');
  };

  const confirmDelete = () => {
    if (!deletingPayload) return;
    const res = onDeletePayload(deletingPayload.uuid);
    if (res.affectedServers > 0) {
      showToast(`ลบแล้ว (ปรับปรุง ${res.affectedServers} เซิร์ฟเวอร์เป็นโหมด Direct SSH)`);
    } else {
      showToast('ลบ Payload เรียบร้อยแล้ว');
    }
    setDeletingPayload(null);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#00E676]/20 border border-[#00E676] rounded-2xl p-3 flex items-center space-x-2 text-[#00E676] text-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: จัดการ Payload (Matches Screen 4) */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Top Bar (Screen 4) */}
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-1 rounded-lg text-gray-300 hover:text-white"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-white">จัดการ Payload</h2>
            </div>

            <button
              onClick={handleStartCreate}
              className="p-1.5 rounded-lg text-[#00E676] hover:bg-emerald-950/60 transition"
              title="เพิ่ม Payload ใหม่"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* List of Payloads */}
          <div className="space-y-2.5">
            {payloads.map((payload) => {
              const isSelected = activePayloadId === payload.uuid;

              return (
                <div
                  key={payload.uuid}
                  className={`bg-[#0b1810] rounded-2xl p-3.5 border transition flex items-center justify-between ${
                    isSelected
                      ? 'border-[#00E676]/80 shadow-[0_0_15px_rgba(0,230,118,0.2)]'
                      : 'border-emerald-950/80 hover:border-emerald-800'
                  }`}
                >
                  {/* Selector & Info */}
                  <div
                    className="flex items-center space-x-3 flex-1 cursor-pointer select-none"
                    onClick={() => onSetActivePayload(payload.uuid)}
                  >
                    {/* Radio Ring matching Screen 4 */}
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500/60 flex items-center justify-center shrink-0">
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white leading-tight">
                        {payload.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        Proxy: {payload.proxyHost}:{payload.proxyPort}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center space-x-2 text-gray-400">
                    <button
                      onClick={() => handleStartEdit(payload)}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-emerald-950/60 transition"
                      title="แก้ไข Payload"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPayload(payload)}
                      className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-950/40 transition"
                      title="ลบ Payload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: เพิ่ม / แก้ไข Payload (Matches Screen 3) */}
      {/* ========================================================= */}
      {viewMode === 'form' && (
        <div className="space-y-4">
          {/* Top Bar (Screen 3) */}
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('list')}
                className="p-1 rounded-lg text-gray-300 hover:text-white"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-white">
                {editingId ? 'แก้ไข Payload' : 'เพิ่ม Payload'}
              </h2>
            </div>

            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg text-gray-300 hover:text-[#00E676] transition"
              title="บันทึก"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-600/50 rounded-2xl p-3 flex items-center space-x-2 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields (Matches Screen 3) */}
          <div className="space-y-3.5">
            {/* Field 1: ชื่อ Payload * */}
            <div className="space-y-1">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                <Box className="w-3.5 h-3.5 text-[#00E676]" />
                <span>ชื่อ Payload *</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น MyPayload-TH"
                className="w-full bg-[#0b1810] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
              />
            </div>

            {/* Field 2: รายละเอียด (ไม่บังคับ) */}
            <div className="space-y-1">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                <FileCode className="w-3.5 h-3.5 text-gray-400" />
                <span>รายละเอียด (ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="คำอธิบายการใช้งาน"
                className="w-full bg-[#0b1810] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
              />
            </div>

            {/* Field 3: Payload * */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                  <Box className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Payload *</span>
                </label>
                {/* Tag inserters */}
                <div className="flex gap-1 text-[10px] font-mono">
                  {['[host_port]', '[ua]', '[crlf]'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPayloadText((prev) => prev + tag)}
                      className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-900"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={4}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                placeholder="กรอก Payload เองทั้งหมด..."
                className="w-full bg-[#0b1810] border border-emerald-950 focus:border-[#00E676] rounded-xl p-3 text-xs font-mono text-gray-200 outline-none leading-relaxed"
              />
            </div>

            {/* Field 4: Remote Proxy Host * */}
            <div className="space-y-1">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                <Box className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Remote Proxy Host *</span>
              </label>
              <input
                type="text"
                value={remoteProxyHost}
                onChange={(e) => setRemoteProxyHost(e.target.value)}
                placeholder="เช่น proxy.example.com"
                className="w-full bg-[#0b1810] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            {/* Field 5: Remote Proxy Port * */}
            <div className="space-y-1">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-gray-300">
                <Box className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Remote Proxy Port *</span>
              </label>
              <input
                type="number"
                min="1"
                max="65535"
                value={remoteProxyPort}
                onChange={(e) => setRemoteProxyPort(e.target.value)}
                placeholder="เช่น 8080 (1-65535)"
                className="w-full bg-[#0b1810] border border-emerald-950 focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Action Buttons: ล้างข้อมูล & บันทึก (Matches Screen 3) */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="py-3.5 rounded-full bg-[#202e25] hover:bg-[#2a3c30] text-gray-200 text-sm font-semibold transition"
            >
              ล้างข้อมูล
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="py-3.5 rounded-full bg-[#00E676] hover:bg-[#00c853] text-black text-sm font-bold shadow-[0_0_20px_rgba(0,230,118,0.4)] transition"
            >
              บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deletingPayload && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0b1810] rounded-3xl max-w-sm w-full p-5 border border-emerald-900/60 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>ยืนยันการลบ Payload</span>
            </h3>

            <p className="text-xs text-gray-300">
              คุณต้องการลบ Payload <strong className="text-white">"{deletingPayload.name}"</strong> ใช่หรือไม่?
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPayload(null)}
                className="px-3.5 py-2 rounded-xl bg-[#1c2b21] text-gray-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
