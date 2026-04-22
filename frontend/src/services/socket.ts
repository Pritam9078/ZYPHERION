import { io, Socket } from 'socket.io-client';
import { WS_BASE } from './api';

class SocketService {
  private static instance: Socket | null = null;
  private static baseUrl: string = WS_BASE;

  public static getSocket(): Socket {
    if (!this.instance) {
      console.log(`[Zypherion] Initializing Shared Telemetry Link: ${this.baseUrl}`);
      this.instance = io(this.baseUrl, {
        transports: ['websocket'], // Force WebSocket for stability
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.instance.on('connect', () => {
        console.log('[Zypherion] Telemetry Link Secured.');
      });

      this.instance.on('disconnect', (reason) => {
        console.warn(`[Zypherion] Telemetry Link Severed: ${reason}`);
      });

      this.instance.on('connect_error', (error) => {
        console.error('[Zypherion] Telemetry Link Error:', error.message);
      });
    }
    return this.instance;
  }

  public static disconnect() {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
  }
}

export default SocketService;
