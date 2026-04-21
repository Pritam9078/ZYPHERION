import { RequestWrapper } from '../RequestWrapper';

export class ProofModule {
  constructor(private request: RequestWrapper) {}

  async generate(ruleId: string) {
    const { data } = await this.request.postSigned('/proof/generate', { ruleId });
    return data;
  }

  async submit(proofId: string) {
    const { data } = await this.request.postSigned('/proof/submit', { proofId });
    return data;
  }

  async status(proofId: string) {
    const { data } = await this.request.get(`/proof/status/${proofId}`);
    return data;
  }
}
