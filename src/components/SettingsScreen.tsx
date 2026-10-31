import React, { useState } from 'react';
import {
  ArrowLeft,
  Key,
  Shield,
  Search,
  CheckSquare,
  Square,
  Globe,
  Radio,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  HelpCircle,
  Server,
  Terminal,
  Cpu
} from 'lucide-react';
import { AppSettings, AppInfo } from '../types';
import { DEFAULT_INSTALLED_APPS } from '../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onExportData: () => string;
  onImportData: (json: string) => boolean;
  onResetDefaults: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetDefaults,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'vpn' | 'ssh' | 'backup'>('vpn');
  const [dnsIp, setDnsIp] = useState(settings.dnsResolverIp || '1.1.1.1');
  const [forwarderPort, setForwarderPort] = useState(String(settings.forwarderPort || 1080));
  const [includedApps, setIncludedApps] = useState<string[]>(settings.includedApps || []);
  const [keepaliveInterval, setKeepaliveInterval] = useState(String(settings.keepaliveInterval || 30));
  const [timeoutSeconds, setTimeoutSeconds] = useState(String(settings.timeoutSeconds || 15));

  const [appSearch, setAppSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = () => {
    const port = parseInt(forwarderPort.trim(), 10);
    const validPort = !isNaN(port) && port >= 1 && port <= 65535 ? port : 1080;
    const keepalive = parseInt(keepaliveInterval, 10) || 30;
    const timeout = parseInt(timeoutSeconds, 10) || 15;

    const newSettings: AppSettings = {
      dnsResolverIp: dnsIp.trim() || '1.1.1.1',
      forwarderPort: validPort,
      includedApps,
      keepaliveInterval: keepalive,
      timeoutSeconds: timeout,
    };

    onSaveSettings(newSettings);
    showToast('Settings saved successfully');
  };

  const toggleApp = (pkg: string) => {
    if (includedApps.includes(pkg)) {
      setIncludedApps(includedApps.filter((p) => p !== pkg));
    } else {
      setIncludedApps([...includedApps, pkg]);
    }
  };

  const selectAllApps = () => {
    setIncludedApps(DEFAULT_INSTALLED_APPS.map((a) => a.packageName));
  };

  const clearAllApps = () => {
    setIncludedApps([]);
  };

  const filteredApps = DEFAULT_INSTALLED_APPS.filter(
    (app) =>
      app.humanName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.packageName.toLowerCase().includes(appSearch.toLowerCase())
  );

  const handleExport = () => {
    const json = onExportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `godarmxvpn-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration exported');
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = onImportData(importJsonText);
    if (success) {
      showToast('Data imported successfully');
      setShowImportModal(false);
      setImportJsonText('');
    } else {
      showToast('Error: Invalid JSON backup file');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white transition"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">godarmxvpn Settings</h2>
            <div className="text-xs text-gray-400">Configure VPN routing, SOCKS forwarder, and app filters</div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-[#03DAC5] hover:bg-[#02b8a6] text-black text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <Check className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {toast && (
        <div className="bg-[#03DAC5]/15 border border-[#03DAC5]/50 rounded-xl p-3 flex items-center space-x-2 text-[#03DAC5] text-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Settings Navigation Tabs (Matches header_preferences.xml) */}
      <div className="flex items-center space-x-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#2D2D2D]">
        <button
          onClick={() => setActiveTab('vpn')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition ${
            activeTab === 'vpn'
              ? 'bg-[#262626] text-[#03DAC5] shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>VPN Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('ssh')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition ${
            activeTab === 'ssh'
              ? 'bg-[#262626] text-[#BB86FC] shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>SSH Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition ${
            activeTab === 'backup'
              ? 'bg-[#262626] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Backup & Reset</span>
        </button>
      </div>

      {/* TAB 1: VPN PREFERENCES (vpn_preferences.xml) */}
      {activeTab === 'vpn' && (
        <div className="space-y-5">
          {/* DNS Resolver IP Card */}
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#03DAC5]" />
                  <span>DNS Resolver IP</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Use a custom DNS server. Leave empty or set to 1.1.1.1 to use defaults.
                  <span className="text-amber-400/90 block mt-1">
                    Warning! DNS queries will always bypass VPN to prevent DNS leaks and routing loops.
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={dnsIp}
                onChange={(e) => setDnsIp(e.target.value)}
                placeholder="1.1.1.1"
                className="w-full max-w-xs bg-[#121212] border border-[#3A3A3A] focus:border-[#03DAC5] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
              <div className="flex gap-2 mt-2">
                {['1.1.1.1 (Cloudflare)', '8.8.8.8 (Google)', '9.9.9.9 (Quad9)'].map((preset) => {
                  const ip = preset.split(' ')[0];
                  return (
                    <button
                      key={ip}
                      type="button"
                      onClick={() => setDnsIp(ip)}
                      className="text-[11px] px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#333] text-gray-300 font-mono"
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Included Apps Section (include_apps_list_fragment.xml) */}
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#03DAC5]" />
                  <span>Included Apps (Package Routing)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose which apps will use the tunnel and which will connect directly. If none are selected, all apps are included by default.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllApps}
                  className="px-2.5 py-1 rounded bg-[#2A2A2A] hover:bg-[#333] text-gray-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAllApps}
                  className="px-2.5 py-1 rounded bg-[#2A2A2A] hover:bg-[#333] text-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search packages or app names..."
                className="w-full bg-[#121212] border border-[#333] focus:border-[#03DAC5] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
            </div>

            {/* App List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isSelected = includedApps.includes(app.packageName);
                return (
                  <div
                    key={app.packageName}
                    onClick={() => toggleApp(app.packageName)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-[#03DAC5]/10 border-[#03DAC5]/30'
                        : 'bg-[#141414] border-[#252525] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center text-gray-300 font-bold text-xs">
                        {app.humanName.substring(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                          <span>{app.humanName}</span>
                          {app.isSystem && (
                            <span className="text-[10px] px-1 rounded bg-[#2C2C2C] text-gray-400">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-gray-400">{app.packageName}</div>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#03DAC5]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-gray-400 text-right">
              {includedApps.length} of {DEFAULT_INSTALLED_APPS.length} packages selected for VPN routing
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SSH PREFERENCES (ssh_preferences.xml) */}
      {activeTab === 'ssh' && (
        <div className="space-y-5">
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#BB86FC]" />
              <span>Forwarder Port</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Manually assign a port for the local SSH dynamic SOCKS5 forwarder. Port will be assigned automatically if empty (default: 1080).
            </p>

            <div className="max-w-xs">
              <input
                type="number"
                min="1"
                max="65535"
                value={forwarderPort}
                onChange={(e) => setForwarderPort(e.target.value)}
                placeholder="1080"
                className="w-full bg-[#121212] border border-[#3A3A3A] focus:border-[#BB86FC] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Listen address: socks5://127.0.0.1:{forwarderPort || '1080'}
              </span>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#BB86FC]" />
              <span>SSH Tunnel Tuning</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Keepalive Interval (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={keepaliveInterval}
                  onChange={(e) => setKeepaliveInterval(e.target.value)}
                  className="w-full bg-[#121212] border border-[#3A3A3A] focus:border-[#BB86FC] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Prevents connection drops on idle NAT gateways
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1">
                  Connect Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(e.target.value)}
                  className="w-full bg-[#121212] border border-[#3A3A3A] focus:border-[#BB86FC] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Timeout for SSH handshake and HTTP CONNECT proxy
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-[#2D2D2D] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Download className="w-4 h-4 text-[#03DAC5]" />
              <span>Export & Import Configurations</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Export all saved SSH server profiles, payload templates, and VPN settings to a portable JSON backup, or import from an existing file.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#303030] text-gray-200 text-xs font-medium flex items-center space-x-1.5 border border-[#3A3A3A]"
              >
                <Download className="w-3.5 h-3.5 text-[#03DAC5]" />
                <span>Export JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#303030] text-gray-200 text-xs font-medium flex items-center space-x-1.5 border border-[#3A3A3A]"
              >
                <Upload className="w-3.5 h-3.5 text-[#BB86FC]" />
                <span>Import JSON Backup</span>
              </button>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-xl p-5 border border-rose-900/30 space-y-3">
            <h3 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Reset Application Data</span>
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Restore default demo SSH profiles, standard payload templates, and clear custom settings.
            </p>

            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all profiles and settings to initial defaults?')) {
                  onResetDefaults();
                  showToast('App data reset to default demo records');
                }
              }}
              className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold transition"
            >
              Reset to Initial Seed Data
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] rounded-2xl max-w-lg w-full p-5 border border-[#3A3A3A] shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-[#BB86FC]" />
              <span>Import JSON Backup</span>
            </h3>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON backup contents here..."
              className="w-full bg-[#121212] border border-[#3A3A3A] focus:border-[#BB86FC] rounded-lg p-3 text-xs font-mono text-white outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-2 rounded-lg bg-[#262626] text-gray-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-lg bg-[#BB86FC] text-black font-semibold text-xs"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
