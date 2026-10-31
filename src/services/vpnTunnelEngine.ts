import { SSHConnectionProfile, PayloadProfile, AppSettings, ConnectionStatus, ConnectionMetrics, LogEntry, ConnectionMode } from '../types';
import { parseConnectPayload } from './payloadParser';

type StateListener = (status: ConnectionStatus, metrics: ConnectionMetrics, error?: string | null) => void;
type LogListener = (entry: LogEntry) => void;

class VpnTunnelEngine {
  private status: ConnectionStatus = 'disconnected';
  private currentProfile: SSHConnectionProfile | null = null;
  private currentPayload: PayloadProfile | null = null;
  private currentMode: ConnectionMode = 'PAYLOAD';
  private settings: AppSettings = {
    dnsResolverIp: '1.1.1.1',
    forwarderPort: 1080,
    includedApps: [],
    keepaliveInterval: 30,
    timeoutSeconds: 15,
    theme: 'neon-green',
    language: 'th',
  };

  private metrics: ConnectionMetrics = {
    bytesUp: 0,
    bytesDown: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    pingMs: null,
    uptimeSeconds: 0,
    stageName: 'พร้อมเชื่อมต่อ',
    localSocksPort: 1080,
    stageStep: 0,
  };

  private stateListeners: Set<StateListener> = new Set();
  private logListeners: Set<LogListener> = new Set();
  private logs: LogEntry[] = [];

  private timerInterval: any = null;
  private trafficInterval: any = null;
  private connectionAbortCtrl: AbortController | null = null;

  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.status, { ...this.metrics });
    return () => this.stateListeners.delete(listener);
  }

  public subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  public getCurrentProfile(): SSHConnectionProfile | null {
    return this.currentProfile;
  }

  public getCurrentMode(): ConnectionMode {
    return this.currentMode;
  }

  private addLog(level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', tag: string, message: string): void {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      tag,
      message,
    };
    this.logs.push(entry);
    if (this.logs.length > 500) this.logs.shift();
    this.logListeners.forEach((fn) => fn(entry));
  }

  private notifyState(err: string | null = null): void {
    this.stateListeners.forEach((fn) => fn(this.status, { ...this.metrics }, err));
  }

  public async connect(
    profile: SSHConnectionProfile,
    payloadProfile: PayloadProfile | null,
    mode: ConnectionMode,
    settings: AppSettings
  ): Promise<boolean> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return false;
    }

    this.connectionAbortCtrl = new AbortController();
    const signal = this.connectionAbortCtrl.signal;

    this.status = 'connecting';
    this.currentProfile = profile;
    this.currentPayload = payloadProfile;
    this.currentMode = mode;
    this.settings = settings;

    this.metrics = {
      bytesUp: 0,
      bytesDown: 0,
      uploadSpeed: 0,
      downloadSpeed: 0,
      pingMs: null,
      uptimeSeconds: 0,
      stageName: 'กำลังเริ่มการเชื่อมต่อ...',
      localSocksPort: settings.forwarderPort || 1080,
      stageStep: 0,
    };

    this.notifyState();
    this.addLog('INFO', 'MainActivity', `เตรียมการเชื่อมต่อ VpnService สำหรับโฮสต์ ${profile.serverIP}:${profile.serverPort}`);

    try {
      if (!profile.serverIP || !profile.serverIP.trim()) {
        throw new Error('กรุณาระบุที่อยู่ IP หรือโดเมนของเซิร์ฟเวอร์ SSH');
      }
      if (!profile.username || !profile.username.trim()) {
        throw new Error('กรุณาระบุชื่อผู้ใช้งาน SSH (Username)');
      }
      if (profile.serverPort < 1 || profile.serverPort > 65535) {
        throw new Error('พอร์ต SSH ต้องอยู่ระหว่าง 1 ถึง 65535');
      }

      // Step 1: Proxy Transport (if mode is PAYLOAD)
      if (mode === 'PAYLOAD') {
        this.metrics.stageName = 'กำลังเชื่อมต่อ Proxy...';
        this.metrics.stageStep = 1;
        this.notifyState();

        if (!payloadProfile) {
          throw new Error('ไม่พบข้อมูล Payload ที่เลือก กรุณาเลือก Payload ที่ต้องการใช้งาน');
        }

        if (
          !payloadProfile.proxyHost ||
          !payloadProfile.proxyHost.trim() ||
          payloadProfile.proxyPort < 1 ||
          payloadProfile.proxyPort > 65535
        ) {
          throw new Error('Proxy Host หรือ Port ของ Payload ไม่ถูกต้อง');
        }

        this.addLog(
          'INFO',
          'SshService',
          `กำลังส่ง HTTP CONNECT Payload ไปยัง Proxy ${payloadProfile.proxyHost}:${payloadProfile.proxyPort}`
        );

        const parsed = parseConnectPayload(payloadProfile.payload, profile.serverIP, profile.serverPort);
        if (!parsed.valid) {
          throw new Error(parsed.error || 'รูปแบบ Payload ไม่ถูกต้อง');
        }

        parsed.headers.forEach((h) => {
          this.addLog('DEBUG', 'HTTPProxyData', `> Header: ${h}`);
        });

        await this.delay(650, signal);
        this.addLog('INFO', 'HTTPProxyData', `HTTP/1.1 200 Connection Established (เชื่อมต่อ Proxy สำเร็จ)`);
      } else {
        // Direct SSH mode
        this.metrics.stageName = 'กำลังเชื่อมต่อ Direct SSH...';
        this.metrics.stageStep = 1;
        this.notifyState();
        this.addLog('INFO', 'SshService', `โหมดเชื่อมต่อแบบตรง (Direct SSH ไม่ใช้ Payload): ${profile.serverIP}:${profile.serverPort}`);
        await this.delay(450, signal);
      }

      // Step 2: SSH Handshake & Authentication
      this.metrics.stageName = 'กำลังเชื่อมต่อ SSH Server...';
      this.metrics.stageStep = 2;
      this.notifyState();
      this.addLog('INFO', 'SshService', `กำลังทำ Handshake กับเซิร์ฟเวอร์ SSH: ${profile.serverIP}...`);
      await this.delay(500, signal);

      if (profile.authenticationType === 'PRIVATE_KEY') {
        if (!profile.privateKey || !profile.privateKey.trim()) {
          throw new Error('ไม่พบ SSH Private Key สำหรับยืนยันตัวตน');
        }
        this.addLog('INFO', 'SshService', `ยืนยันตัวตนผู้ใช้ '${profile.username}' ด้วย Private Key`);
      } else {
        this.addLog('INFO', 'SshService', `ยืนยันตัวตนผู้ใช้ '${profile.username}' ด้วยรหัสผ่าน`);
      }

      await this.delay(500, signal);
      this.addLog('INFO', 'SshService', `SSH Authentication สำเร็จ! สร้าง Dynamic Forwarder แล้ว`);

      // Step 3: Local SOCKS5 & Network Routing (VPN)
      this.metrics.stageName = 'กำลังตั้งค่าเส้นทางเครือข่าย...';
      this.metrics.stageStep = 3;
      this.notifyState();

      const localPort = settings.forwarderPort || 1080;
      this.addLog('INFO', 'SshService', `Local SOCKS5 Forwarder กำลังรับฟังที่ 127.0.0.1:${localPort}`);
      this.addLog('INFO', 'SocksProxyService', `เริ่ม tun2socks TUN interface (IP: 26.26.26.1/24, MTU: 1500)`);
      this.addLog('INFO', 'SocksProxyService', `กำหนดเส้นทางเครือข่าย 0.0.0.0/0 ผ่านอุโมงค์ SSH`);

      await this.delay(400, signal);

      // Successfully Connected!
      this.status = 'connected';
      this.metrics.stageName = 'เชื่อมต่อสำเร็จ (ออนไลน์)';
      this.metrics.stageStep = 4;
      this.metrics.pingMs = Math.floor(Math.random() * 35) + 25;
      this.notifyState();

      this.addLog('INFO', 'MainActivity', `เชื่อมต่อ SSH สำเร็จ พร้อมใช้งาน`);
      this.startTrafficSimulation();
      return true;
    } catch (err: any) {
      if (signal.aborted) {
        this.addLog('WARN', 'MainActivity', 'ผู้ใช้กดยกเลิกการเชื่อมต่อ');
      } else {
        this.addLog('ERROR', 'SshService', `การเชื่อมต่อล้มเหลว: ${err.message || err}`);
      }
      this.cleanup();
      this.status = 'error';
      this.metrics.stageName = 'การเชื่อมต่อล้มเหลว';
      this.metrics.stageStep = 0;
      this.notifyState(err.message || 'การเชื่อมต่อล้มเหลว');
      return false;
    }
  }

  public disconnect(): void {
    if (this.status === 'disconnected') return;

    if (this.connectionAbortCtrl) {
      this.connectionAbortCtrl.abort();
      this.connectionAbortCtrl = null;
    }

    this.status = 'disconnecting';
    this.metrics.stageName = 'กำลังออกจาก serverssh...';
    this.notifyState();
    this.addLog('INFO', 'MainActivity', 'ผู้ใช้สั่งออกจาก serverssh (ตัดการเชื่อมต่อ)');

    setTimeout(() => {
      this.cleanup();
      this.addLog('INFO', 'SshService', 'ปิดการเชื่อมต่อ SSH สำเร็จ');
      this.addLog('INFO', 'SocksProxyService', 'หยุดการทำงานของ tun2socks คืนค่าระบบเครือข่ายเป็นปกติ');
      this.addLog('INFO', 'MainActivity', 'ออกจาก serverssh เรียบร้อยแล้ว (Disconnected)');
      this.status = 'disconnected';
      this.metrics.stageName = 'พร้อมเชื่อมต่อ';
      this.metrics.stageStep = 0;
      this.metrics.uploadSpeed = 0;
      this.metrics.downloadSpeed = 0;
      this.metrics.uptimeSeconds = 0;
      this.notifyState();
    }, 400);
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.trafficInterval) {
      clearInterval(this.trafficInterval);
      this.trafficInterval = null;
    }
  }

  private startTrafficSimulation(): void {
    this.cleanup();

    this.timerInterval = setInterval(() => {
      if (this.status === 'connected') {
        this.metrics.uptimeSeconds += 1;
        this.notifyState();
      }
    }, 1000);

    this.trafficInterval = setInterval(() => {
      if (this.status === 'connected') {
        const up = Math.floor(Math.random() * 45000) + 3200;
        const down = Math.floor(Math.random() * 280000) + 12000;
        this.metrics.uploadSpeed = up;
        this.metrics.downloadSpeed = down;
        this.metrics.bytesUp += up;
        this.metrics.bytesDown += down;
        this.metrics.pingMs = Math.max(16, Math.min(150, (this.metrics.pingMs || 32) + Math.floor(Math.random() * 7) - 3));
        this.notifyState();
      }
    }, 1200);
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(new Error('Aborted'));
      const timer = setTimeout(() => resolve(), ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
      });
    });
  }
}

export const vpnTunnelEngine = new VpnTunnelEngine();
