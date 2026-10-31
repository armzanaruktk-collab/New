import React, { useState } from 'react';
import { X, Smartphone, Download, Check, Copy, Terminal, GitBranch, Shield, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const buildCommand = `./gradlew --no-daemon clean assembleDebug`;

  const copyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1810] rounded-3xl max-w-md w-full p-6 border border-emerald-900/60 shadow-[0_0_50px_rgba(0,230,118,0.25)] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-[#00E676]" />
            <h3 className="text-base font-bold text-white">ติดตั้ง / Build APK</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Instant Install (PWA / Standalone App on Android) */}
        <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#00E676] flex items-center space-x-1.5">
              <Download className="w-4 h-4" />
              <span>วิธีที่ 1: ติดตั้งลงหน้าจอหลักมือถือทันที (PWA)</span>
            </div>
            {isInstalled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-[#00E676] border border-[#00E676]">
                ติดตั้งแล้ว
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            ติดตั้งแอป godarmxvpn ลงบนอุปกรณ์ Android หรือ iOS เพื่อใช้งานแบบเต็มหน้าจอ (Standalone) พร้อมบันทึกโพรไฟล์และ Payload อัตโนมัติ
          </p>

          {isInstallable ? (
            <button
              onClick={install}
              className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,230,118,0.4)] transition"
            >
              <Download className="w-4 h-4" />
              <span>แตะเพื่อติดตั้งแอปลงในเครื่องทันที</span>
            </button>
          ) : isIOS ? (
            <div className="text-[11px] text-gray-400 bg-[#0c1c11] p-2.5 rounded-xl border border-emerald-950">
              สำหรับ iPhone/iPad: แตะปุ่ม <strong>แชร์ (Share)</strong> ใน Safari แล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"</strong>
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 bg-[#0c1c11] p-2.5 rounded-xl border border-emerald-950">
              หากเปิดใน Chrome บน Android ให้กดเมนู <strong>⋮ (3 จุด)</strong> แล้วเลือก <strong>"ติดตั้งแอป"</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong>
            </div>
          )}
        </div>

        {/* Method 2: GitHub Actions Automated APK Workflow */}
        <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-2.5">
          <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
            <GitBranch className="w-4 h-4" />
            <span>วิธีที่ 2: Build ไฟล์ .apk อัตโนมัติผ่าน GitHub Actions</span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            ในโปรเจกต์นี้มีไฟล์ Workflow <code className="text-[#00E676]">.github/workflows/android-apk.yml</code> เตรียมไว้เรียบร้อยแล้ว
          </p>

          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-gray-300">
            <li>เข้าไปที่ GitHub Repository ของคุณ</li>
            <li>ไปที่แท็บ <strong>Actions</strong> $\rightarrow$ เลือก <strong>Android APK</strong></li>
            <li>กด <strong>Run workflow</strong></li>
            <li>เมื่อ Build เสร็จ สามารถดาวน์โหลดไฟล์ <strong>godarmxvpn-debug-apk</strong> ได้ทันที</li>
          </ol>
        </div>

        {/* Method 3: Local CLI Build */}
        <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-2">
          <div className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>วิธีที่ 3: Build APK ในคอมพิวเตอร์ / Android Studio</span>
          </div>

          <p className="text-[11px] text-gray-400">
            เปิดเทอร์มินัลในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
          </p>

          <div className="flex items-center justify-between bg-[#020704] p-2.5 rounded-xl border border-emerald-950 font-mono text-xs text-[#00E676]">
            <span className="truncate">{buildCommand}</span>
            <button
              onClick={copyCommand}
              className="ml-2 p-1 text-gray-400 hover:text-white"
              title="คัดลอกคำสั่ง"
            >
              {copied ? <Check className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[10px] text-gray-400">
            ไฟล์ APK จะถูกสร้างที่: <code className="text-gray-300">app/build/outputs/apk/debug/app-debug.apk</code>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1c2c20] hover:bg-[#263c2c] text-white text-xs font-semibold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
