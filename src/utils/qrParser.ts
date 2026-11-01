import { SSHConnectionProfile, ConnectionMode } from '../types';

export interface ParseQRResult {
  success: boolean;
  profile?: SSHConnectionProfile;
  error?: string;
}

export function parseSSHFromQRCode(rawData: string, defaultPayloadUuid?: string): ParseQRResult {
  if (!rawData || !rawData.trim()) {
    return { success: false, error: 'ข้อมูล QR Code ว่างเปล่า' };
  }

  const text = rawData.trim();

  // Try Method 1: JSON or Base64 JSON
  try {
    let jsonStr = text;
    if (text.startsWith('godarmx://')) {
      const b64 = text.replace('godarmx://', '').trim();
      jsonStr = atob(b64);
    } else if (!text.startsWith('{') && !text.startsWith('ssh://')) {
      try {
        const decoded = atob(text);
        if (decoded.trim().startsWith('{')) {
          jsonStr = decoded;
        }
      } catch {
        // Not base64
      }
    }

    if (jsonStr.startsWith('{')) {
      const obj = JSON.parse(jsonStr);
      if (obj.serverIP || obj.host) {
        const profile: SSHConnectionProfile = {
          uuid: `ssh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          displayName: obj.displayName || obj.name || `${obj.username || 'root'}@${obj.serverIP || obj.host}`,
          serverIP: obj.serverIP || obj.host || '',
          serverPort: Number(obj.serverPort || obj.port || 22),
          username: obj.username || obj.user || 'root',
          authenticationType: obj.authenticationType === 'PRIVATE_KEY' || obj.privateKey ? 'PRIVATE_KEY' : 'PASSWORD',
          password: obj.password || obj.pass || '',
          privateKey: obj.privateKey || '',
          connectionMode: (obj.connectionMode as ConnectionMode) || 'PAYLOAD',
          payloadUuid: obj.payloadUuid || defaultPayloadUuid || null,
          countryFlag: obj.countryFlag || detectFlag(obj.displayName || obj.name || obj.serverIP),
          version: '1.1',
        };
        return { success: true, profile };
      }
    }
  } catch (err) {
    // Continue to next parsing method
  }

  // Try Method 2: Standard SSH URI (ssh://user:password@host:port#name)
  if (text.startsWith('ssh://') || text.includes('@')) {
    try {
      const urlToParse = text.startsWith('ssh://') ? text : `ssh://${text}`;
      const url = new URL(urlToParse);
      const username = decodeURIComponent(url.username || 'root');
      const password = decodeURIComponent(url.password || '');
      const hostname = url.hostname;
      const port = url.port ? parseInt(url.port, 10) : 22;
      const name = url.hash ? decodeURIComponent(url.hash.replace('#', '')) : `${username}@${hostname}`;

      if (hostname) {
        const profile: SSHConnectionProfile = {
          uuid: `ssh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          displayName: name,
          serverIP: hostname,
          serverPort: isNaN(port) ? 22 : port,
          username: username || 'root',
          authenticationType: 'PASSWORD',
          password: password,
          privateKey: '',
          connectionMode: 'PAYLOAD',
          payloadUuid: defaultPayloadUuid || null,
          countryFlag: detectFlag(name || hostname),
          version: '1.1',
        };
        return { success: true, profile };
      }
    } catch {
      // Continue to next parsing method
    }
  }

  // Try Method 3: Line-by-line key:value pairs
  const lines = text.split(/[\r\n]+/);
  if (lines.length > 1) {
    let host = '';
    let port = 22;
    let user = 'root';
    let pass = '';
    let name = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith('host:') || lower.startsWith('ip:')) {
        host = line.split(':')[1]?.trim() || '';
      } else if (lower.startsWith('port:')) {
        port = parseInt(line.split(':')[1]?.trim() || '22', 10);
      } else if (lower.startsWith('user:') || lower.startsWith('username:')) {
        user = line.split(':')[1]?.trim() || 'root';
      } else if (lower.startsWith('pass:') || lower.startsWith('password:')) {
        pass = line.split(':').slice(1).join(':').trim();
      } else if (lower.startsWith('name:') || lower.startsWith('title:')) {
        name = line.split(':').slice(1).join(':').trim();
      }
    }

    if (host) {
      const profile: SSHConnectionProfile = {
        uuid: `ssh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        displayName: name || `${user}@${host}:${port}`,
        serverIP: host,
        serverPort: isNaN(port) ? 22 : port,
        username: user,
        authenticationType: 'PASSWORD',
        password: pass,
        privateKey: '',
        connectionMode: 'PAYLOAD',
        payloadUuid: defaultPayloadUuid || null,
        countryFlag: detectFlag(name || host),
        version: '1.1',
      };
      return { success: true, profile };
    }
  }

  // Try Method 4: Host:Port or Host:Port:User:Pass shorthand
  const parts = text.split(':');
  if (parts.length >= 2) {
    const host = parts[0].trim();
    const port = parseInt(parts[1].trim(), 10);
    const user = parts[2]?.trim() || 'root';
    const pass = parts[3]?.trim() || '';

    if (host && !isNaN(port) && port > 0 && port <= 65535) {
      const profile: SSHConnectionProfile = {
        uuid: `ssh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        displayName: `${user}@${host}:${port}`,
        serverIP: host,
        serverPort: port,
        username: user,
        authenticationType: 'PASSWORD',
        password: pass,
        privateKey: '',
        connectionMode: 'PAYLOAD',
        payloadUuid: defaultPayloadUuid || null,
        countryFlag: detectFlag(host),
        version: '1.1',
      };
      return { success: true, profile };
    }
  }

  return {
    success: false,
    error: 'ไม่พบรูปแบบข้อมูลเซิร์ฟเวอร์ SSH ที่ถูกต้องใน QR Code (รองรับ ssh://..., JSON, Host:Port)',
  };
}

function detectFlag(str: string): string {
  const s = str.toLowerCase();
  if (s.includes('th') || s.includes('thai') || s.includes('bangkok')) return '🇹🇭';
  if (s.includes('sg') || s.includes('sing') || s.includes('singapore')) return '🇸🇬';
  if (s.includes('jp') || s.includes('japan') || s.includes('tokyo')) return '🇯🇵';
  if (s.includes('us') || s.includes('usa') || s.includes('america')) return '🇺🇸';
  if (s.includes('de') || s.includes('germany') || s.includes('frankfurt')) return '🇩🇪';
  if (s.includes('hk') || s.includes('hongkong')) return '🇭🇰';
  return '🇹🇭';
}
