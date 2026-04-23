import { RequestWrapper } from '../RequestWrapper';

export interface ZKOperation {
  _id: string;
  ruleId: string | any;
  submitter: string;
  proofData: string;
  publicSignals?: string[];
  isZK?: boolean;
  status: 'pending' | 'verified' | 'failed';
  txHash?: string;
  createdAt: string;
}

export class ProofModule {
  constructor(private request: RequestWrapper) {}

  /**
   * Generates a Zero-Knowledge Proof (Groth16) for the specified rule.
   * Note: This will trigger the backend ZK Prover engine.
   */
  async generate(ruleId: string): Promise<ZKOperation> {
    const { data } = await this.request.postSigned('/proof/generate', { ruleId });
    return data;
  }

  /**
   * Submits the generated proof to the DNAProof Oracle for on-chain verification.
   */
  async submit(proofId: string): Promise<ZKOperation> {
    const { data } = await this.request.postSigned('/proof/submit', { opId: proofId }); // Fixed 'proofId' param key mismatch -> opId
    return data;
  }

  /**
   * Gets the current status of an operation and retrieves its ZK public signals and proof data.
   */
  async status(proofId: string): Promise<ZKOperation> {
    const { data } = await this.request.get(`/proof/status/${proofId}`);
    return data;
  }
}
