import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { PayloadManagerScreen } from './components/PayloadManagerScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NewConnectionScreen } from './components/NewConnectionScreen';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { MenuDrawer } from './components/MenuDrawer';
import { ConnectingModal } from './components/ConnectingModal';
import { LogsConsole } from './components/LogsConsole';
import { HelpModal } from './components/HelpModal';
import { ApkBuildModal } from './components/ApkBuildModal';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { storage } from './services/storage';
import { vpnTunnelEngine } from './services/vpnTunnelEngine';
import {
  SSHConnectionProfile,
  PayloadProfile,
  AppSettings,
  ConnectionStatus,
  ConnectionMetrics,
  LogEntry,
  ConnectionMode
} from './types';
import { Terminal, Shield, Check, Info, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState(false);
  const [editingServerProfile, setEditingServerProfile] = useState<SSHConnectionProfile | null>(null);

  // Data Collections
  const [profiles, setProfiles] = useState<SSHConnectionProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [payloadProfiles, setPayloadProfiles] = useState<PayloadProfile[]>([]);
  const [activePayloadId, setActivePayloadId] = useState<string>('');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('PAYLOAD');
  const [settings, setSettings] = useState<AppSettings>(storage.loadSettings());

  // Connection Engine States
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [metrics, setMetrics] = useState<ConnectionMetrics>(vpnTunnelEngine.getMetrics());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Logs & Help
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Initial Data
  useEffect(() => {
    const loadedProfiles = storage.loadSSHProfiles();
    const loadedPayloads = storage.loadPayloadProfiles();
    const loadedSettings = storage.loadSettings();
    const storedActivePayload = storage.getActivePayloadUuid();

    setProfiles(loadedProfiles);
    setPayloadProfiles(loadedPayloads);
    setSettings(loadedSettings);

    if (loadedProfiles.length > 0) {
      setSelectedProfileId(loadedProfiles[0].uuid);
      if (loadedProfiles[0].connectionMode) {
        setConnectionMode(loadedProfiles[0].connectionMode);
      }
    }
    if (loadedPayloads.length > 0) {
      const activeOne = loadedPayloads.find((p) => p.uuid === storedActivePayload) || loadedPayloads[0];
      setActivePayloadId(activeOne.uuid);
    }
  }, []);

  const handleSelectProfile = (uuid: string) => {
    setSelectedProfileId(uuid);
    const p = profiles.find((prof) => prof.uuid === uuid);
    if (p) {
      if (p.connectionMode) setConnectionMode(p.connectionMode);
      if (p.payloadUuid) setActivePayloadId(p.payloadUuid);
    }
  };

  const handleSelectPayload = (uuid: string) => {
    setActivePayloadId(uuid);
    storage.setActivePayloadUuid(uuid);
  };

  // Subscribe to VPN Engine
  useEffect(() => {
    const unsubState = vpnTunnelEngine.subscribeState((status, newMetrics, err) => {
      setConnectionStatus(status);
      setMetrics(newMetrics);

      if (status === 'connecting') {
        setShowConnectingModal(true);
      } else if (status === 'connected') {
        showToast('เชื่อมต่อ SSH สำเร็จ');
      } else if (status === 'disconnected') {
        setShowConnectingModal(false);
      } else if (err) {
        showToast(`ผิดพลาด: ${err}`);
      }
    });

    const unsubLogs = vpnTunnelEngine.subscribeLogs((newEntry) => {
      setLogs((prev) => [...prev, newEntry]);
    });

    setLogs(vpnTunnelEngine.getLogs());

    return () => {
      unsubState();
      unsubLogs();
    };
  }, []);

  // Connect Handler
  const handleConnect = async () => {
    const activeProf = profiles.find((p) => p.uuid === selectedProfileId);
    if (!activeProf) {
      showToast('กรุณาเลือกเซิร์ฟเวอร์ก่อน');
      return;
    }

    const activePayload = connectionMode === 'PAYLOAD'
      ? payloadProfiles.find((p) => p.uuid === activePayloadId) || null
      : null;

    setShowConnectingModal(true);
    await vpnTunnelEngine.connect(activeProf, activePayload, connectionMode, settings);
  };

  // Disconnect / Exit Handler ("ออก จาก serverssh")
  const handleDisconnect = () => {
    vpnTunnelEngine.disconnect();
    setShowConnectingModal(false);
    showToast('ออกจาก serverssh เรียบร้อยแล้ว (Disconnected)');
  };

  // Profile Management
  const handleSaveProfile = (profile: SSHConnectionProfile) => {
    storage.saveSSHProfile(profile);
    const updated = storage.loadSSHProfiles();
    setProfiles(updated);
    setSelectedProfileId(profile.uuid);
    setIsEditingServer(false);
    setEditingServerProfile(null);
    showToast('บันทึกเซิร์ฟเวอร์เรียบร้อย');
  };

  const handleDeleteProfile = (uuid: string) => {
    if (connectionStatus === 'connected' && selectedProfileId === uuid) {
      showToast('ไม่สามารถลบเซิร์ฟเวอร์ที่กำลังเชื่อมต่ออยู่ได้');
      return;
    }
    storage.deleteSSHProfile(uuid);
    const updated = storage.loadSSHProfiles();
    setProfiles(updated);
    if (selectedProfileId === uuid && updated.length > 0) {
      setSelectedProfileId(updated[0].uuid);
    }
    setIsEditingServer(false);
    setEditingServerProfile(null);
    showToast('ลบเซิร์ฟเวอร์เรียบร้อย');
  };

  // Payload Management
  const handleSavePayload = (payload: PayloadProfile) => {
    storage.savePayloadProfile(payload);
    const updated = storage.loadPayloadProfiles();
    setPayloadProfiles(updated);
  };

  const handleDeletePayload = (uuid: string) => {
    const res = storage.deletePayloadProfile(uuid);
    const updated = storage.loadPayloadProfiles();
    setPayloadProfiles(updated);
    setProfiles(storage.loadSSHProfiles());
    if (activePayloadId === uuid && updated.length > 0) {
      setActivePayloadId(updated[0].uuid);
    }
    return res;
  };

  // Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('บันทึกการตั้งค่าแล้ว');
  };

  return (
    <AndroidPhoneFrame
      status={connectionStatus}
      onHomeClick={() => {
        setIsEditingServer(false);
        setCurrentTab('home');
      }}
    >
      {/* Toast Notice */}
      {toastMessage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#00E676] text-black font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(0,230,118,0.5)] text-xs flex items-center space-x-1.5 animate-bounce whitespace-nowrap">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Log Console toggle icon */}
      <button
        onClick={() => setShowLogs((prev) => !prev)}
        className="absolute bottom-16 right-3 z-30 p-2.5 rounded-full bg-[#0a1b11] border border-emerald-800 text-[#00E676] shadow-lg hover:bg-emerald-950 transition"
        title="เปิด Console ดู Logs"
      >
        <Terminal className="w-4 h-4" />
      </button>

      {/* Main Screen Content */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        {isEditingServer ? (
          <NewConnectionScreen
            editingProfile={editingServerProfile}
            payloadProfiles={payloadProfiles}
            onSave={handleSaveProfile}
            onDelete={handleDeleteProfile}
            onCancel={() => {
              setIsEditingServer(false);
              setEditingServerProfile(null);
            }}
            onManagePayloads={() => {
              setIsEditingServer(false);
              setCurrentTab('payload');
            }}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                profiles={profiles}
                selectedProfileId={selectedProfileId}
                onSelectProfile={handleSelectProfile}
                payloadProfiles={payloadProfiles}
                activePayloadId={activePayloadId}
                onSelectPayload={handleSelectPayload}
                connectionMode={connectionMode}
                onChangeConnectionMode={(mode) => setConnectionMode(mode)}
                settings={settings}
                status={connectionStatus}
                metrics={metrics}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onEditProfile={(prof) => {
                  setEditingServerProfile(prof);
                  setIsEditingServer(true);
                }}
                onOpenPayloadTab={() => setCurrentTab('payload')}
                onOpenApkModal={() => setShowApkModal(true)}
                onOpenMenu={() => setIsMenuOpen(true)}
              />
            )}

            {currentTab === 'payload' && (
              <PayloadManagerScreen
                payloads={payloadProfiles}
                activePayloadId={activePayloadId}
                onSetActivePayload={handleSelectPayload}
                sshProfiles={profiles}
                onSavePayload={handleSavePayload}
                onDeletePayload={handleDeletePayload}
                onBack={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onExportData={() => storage.exportAllData()}
                onImportData={(json) => {
                  const ok = storage.importData(json);
                  if (ok) {
                    setProfiles(storage.loadSSHProfiles());
                    setPayloadProfiles(storage.loadPayloadProfiles());
                    setSettings(storage.loadSettings());
                  }
                  return ok;
                }}
                onResetDefaults={() => {
                  storage.resetToDefaults();
                  setProfiles(storage.loadSSHProfiles());
                  setPayloadProfiles(storage.loadPayloadProfiles());
                  setSettings(storage.loadSettings());
                }}
                onBack={() => setCurrentTab('home')}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom 4-Tab Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'menu') {
            setIsMenuOpen(true);
          } else {
            setIsEditingServer(false);
            setCurrentTab(tab);
          }
        }}
      />

      {/* Slide-out Menu Drawer (Screen 6) */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectTab={(tab) => {
          setIsEditingServer(false);
          setCurrentTab(tab);
        }}
        onOpenGuide={() => setShowGuide(true)}
        onOpenAbout={() => setShowAbout(true)}
        onOpenApkModal={() => setShowApkModal(true)}
        status={connectionStatus}
        onExitServerSSH={handleDisconnect}
      />

      {/* Connecting / Status Dialog (Screen 5) */}
      <ConnectingModal
        isOpen={showConnectingModal}
        status={connectionStatus}
        metrics={metrics}
        mode={connectionMode}
        onCancelOrDisconnect={handleDisconnect}
        onDismiss={() => setShowConnectingModal(false)}
      />

      {/* APK / PWA Install Modal */}
      <ApkBuildModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />

      {/* Logs Console */}
      <LogsConsole
        logs={logs}
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        onClear={() => {
          vpnTunnelEngine.clearLogs();
          setLogs([]);
        }}
      />

      {/* User Guide Modal (คู่มือการใช้งาน) */}
      <HelpModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* About Modal (เกี่ยวกับแอป) */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0b1810] rounded-3xl max-w-sm w-full p-5 border border-emerald-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#00E676]" />
                <h3 className="text-base font-bold text-white">godarmxvpn</h3>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-300 space-y-2">
              <p>
                <strong className="text-white">เวอร์ชั่น:</strong> v1.0.0
              </p>
              <p>
                ระบบจำลอง VPN over SSH สไตล์ Android แท้ พร้อมโหมด Direct SSH และ HTTP CONNECT Payload Injection
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-2.5 rounded-xl bg-[#00E676] text-black font-bold text-xs"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </AndroidPhoneFrame>
  );
}

export default App;
