import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Check,
  Copy,
  Terminal,
  GitBranch,
  Shield,
  Layers,
  FolderArchive,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'github' | 'studio'>('pwa');

  if (!isOpen) return null;

  const buildCommand = `./gradlew --no-daemon clean assembleDebug`;

  const copyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#0b1810] rounded-3xl max-w-md w-full p-5 sm:p-6 border border-emerald-900/60 shadow-[0_0_50px_rgba(0,230,118,0.25)] space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-[#00E676]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ติดตั้งและแปลงเป็น Android App</h3>
              <p className="text-[11px] text-gray-400">เลือกวิธีติดตั้งใช้งานบนโทรศัพท์หรือสร้างไฟล์ APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-[#050f09] p-1 rounded-2xl border border-emerald-950 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1 ${
              activeTab === 'pwa'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ติดตั้งทันที</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1 ${
              activeTab === 'github'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub APK</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1 ${
              activeTab === 'studio'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Android Studio</span>
          </button>
        </div>

        {/* TAB 1: Instant Install (PWA) */}
        {activeTab === 'pwa' && (
          <div className="space-y-3">
            <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00E676] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ติดตั้งเป็นแอปจริงบนมือถือทันที (ไม่ต้องคอมไพล์)</span>
                </span>
                {isInstalled && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-[#00E676] border border-[#00E676]">
                    ติดตั้งแล้ว
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                ติดตั้งโปรเจกต์ลงบนอุปกรณ์ Android เป็นแอปพลิเคชัน Standalone แบบเต็มหน้าจอ (มีไอคอนแอปบนหน้าจอหลัก ไม่ต้องเปิดเบราว์เซอร์)
              </p>

              {isInstallable ? (
                <button
                  onClick={install}
                  className="w-full py-3.5 rounded-full bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] transition"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>แตะที่นี่เพื่อติดตั้งแอปลงในโทรศัพท์ทันที</span>
                </button>
              ) : isIOS ? (
                <div className="text-[11px] text-gray-300 bg-[#0c1c11] p-3 rounded-xl border border-emerald-900/60 space-y-1">
                  <span className="font-bold text-white block">สำหรับ iOS (iPhone / iPad):</span>
                  <span>แตะปุ่ม <strong>แชร์ (Share)</strong> ด้านล่าง Safari แล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"</strong></span>
                </div>
              ) : (
                <div className="text-[11px] text-gray-300 bg-[#0c1c11] p-3 rounded-xl border border-emerald-900/60 space-y-1">
                  <span className="font-bold text-white block">สำหรับ Android (Chrome):</span>
                  <span>แตะปุ่มเมนู <strong>⋮ (3 จุด)</strong> มุมขวาบนของเบราว์เซอร์ แล้วเลือก <strong>"ติดตั้งแอป (Install app)"</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></span>
                </div>
              )}
            </div>

            <div className="bg-[#050f09] p-3.5 rounded-2xl border border-emerald-950 space-y-1.5 text-xs">
              <span className="font-bold text-gray-200 block">สิ่งที่แอป Android ทำงานได้:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-400">
                <li>ทำงานแบบเต็มหน้าจอ (Fullscreen) สไตล์ Android แท้</li>
                <li>สแกน QR Code ผ่านกล้องหลัง/กล้องหน้า และอัปโหลดภาพ</li>
                <li>สร้างและแชร์ QR Code บันทึกเป็นรูปภาพ PNG</li>
                <li>จำลองการเชื่อมต่อ VPN over SSH และฉีด HTTP Payload</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: GitHub Actions Automated APK */}
        {activeTab === 'github' && (
          <div className="space-y-3">
            <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-3">
              <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <GitBranch className="w-4 h-4" />
                <span>Build ไฟล์ .APK อัตโนมัติใน GitHub Actions</span>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                ในโปรเจกต์มีไฟล์ Workflow <code className="text-[#00E676]">.github/workflows/android-apk.yml</code> พร้อมตัว Gradle Wrapper, Keystore, และ Assets ครบถ้วน
              </p>

              <div className="bg-[#020704] p-3 rounded-xl border border-emerald-950 space-y-2 text-[11px]">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-[#00E676] flex items-center justify-center text-xs">1</span>
                  <span>ไปที่ GitHub Repository ของคุณ</span>
                </div>
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-[#00E676] flex items-center justify-center text-xs">2</span>
                  <span>ไปที่แท็บ <strong>Actions</strong> $\rightarrow$ เลือก <strong>Android APK</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-[#00E676] flex items-center justify-center text-xs">3</span>
                  <span>กดปุ่ม <strong>Run workflow</strong> (หรือ Re-run all jobs)</span>
                </div>
                <div className="flex items-center space-x-2 text-[#00E676] font-semibold">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-[#00E676] flex items-center justify-center text-xs">4</span>
                  <span>ดาวน์โหลดไฟล์ <strong>godarmxvpn-debug-apk.apk</strong> ได้ทันที</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Android Studio Local Build */}
        {activeTab === 'studio' && (
          <div className="space-y-3">
            <div className="bg-[#050f09] p-4 rounded-2xl border border-emerald-900/60 space-y-3">
              <div className="text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>เปิดและ Build ใน Android Studio</span>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                โครงสร้างโปรเจกต์ Android ในโฟลเดอร์ <code className="text-[#00E676]">app/</code> เป็น Native Android App (Kotlin):
              </p>

              <div className="space-y-1.5 text-[11px] text-gray-300">
                <div className="flex items-center justify-between bg-[#020704] p-2 rounded-xl border border-emerald-950">
                  <span>MainActivity.kt (Kotlin + VpnService):</span>
                  <span className="text-[#00E676] font-mono">app/src/main/java/</span>
                </div>
                <div className="flex items-center justify-between bg-[#020704] p-2 rounded-xl border border-emerald-950">
                  <span>AndroidManifest.xml (VPN + Camera):</span>
                  <span className="text-[#00E676] font-mono">app/src/main/</span>
                </div>
                <div className="flex items-center justify-between bg-[#020704] p-2 rounded-xl border border-emerald-950">
                  <span>Build Script:</span>
                  <span className="text-[#00E676] font-mono">app/build.gradle.kts</span>
                </div>
              </div>

              <div className="pt-1 space-y-1">
                <span className="text-[11px] text-gray-400 block">คำสั่ง Build APK ใน Terminal:</span>
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
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#132318] hover:bg-[#1a3322] text-gray-300 hover:text-white text-xs font-semibold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
