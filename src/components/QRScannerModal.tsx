import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Clipboard,
  Server,
  ArrowRight
} from 'lucide-react';
import { SSHConnectionProfile } from '../types';
import { parseSSHFromQRCode } from '../utils/qrParser';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileScanned: (profile: SSHConnectionProfile) => void;
  defaultPayloadUuid?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onProfileScanned,
  defaultPayloadUuid,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [scannedResult, setScannedResult] = useState<SSHConnectionProfile | null>(null);
  const [rawScannedText, setRawScannedText] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('เบราว์เซอร์นี้ไม่รองรับการเปิดกล้อง กรุณาใช้วิธีอัปโหลดรูปภาพ');
      setHasCameraPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check torch support
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.() as { torch?: boolean } | undefined;
        setHasTorch(!!capabilities?.torch);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        scanFrame();
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('ไม่ได้รับอนุญาตให้เข้าถึงกล้อง กรุณาอนุญาตหรืออัปโหลดรูปภาพแทน');
      } else {
        setCameraError('ไม่สามารถเปิดกล้องได้: ' + (e.message || 'ข้อผิดพลาดระบบ'));
      }
      setHasCameraPermission(false);
    }
  };

  // Continuously scan video frames
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || scannedResult) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        handleRawDataFound(code.data);
        return; // stop scanning after successful detection
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Process raw QR code text
  const handleRawDataFound = (data: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate(50);
    } catch {}

    setRawScannedText(data);
    const parsed = parseSSHFromQRCode(data, defaultPayloadUuid);

    if (parsed.success && parsed.profile) {
      setScannedResult(parsed.profile);
      stopCamera();
    } else {
      setCameraError(parsed.error || 'ข้อมูล QR Code ไม่ถูกต้อง');
    }
  };

  // Scan from Uploaded Image File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleRawDataFound(code.data);
        } else {
          setCameraError('ไม่พบ QR Code ในรูปภาพที่เลือก');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Toggle Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchOn;
      await (track.applyConstraints as (c: unknown) => Promise<void>)({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch not supported', err);
    }
  };

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Reset and Scan Again
  const handleScanAgain = () => {
    setScannedResult(null);
    setRawScannedText(null);
    setCameraError(null);
    startCamera();
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (scannedResult) {
      onProfileScanned(scannedResult);
      handleClose();
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    handleRawDataFound(manualText.trim());
  };

  const handleClose = () => {
    stopCamera();
    setScannedResult(null);
    setRawScannedText(null);
    setCameraError(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#0b1810] rounded-3xl max-w-sm w-full border border-emerald-900/60 shadow-[0_0_50px_rgba(0,230,118,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-950 bg-[#07130b]">
          <div className="flex items-center space-x-2 text-white">
            <QrCode className="w-5 h-5 text-[#00E676]" />
            <h3 className="text-sm font-bold tracking-wide">สแกน QR Code นำเข้าเซิร์ฟเวอร์</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* ========================================================= */}
          {/* STATE 1: SCANNER VIEWPORT */}
          {/* ========================================================= */}
          {!scannedResult ? (
            <>
              {/* Camera Container with Animated Reticle */}
              <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border-2 border-emerald-900/60 flex items-center justify-center shadow-inner">
                {/* Video Stream */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Green Neon Reticle / Viewfinder */}
                <div className="absolute inset-8 border border-emerald-500/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(0,230,118,0.15)]">
                  {/* Corner Accents */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-[#00E676]" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-[#00E676]" />
                  </div>

                  {/* Center Scanning Beam */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#00E676] to-transparent shadow-[0_0_8px_#00E676] animate-pulse" />

                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-[#00E676]" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-[#00E676]" />
                  </div>
                </div>

                {/* Controls Overlay over Video */}
                <div className="absolute top-2 right-2 flex space-x-1.5 z-10">
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl backdrop-blur-md transition ${
                        torchOn
                          ? 'bg-[#00E676] text-black shadow-[0_0_10px_#00E676]'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                      title="เปิด/ปิด แฟลช"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleFacingMode}
                    className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition"
                    title="สลับกล้องหน้า/หลัง"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtitle Hint */}
                <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                  <span className="text-[11px] font-medium text-emerald-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    จัดตำแหน่ง QR Code ให้อยู่ในกรอบ
                  </span>
                </div>
              </div>

              {/* Error Notice */}
              {cameraError && (
                <div className="bg-rose-950/40 border border-rose-600/50 rounded-2xl p-3 flex items-start space-x-2 text-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">แจ้งเตือน:</span>
                    <span>{cameraError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Upload Image & Manual Text */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-[#0e2114] hover:bg-[#15311e] border border-emerald-900/80 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>เลือกรูปจากเครื่อง</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Manual Text / Paste Button */}
                <button
                  type="button"
                  onClick={() => setShowManualInput((prev) => !prev)}
                  className="py-2.5 px-3 rounded-xl bg-[#0e2114] hover:bg-[#15311e] border border-emerald-900/80 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Clipboard className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>{showManualInput ? 'ปิดข้อความ' : 'วางข้อความ SSH'}</span>
                </button>
              </div>

              {/* Manual Input Drawer */}
              {showManualInput && (
                <div className="bg-[#050f09] p-3 rounded-2xl border border-emerald-950 space-y-2">
                  <label className="text-[11px] font-semibold text-gray-300 block">
                    วางข้อความ SSH URI หรือ JSON:
                  </label>
                  <textarea
                    rows={2}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="เช่น ssh://root:pass123@103.20.12.5:22#Server01 หรือ JSON"
                    className="w-full bg-[#0a1b11] border border-emerald-900/60 rounded-xl p-2 text-xs font-mono text-white outline-none focus:border-[#00E676]"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setManualText('ssh://root:secretPass123@103.20.12.88:22#🇹🇭 TH-Fast-Node01')
                      }
                      className="text-[10px] text-gray-400 hover:text-[#00E676] underline"
                    >
                      ใส่ตัวอย่างทดสอบ
                    </button>
                    <button
                      type="button"
                      onClick={handleManualSubmit}
                      disabled={!manualText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-[#00E676] text-black font-bold text-xs disabled:opacity-50"
                    >
                      นำเข้า
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ========================================================= */
            /* STATE 2: CONFIRMATION PREVIEW OF SCANNED PROFILE */
            /* ========================================================= */
            <div className="space-y-3.5">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border-2 border-[#00E676] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,230,118,0.4)]">
                  <CheckCircle2 className="w-7 h-7 text-[#00E676]" />
                </div>
                <h4 className="text-sm font-bold text-white pt-1">ตรวจพบข้อมูลเซิร์ฟเวอร์ SSH</h4>
                <p className="text-[11px] text-gray-400">ตรวจสอบรายละเอียดก่อนบันทึกลงในรายการเซิร์ฟเวอร์</p>
              </div>

              {/* Details Card */}
              <div className="bg-[#050f09] rounded-2xl p-3.5 border border-emerald-900/80 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="text-xs text-gray-400">ชื่อเซิร์ฟเวอร์:</span>
                  <span className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>{scannedResult.countryFlag || '🇹🇭'}</span>
                    <span>{scannedResult.displayName}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="text-xs text-gray-400">โฮสต์และพอร์ต:</span>
                  <span className="text-xs font-mono font-semibold text-[#00E676]">
                    {scannedResult.serverIP}:{scannedResult.serverPort}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="text-xs text-gray-400">ชื่อผู้ใช้ (Username):</span>
                  <span className="text-xs font-mono text-gray-200">{scannedResult.username}</span>
                </div>

                <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
                  <span className="text-xs text-gray-400">การยืนยันตัวตน:</span>
                  <span className="text-xs text-gray-200">
                    {scannedResult.authenticationType === 'PASSWORD'
                      ? scannedResult.password
                        ? 'รหัสผ่าน (ระบุแล้ว)'
                        : 'รหัสผ่าน (ต้องกรอกเพิ่ม)'
                      : 'Private Key'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">โหมดการเชื่อมต่อ:</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {scannedResult.connectionMode === 'DIRECT' ? 'Direct SSH (แบบตรง)' : 'ผ่าน HTTP Payload'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-3.5 rounded-full bg-[#00E676] hover:bg-[#00c853] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] transition"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>บันทึกและเลือกใช้งานทันที</span>
                </button>

                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="w-full py-2.5 rounded-xl bg-[#132318] hover:bg-[#1a3322] text-gray-300 text-xs font-semibold transition"
                >
                  สแกนใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
