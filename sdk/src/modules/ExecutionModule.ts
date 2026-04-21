import { RequestWrapper } from '../RequestWrapper';

export class ExecutionModule {
  constructor(private request: RequestWrapper) {}

  async trigger(ruleId: string) {
    const { data } = await this.request.postSigned('/execute/trigger', { ruleId });
    return data;
  }

  async status(executionId: string) {
    const { data } = await this.request.get(`/execute/status/${executionId}`);
    return data;
  }
}
