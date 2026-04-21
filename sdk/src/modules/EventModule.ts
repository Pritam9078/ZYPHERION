import WebSocket from 'ws';

export class EventModule {
  private ws: WebSocket | null = null;
  private listeners: Record<string, Function[]> = {};
  private request?: any;

  constructor(private wsUrl: string) {}

  setRequest(request: any) {
    this.request = request;
  }

  connect(walletAddress: string) {
    this.ws = new WebSocket(this.wsUrl);
    
    this.ws.on('open', () => {
      // Send auth or join event as per backend socket implementation
      // Our backend uses `join_protocol`
      if (this.ws?.readyState === WebSocket.OPEN) {
          // Socket.io sends events as JSON array. Standard ws sends raw.
          // Since backend uses socket.io, a pure 'ws' client needs to format it properly.
          // For simplicity in this pure WS stub, assuming a generic WS interface.
          this.ws.send(JSON.stringify({ type: 'join_protocol', payload: walletAddress }));
      }
    });

    this.ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.event && this.listeners[parsed.event]) {
          this.listeners[parsed.event].forEach(cb => cb(parsed.data));
        }
      } catch(e) {}
    });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  async registerWebhook(url: string, events: string[]) {
    if (!this.request) throw new Error('RequestWrapper not set');
    const { data } = await this.request.postSigned('/webhooks/register', { url, events });
    return data;
  }
}
