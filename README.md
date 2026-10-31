# VPN over SSH (godarmxvpn) - Web React Edition

A web-based rewrite of the Android **VPN over SSH** (`godarmxvpn`) utility. This application allows you to configure, test, and manage dynamic SSH tunnel connections with optional HTTP CONNECT payload injection and SOCKS5 proxy forwarding.

---

## Features

### 1. SSH Server Profile Management (`MainActivity` & `NewConnectionActivity`)
- **Profile Collection**: Create, view, edit, duplicate, and delete named SSH server profiles.
- **Connection Parameters**: Server IP or hostname, SSH port (default 22), username, and authentication mechanism.
- **Authentication**:
  - **Password Authentication**: Standard username & password credentials.
  - **Private Key Authentication**: Paste or upload OpenSSH private keys (RSA / ED25519) with masked preview and security cards.
- **Connection Modes**:
  - `DIRECT`: Direct TCP connection to the remote SSH server.
  - `PAYLOAD`: Tunnels SSH traffic through an HTTP CONNECT proxy with custom headers and SNI fronting.
- **Payload Association**: Links to reusable payload templates without duplicating data.

### 2. Payload Manager (`PayloadManagerActivity`)
- Independent collection of HTTP CONNECT payload templates.
- Configurable **Proxy Host** and **Proxy Port** (e.g. Cloudflare CDN fronting nodes, Squid proxies).
- Multi-line template editor supporting dynamic tags:
  - `[host_port]`: Expands to remote target `<host>:<port>`
  - `[host]`: Expands to remote host
  - `[port]`: Expands to remote port
  - `[ua]`: Expands to `godarmxvpn/1.0`
  - `[crlf]`: Inserts `\r\n` carriage return / line feed
- Syntax validation ensuring only valid `CONNECT` methods are allowed (rejects `GET`/`POST` in adherence to the SSH transport specification).
- Built-in test sandbox to verify header expansion.
- Safe deletion handling: when a payload is deleted, any servers referencing it are cleanly converted to `DIRECT` mode to prevent broken links.

### 3. Connection Controller & Metrics Dashboard
- Big Material toggle button matching Android's primary action button.
- 4-stage connection progression:
  1. Profile & Payload validation
  2. Proxy Transport Handshake (HTTP 200 Connection Established)
  3. SSH Key Exchange & User Authentication
  4. Dynamic SOCKS5 Forwarder (`127.0.0.1:<port>`) & tun2socks virtual interface
- Live statistics: TX/RX bandwidth speeds, total data transferred, ping latency, session duration.
- Copyable SOCKS5 proxy URL (`socks5://127.0.0.1:1080`).

### 4. Settings & Routing Preferences (`SettingsActivity`)
- **VPN Preferences**:
  - Custom DNS Resolver IP (default `1.1.1.1` with VPN bypass routing to avoid DNS loops).
  - Included Apps / Package Filtering: select which applications or domains route through the tunnel vs connect directly.
- **SSH Preferences**:
  - Configurable local forwarder port (default `1080`).
  - Keepalive intervals and connection timeouts.
- **Backup & Portability**:
  - Full configuration export to JSON.
  - Configuration import from JSON backup.
  - Reset to factory seed profiles.

### 5. Real-Time Logcat Console
- Diagnostic terminal stream filtering by log level (`INFO`, `DEBUG`, `WARN`, `ERROR`).
- Tag-based identification (`MainActivity`, `SshService`, `SocksProxyService`, `HTTPProxyData`).
- Auto-scroll, copy logs to clipboard, and clear console actions.

---

## Architecture & Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4 with dark theme matching Android Material Design (`#121212`, `#1E1E1E`, `#03DAC5`, `#BB86FC`)
- **Build System**: Vite 6
- **Icons**: Lucide React
- **State & Storage**: Persistent browser storage (`localStorage`) matching the Android JSON file stores (`ssh_profiles.json`, `payload_profiles.json`).

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```