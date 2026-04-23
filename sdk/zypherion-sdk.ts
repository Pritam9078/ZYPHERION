/**
 * Zypherion SDK (Phase 2 Draft)
 * Professional-grade toolkit for Interchain Automation & Logic Attestation.
 */

export interface ZypherionConfig {
  apiKey?: string;
  apiBase: string;
}

export class Zypherion {
  private config: ZypherionConfig;

  constructor(config: ZypherionConfig) {
    this.config = {
      ...config,
      apiBase: config.apiBase.replace(/\/$/, '')
    };
  }

  /**
   * Create a new trustless logic rule.
   */
  async createRule(payload: {
    name: string;
    description: string;
    logic: string;
    targetChain?: string;
    targetContract?: string;
    targetPayload?: string;
    useGasAbstraction?: boolean;
    scheduledAt?: Date;
    recurrenceInterval?: number;
    auth: { signature: string; message: string; nonce: string };
  }) {
    const response = await fetch(`${this.config.apiBase}/api/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        conditions: { logic: payload.logic },
        ...payload.auth
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create rule');
    }

    return response.json();
  }

  /**
   * Fetch all rules owned by the authenticated wallet.
   */
  async getMyRules(token: string) {
    const response = await fetch(`${this.config.apiBase}/api/rules`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  /**
   * Monitor real-time execution status via rule identifier.
   */
  async getRuleStatus(ruleId: string, token: string) {
    const response = await fetch(`${this.config.apiBase}/api/rules/${ruleId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
}

// Example Usage:
// const zyph = new Zypherion({ apiBase: 'https://zypherion-backend.onrender.com' });
// await zyph.createRule({ ... });
