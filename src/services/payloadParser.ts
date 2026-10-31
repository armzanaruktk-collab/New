/**
 * Direct port and enhancement of parseConnectPayload from SshService.java
 */

export interface ParsedPayloadResult {
  valid: boolean;
  error?: string;
  expandedPayload: string;
  headers: string[];
}

export function parseConnectPayload(
  template: string,
  sshHost: string,
  sshPort: number
): ParsedPayloadResult {
  if (!template || template.trim().length === 0) {
    return {
      valid: false,
      error: 'Payload is empty',
      expandedPayload: '',
      headers: [],
    };
  }

  const userAgent = 'godarmxvpn/1.0';
  const expanded = template
    .replace(/\[host_port\]/g, `${sshHost}:${sshPort}`)
    .replace(/\[host\]/g, sshHost)
    .replace(/\[port\]/g, String(sshPort))
    .replace(/\[ua\]/g, userAgent)
    .replace(/\[crlf\]/g, '\r\n');

  const normalized = expanded.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const headers: string[] = [];
  let firstHeader = 0;

  if (lines.length > 0 && lines[0].trim().length > 0) {
    const request = lines[0].trim();
    const upper = request.toUpperCase();
    if (
      upper.startsWith('POST ') ||
      upper.startsWith('GET ') ||
      upper.startsWith('PATCH ') ||
      upper.startsWith('PUT ') ||
      upper.startsWith('HEAD ')
    ) {
      const method = request.split(' ')[0];
      return {
        valid: false,
        error: `This payload uses ${method}. Current SSH transport supports HTTP CONNECT payloads only. Use a CONNECT request template.`,
        expandedPayload: expanded,
        headers: [],
      };
    }

    if (upper.startsWith('CONNECT ') || upper.startsWith('HTTP/')) {
      firstHeader = 1;
    }
  }

  for (let i = firstHeader; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Android code: if (line.regionMatches(true, 0, "Host:", 0, 5)) continue;
    if (line.toLowerCase().startsWith('host:')) continue;
    if (line.indexOf('\r') >= 0 || line.indexOf('\n') >= 0) {
      return {
        valid: false,
        error: 'Invalid payload header: unexpected newline characters inside header',
        expandedPayload: expanded,
        headers: [],
      };
    }
    if (line.indexOf(':') <= 0) {
      return {
        valid: false,
        error: `Invalid HTTP payload header (missing colon): "${line}"`,
        expandedPayload: expanded,
        headers: [],
      };
    }
    headers.push(line);
  }

  return {
    valid: true,
    expandedPayload: expanded,
    headers,
  };
}

export const PAYLOAD_TEMPLATES = [
  {
    name: 'Standard HTTP CONNECT',
    description: 'Standard HTTP tunnel handshake through proxy',
    proxyHost: '104.16.249.249',
    proxyPort: 80,
    payload:
      'CONNECT [host_port] HTTP/1.1[crlf]Host: [host_port][crlf]User-Agent: [ua][crlf]Connection: Keep-Alive[crlf][crlf]',
  },
  {
    name: 'Cloudflare CDN Fronting',
    description: 'CONNECT tunnel with Cloudflare fronting headers',
    proxyHost: '104.21.5.19',
    proxyPort: 80,
    payload:
      'CONNECT [host_port] HTTP/1.1[crlf]Host: speed.cloudflare.com[crlf]X-Online-Host: speed.cloudflare.com[crlf]X-Forward-Host: speed.cloudflare.com[crlf]User-Agent: [ua][crlf]Proxy-Connection: Keep-Alive[crlf][crlf]',
  },
  {
    name: 'WebSocket Upgrade Tunnel',
    description: 'CONNECT request with Upgrade WebSocket header emulation',
    proxyHost: '172.67.180.120',
    proxyPort: 8080,
    payload:
      'CONNECT [host_port] HTTP/1.1[crlf]Host: [host][crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf][crlf]',
  },
];
