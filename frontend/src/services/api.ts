export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

export interface LogicRule {
  _id: string;
  creator: string;
  name: string;
  description?: string;
  conditions: Record<string, unknown>;
  status: 'pending' | 'active' | 'disabled';
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
  status: 'pending' | 'verified' | 'failed';
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
  const response = await fetch(`${API_BASE}/api/ops/proof/${ruleId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ ...auth }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to request proof' }));
    throw new Error(error.message || 'Failed to request proof');
  }

  return response.json();
};

export const submitProof = async (
  token: string, 
  proofId: string,
  auth: { signature: string; message: string; nonce: string }
): Promise<any> => {
  const response = await fetch(`${API_BASE}/api/ops/proof/submit`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ proofId, ...auth }),
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
