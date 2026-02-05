interface KodiNotification {
  jsonrpc: '2.0';
  method: string;
  params: {
    sender: string;
    data: unknown;
  };
}

type NotificationHandler = (method: string, data: unknown) => void;

export class KodiWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Set<NotificationHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private _isConnected = false;

  constructor(url: string) {
    this.url = url;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this._isConnected = true;
        this.reconnectDelay = 1000;
        this.notifyHandlers('Internal.OnConnect', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as KodiNotification;
          if (data.method) {
            this.notifyHandlers(data.method, data.params.data);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      this.ws.onclose = () => {
        this._isConnected = false;
        this.notifyHandlers('Internal.OnDisconnect', null);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        // onclose will fire after this, which handles reconnection
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
  }

  onNotification(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notifyHandlers(method: string, data: unknown): void {
    for (const handler of this.handlers) {
      handler(method, data);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }
}

function getWebSocketUrl(): string {
  if (import.meta.env.DEV) {
    const kodiHost =
      (import.meta.env.VITE_KODI_HOST as string | undefined) ?? 'http://localhost:8080';
    const parsed = new URL(kodiHost);
    const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${parsed.hostname}:9090/jsonrpc`;
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.hostname}:9090/jsonrpc`;
}

export const kodiWebSocket = new KodiWebSocket(getWebSocketUrl());
