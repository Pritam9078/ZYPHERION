export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001').replace(/\/$/, '');
export const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE || API_BASE.replace('http', 'ws');

export const CONTRACTS = {
  testnet: {
    logicRegistry: 'CCPHWXKVAM74QTLBHSOQAZJDDGHACTY6QMW5SOHSITP4NCLK2PDHFOXE',
    proofVerifier: 'CDTFPR5BX5J77YEZQU5QLI6CYRFREEVE4XTE3K5QDAEG6YAOR6J7CNC6',
    executionRouter: 'CC6ZZ464E3YHRRNFAQ5CXJWA7PLCSLPNQ2SPUQ2LJUSAYB3GZEVU7RTM'
  }
};

export interface LogicRule {
  _id: string;
  creator: string;
  name: string;
  description?: string;
  conditions: Record<string, unknown>;
  status: 'pending' | 'active' | 'disabled';
  automationConfig?: {
    autoExecute: boolean;
    retryDelay?: number;
    maxRetries?: number;
  };
  version?: number;
  targetChain?: string;
  targetContract?: string;
  targetPayload?: string;
  useGasAbstraction?: boolean;
  scheduledAt?: string;
  recurrenceInterval?: number;
  dataSourceUrl?: string;
  dataSourcePath?: string;
  triggerEventSignature?: string;
  triggerContractAddress?: string;
  isMultiSig?: boolean;
  requiredApprovals?: number;
  approvers?: string[];
  createdAt?: string;
}

export interface Operation {
  _id: string;
  ruleId: {
    _id: string;
    name: string;
  } | string;
  submitter: string;
  proofData: string;
  publicSignals?: string[];
  isZK?: boolean;
  status: 'pending' | 'pending_approval' | 'verified' | 'failed';
  txHash?: string;
  createdAt: string;
}

const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const fetchRules = async (token: string): Promise<LogicRule[]> => {
  const response = await fetch(`${API_BASE}/api/rules`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch rules' }));
    throw new Error(error.message || 'Failed to fetch rules');
  }

  return response.json();
};

export const fetchOperations = async (token: string): Promise<Operation[]> => {
  const response = await fetch(`${API_BASE}/api/ops`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch operations' }));
    throw new Error(error.message || 'Failed to fetch operations');
  }

  return response.json();
};

export const createRule = async (
  token: string,
  payload: {
    name: string;
    description?: string;
    conditions: Record<string, unknown>;
    status?: 'pending' | 'active' | 'disabled';
    automationConfig?: any;
    targetChain?: string;
    targetContract?: string;
    targetPayload?: string;
    useGasAbstraction?: boolean;
    scheduledAt?: string;
    recurrenceInterval?: number;
    dataSourceUrl?: string;
    dataSourcePath?: string;
    triggerEventSignature?: string;
    triggerContractAddress?: string;
    isMultiSig?: boolean;
    requiredApprovals?: number;
    approvers?: string[];
    signature: string;
    message: string;
    nonce: string;
  }
): Promise<LogicRule> => {
  const response = await fetch(`${API_BASE}/api/rules`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create rule' }));
    throw new Error(error.message || 'Failed to create rule');
  }

  return response.json();
};

export const requestProof = async (
  token: string, 
  ruleId: string, 
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/ops/proofs/request`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ ruleId, ...auth }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to request proof' }));
    throw new Error(error.message || 'Failed to request proof');
  }

  return response.json();
};

export const submitProof = async (
  token: string, 
  opId: string,
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/ops/proofs/submit`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ opId, ...auth }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to submit proof' }));
    throw new Error(error.message || 'Failed to submit proof');
  }

  return response.json();
};

export const fetchSystemSettings = async (token: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/admin/system/status`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch system status');
  return response.json();
};

export const toggleProtocolHalt = async (
  token: string, 
  halted: boolean,
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/admin/system/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ halted, ...auth }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to toggle protocol' }));
    throw new Error(error.message || 'Failed to toggle protocol');
  }

  return response.json();
};

export const fetchUserDeposits = async (token: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/api/billing`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch deposits' }));
    throw new Error(error.message || 'Failed to fetch deposits');
  }

  return response.json();
};

export const recordDeposit = async (
  token: string,
  payload: { depositAmount: number; txHash: string; currency: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/billing/deposit`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to record deposit' }));
    throw new Error(error.message || 'Failed to record deposit');
  }

  return response.json();
};

export const approveUser = async (
  token: string,
  userId: string,
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ ...auth }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve user' }));
    throw new Error(error.message || 'Failed to approve user');
  }

  return response.json();
};

export const approveDeposit = async (
  token: string,
  depositId: string,
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/admin/deposits/${depositId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ ...auth }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to approve deposit' }));
    throw new Error(error.message || 'Failed to approve deposit');
  }

  return response.json();
};

export const fetchUserProfile = async (token: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  const data = await response.json();
  return data.user;
};

export const updateUserProfile = async (token: string, payload: { name?: string; email?: string; bio?: string; avatar?: string }): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
};

export const regenerateApiKey = async (token: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/auth/regenerate-api-key`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to regenerate API key' }));
    throw new Error(error.message || 'Failed to regenerate API key');
  }

  return response.json();
};
