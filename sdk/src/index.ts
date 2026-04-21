import { SignatureEngine } from './signature';
import { RequestWrapper } from './RequestWrapper';
import { AuthModule } from './modules/AuthModule';
import { RuleModule } from './modules/RuleModule';
import { ProofModule } from './modules/ProofModule';
import { ExecutionModule } from './modules/ExecutionModule';
import { EventModule } from './modules/EventModule';

export interface ZypherionConfig {
  apiKey?: string; // Optional for now
  network: 'sandbox' | 'mainnet' | 'testnet';
  secretKey: string;
}

export class ZypherionSDK {
  public auth: AuthModule;
  public rules: RuleModule;
  public proofs: ProofModule;
  public execution: ExecutionModule;
  public events: EventModule;
  
  private baseUrl: string;
  private wsUrl: string;
  private signatureEngine: SignatureEngine;
  private requestWrapper: RequestWrapper;
  private jwtToken: string | null = null;

  constructor(config: ZypherionConfig) {
    // API endpoint mapping
    if (config.network === 'sandbox') {
      this.baseUrl = 'http://localhost:5001/v1';
      this.wsUrl = 'ws://localhost:5001';
    } else {
      this.baseUrl = 'https://api.zypherion.io/v1';
      this.wsUrl = 'wss://api.zypherion.io';
    }

    this.signatureEngine = new SignatureEngine(config.secretKey);
    this.requestWrapper = new RequestWrapper(
      this.baseUrl, 
      this.signatureEngine, 
      () => this.jwtToken
    );

    // Initialize modules
    this.auth = new AuthModule(this.baseUrl, this.signatureEngine);
    this.rules = new RuleModule(this.requestWrapper);
    this.proofs = new ProofModule(this.requestWrapper);
    this.execution = new ExecutionModule(this.requestWrapper);
    this.events = new EventModule(this.wsUrl);
    this.events.setRequest(this.requestWrapper);
  }

  public setToken(token: string) {
    this.jwtToken = token;
  }
}
