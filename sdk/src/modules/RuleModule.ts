import { RequestWrapper } from '../RequestWrapper';

export class RuleModule {
  constructor(private request: RequestWrapper) {}

  async create(name: string, condition: string, action: string) {
    const { data } = await this.request.postSigned('/rules/create', { name, condition, action });
    return data;
  }

  async list() {
    const { data } = await this.request.get('/rules/list');
    return data;
  }
}
