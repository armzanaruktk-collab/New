export type ConnectionMode = 'DIRECT' | 'PAYLOAD';

export interface SSHConnectionProfile {
  uuid: string;
  displayName: string;
  serverIP: string;
  serverPort: number;
  username: string;
  authenticationType: 'PASSWORD' | 'PRIVATE_KEY';
  password?: string;
  privateKey?: string;
  connectionMode: ConnectionMode;
  payloadUuid?: string | null;
  countryFlag?: string; // e.g. '🇹🇭', '🇸🇬', '🇩🇪', '🇺🇸'
  version?: string; // e.g. '1.1'
}

export interface PayloadProfile {
  uuid: string;
  name: string;
  description: string;
  proxyHost: string;
  proxyPort: number;
  payload: string;
  isActive?: boolean;
}

export interface AppSettings {
  dnsResolverIp: string;
  forwarderPort: number;
  includedApps: string[];
  keepaliveInterval: number;
  timeoutSeconds: number;
  theme: 'dark' | 'neon-green';
  language: 'th' | 'en';
}

export interface AppInfo {
  packageName: string;
  humanName: string;
  category: string;
  iconName: string;
  isSystem: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface ConnectionMetrics {
  bytesUp: number;
  bytesDown: number;
  uploadSpeed: number;
  downloadSpeed: number;
  pingMs: number | null;
  uptimeSeconds: number;
  stageName: string;
  localSocksPort: number;
  stageStep: number; // 1: Proxy, 2: SSH, 3: Network/VPN
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  tag: string;
  message: string;
}
