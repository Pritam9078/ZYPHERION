import axios from 'axios';
import { SignatureEngine } from '../signature';

export class AuthModule {
  constructor(private baseUrl: string, private signatureEngine: SignatureEngine) {}

  async authenticate(): Promise<string> {
    const wallet = this.signatureEngine.publicKey;
    
    // 1. Request Message
    const { data: { message, nonce } } = await axios.get(`${this.baseUrl}/auth/request-message?wallet=${wallet}`);
    
    // 2. Sign Message
    const signature = this.signatureEngine.sign(message);
    
    // 3. Verify Signature
    const { data: { token } } = await axios.post(`${this.baseUrl}/auth/verify-signature`, {
      wallet,
      signature,
      message,
      nonce
    });
    
    return token;
  }
}
