import { RequestWrapper } from '../RequestWrapper';

export interface DepositPayload {
  depositAmount: number;
  txHash: string;
  currency: string;
}

export class BillingModule {
  constructor(private request: RequestWrapper) {}

  /**
   * Retrieves the deposit history for the authenticated user.
   */
  async getHistory(): Promise<any> {
    const response = await this.request.get('/api/billing');
    return response.data;
  }

  /**
   * Records a new deposit in the system.
   * This should be called after a successful on-chain transaction.
   */
  async recordDeposit(payload: DepositPayload): Promise<any> {
    const response = await this.request.post('/api/billing/deposit', payload);
    return response.data;
  }
}
