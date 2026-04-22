import axios, { AxiosInstance } from 'axios';
import { SignatureEngine } from './signature';

export class RequestWrapper {
  private client: AxiosInstance;

  constructor(private baseUrl: string, private signatureEngine: SignatureEngine, private getToken: () => string | null) {
    this.client = axios.create({ baseURL: baseUrl });
  }

  async postSigned(endpoint: string, payload: any = {}) {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    const message = `POST_${endpoint}_${timestamp}_${nonce}`;
    const signature = this.signatureEngine.sign(message);

    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    return this.client.post(endpoint, {
      ...payload,
      wallet: this.signatureEngine.publicKey,
      signature,
      nonce,
      timestamp,
      message
    }, { headers });
  }

  async get(endpoint: string) {
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.client.get(endpoint, { headers });
  }

  async post(endpoint: string, payload: any) {
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.client.post(endpoint, payload, { headers });
  }
}
