import nacl from 'tweetnacl';
import bs58 from 'bs58';

export class SignatureEngine {
  private secretKey: Uint8Array;
  public publicKey: string;

  constructor(secretKeyBase58: string) {
    this.secretKey = bs58.decode(secretKeyBase58);
    const keyPair = nacl.sign.keyPair.fromSecretKey(this.secretKey);
    this.publicKey = bs58.encode(keyPair.publicKey);
  }

  public sign(message: string): string {
    const messageUint8 = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageUint8, this.secretKey);
    return bs58.encode(signature);
  }
}
