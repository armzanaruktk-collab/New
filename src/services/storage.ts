import { SSHConnectionProfile, PayloadProfile, AppSettings, AppInfo } from '../types';
import { PAYLOAD_TEMPLATES } from './payloadParser';

const SSH_PROFILES_KEY = 'godarmxvpn_ssh_profiles';
const PAYLOAD_PROFILES_KEY = 'godarmxvpn_payload_profiles';
const SETTINGS_KEY = 'godarmxvpn_settings';
const ACTIVE_PAYLOAD_KEY = 'godarmxvpn_active_payload_uuid';

export const DEFAULT_INSTALLED_APPS: AppInfo[] = [
  { packageName: 'com.android.chrome', humanName: 'Google Chrome', category: 'Browser', iconName: 'Globe', isSystem: false },
  { packageName: 'com.google.android.youtube', humanName: 'YouTube', category: 'Video', iconName: 'PlaySquare', isSystem: false },
  { packageName: 'org.telegram.messenger', humanName: 'Telegram', category: 'Communication', iconName: 'Send', isSystem: false },
  { packageName: 'com.spotify.music', humanName: 'Spotify', category: 'Audio', iconName: 'Music', isSystem: false },
  { packageName: 'com.discord', humanName: 'Discord', category: 'Communication', iconName: 'MessageSquare', isSystem: false },
  { packageName: 'com.termux', humanName: 'Termux Terminal', category: 'Developer Tools', iconName: 'Terminal', isSystem: false },
  { packageName: 'com.whatsapp', humanName: 'WhatsApp', category: 'Communication', iconName: 'MessageCircle', isSystem: false },
  { packageName: 'com.netflix.mediaclient', humanName: 'Netflix', category: 'Video', iconName: 'Film', isSystem: false },
  { packageName: 'com.google.android.apps.maps', humanName: 'Google Maps', category: 'Navigation', iconName: 'MapPin', isSystem: true },
  { packageName: 'com.twitter.android', humanName: 'X (Twitter)', category: 'Social', iconName: 'Share2', isSystem: false },
  { packageName: 'com.github.android', humanName: 'GitHub Mobile', category: 'Developer Tools', iconName: 'GitBranch', isSystem: false },
  { packageName: 'ru.anton2319.vpnoverssh', humanName: 'godarmxvpn (App itself)', category: 'System VPN', iconName: 'Shield', isSystem: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  dnsResolverIp: '1.1.1.1',
  forwarderPort: 1080,
  includedApps: [
    'com.android.chrome',
    'org.telegram.messenger',
    'com.discord',
    'com.termux',
  ],
  keepaliveInterval: 30,
  timeoutSeconds: 15,
  theme: 'neon-green',
  language: 'th',
};

const SEED_PAYLOADS: PayloadProfile[] = [
  {
    uuid: 'payload-mypayload',
    name: 'MyPayload',
    description: 'HTTP CONNECT พร้อมปรับแต่ง Header เสริม',
    proxyHost: 'proxy.example.com',
    proxyPort: 8080,
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: [host_port][crlf]User-Agent: [ua][crlf]Connection: Keep-Alive[crlf][crlf]',
    isActive: true,
  },
  {
    uuid: 'payload-th-01',
    name: 'Thailand-01',
    description: 'Proxy Gateway ในประเทศ สำหรับเซิร์ฟเวอร์ไทย',
    proxyHost: 'th-proxy.com',
    proxyPort: 8080,
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: [host_port][crlf]X-Online-Host: th-proxy.com[crlf]User-Agent: [ua][crlf]Proxy-Connection: Keep-Alive[crlf][crlf]',
    isActive: false,
  },
  {
    uuid: 'payload-bestspeed',
    name: 'BestSpeed',
    description: 'High-speed CDN Fronting tunnel',
    proxyHost: 'bestproxy.net',
    proxyPort: 80,
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: speed.cloudflare.com[crlf]User-Agent: [ua][crlf]Connection: Keep-Alive[crlf][crlf]',
    isActive: false,
  },
  {
    uuid: 'payload-cf-01',
    name: 'Cloudflare CDN Fronting',
    description: 'Bypasses SNI inspection via Cloudflare CDN edge proxy',
    proxyHost: PAYLOAD_TEMPLATES[1].proxyHost,
    proxyPort: PAYLOAD_TEMPLATES[1].proxyPort,
    payload: PAYLOAD_TEMPLATES[1].payload,
    isActive: false,
  },
];

const SEED_SSH_PROFILES: SSHConnectionProfile[] = [
  {
    uuid: 'ssh-th-ready-01',
    displayName: 'bd_ready_01',
    serverIP: 'th-node01.godarmx.net',
    serverPort: 22,
    username: 'root',
    authenticationType: 'PASSWORD',
    password: 'secure_password_th01',
    connectionMode: 'PAYLOAD',
    payloadUuid: 'payload-mypayload',
    countryFlag: '🇹🇭',
    version: '1.1',
  },
  {
    uuid: 'ssh-th-direct-02',
    displayName: 'th_server_02',
    serverIP: 'th-node02.godarmx.net',
    serverPort: 22,
    username: 'user_vpn',
    authenticationType: 'PASSWORD',
    password: 'password1234',
    connectionMode: 'DIRECT',
    payloadUuid: null,
    countryFlag: '🇹🇭',
    version: '1.1',
  },
  {
    uuid: 'ssh-sg-direct',
    displayName: 'Singapore Cloud (Direct)',
    serverIP: 'sg-node01.godarmx.net',
    serverPort: 22,
    username: 'root',
    authenticationType: 'PASSWORD',
    password: 'vless-password-123',
    connectionMode: 'DIRECT',
    payloadUuid: null,
    countryFlag: '🇸🇬',
    version: '1.1',
  },
  {
    uuid: 'ssh-fra-payload',
    displayName: 'Frankfurt Proxy (Payload Tunnel)',
    serverIP: 'fra-ssh02.tunnelhost.io',
    serverPort: 443,
    username: 'tunnel_user',
    authenticationType: 'PASSWORD',
    password: 'ssh_tunnel_secure_pass',
    connectionMode: 'PAYLOAD',
    payloadUuid: 'payload-cf-01',
    countryFlag: '🇩🇪',
    version: '1.1',
  },
];

export const storage = {
  loadSSHProfiles(): SSHConnectionProfile[] {
    try {
      const data = localStorage.getItem(SSH_PROFILES_KEY);
      if (!data) {
        this.saveSSHProfiles(SEED_SSH_PROFILES);
        return SEED_SSH_PROFILES;
      }
      return JSON.parse(data);
    } catch {
      return SEED_SSH_PROFILES;
    }
  },

  saveSSHProfiles(profiles: SSHConnectionProfile[]): void {
    localStorage.setItem(SSH_PROFILES_KEY, JSON.stringify(profiles));
  },

  saveSSHProfile(profile: SSHConnectionProfile): void {
    const list = this.loadSSHProfiles();
    const index = list.findIndex((p) => p.uuid === profile.uuid);
    if (index >= 0) {
      list[index] = profile;
    } else {
      list.push(profile);
    }
    this.saveSSHProfiles(list);
  },

  deleteSSHProfile(uuid: string): void {
    const list = this.loadSSHProfiles().filter((p) => p.uuid !== uuid);
    this.saveSSHProfiles(list);
  },

  loadPayloadProfiles(): PayloadProfile[] {
    try {
      const data = localStorage.getItem(PAYLOAD_PROFILES_KEY);
      if (!data) {
        this.savePayloadProfiles(SEED_PAYLOADS);
        return SEED_PAYLOADS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PAYLOADS;
    }
  },

  savePayloadProfiles(profiles: PayloadProfile[]): void {
    localStorage.setItem(PAYLOAD_PROFILES_KEY, JSON.stringify(profiles));
  },

  savePayloadProfile(profile: PayloadProfile): void {
    const list = this.loadPayloadProfiles();
    const index = list.findIndex((p) => p.uuid === profile.uuid);
    if (index >= 0) {
      list[index] = profile;
    } else {
      list.push(profile);
    }
    this.savePayloadProfiles(list);
  },

  deletePayloadProfile(uuid: string): { affectedServers: number } {
    const payloads = this.loadPayloadProfiles().filter((p) => p.uuid !== uuid);
    this.savePayloadProfiles(payloads);

    const servers = this.loadSSHProfiles();
    let affected = 0;
    servers.forEach((s) => {
      if (s.payloadUuid === uuid) {
        s.payloadUuid = null;
        s.connectionMode = 'DIRECT';
        affected++;
      }
    });
    if (affected > 0) {
      this.saveSSHProfiles(servers);
    }
    return { affectedServers: affected };
  },

  getActivePayloadUuid(): string {
    return localStorage.getItem(ACTIVE_PAYLOAD_KEY) || 'payload-mypayload';
  },

  setActivePayloadUuid(uuid: string): void {
    localStorage.setItem(ACTIVE_PAYLOAD_KEY, uuid);
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  exportAllData(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sshProfiles: this.loadSSHProfiles(),
      payloadProfiles: this.loadPayloadProfiles(),
      settings: this.loadSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.sshProfiles)) {
        this.saveSSHProfiles(parsed.sshProfiles);
      }
      if (Array.isArray(parsed.payloadProfiles)) {
        this.savePayloadProfiles(parsed.payloadProfiles);
      }
      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      return true;
    } catch {
      return false;
    }
  },

  resetToDefaults(): void {
    localStorage.removeItem(SSH_PROFILES_KEY);
    localStorage.removeItem(PAYLOAD_PROFILES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(ACTIVE_PAYLOAD_KEY);
  },
};
